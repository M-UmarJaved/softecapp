import { NextResponse } from "next/server";

import { getGrokClient, GROK_EXTRACTION_MODEL, hasGrokKey } from "@/lib/grok";
import { scoreOpportunity } from "@/lib/scoring";
import { saveSession } from "@/lib/session-store";
import { saveSessionToDb } from "@/lib/db/sessions";
import type {
  ExtractedOpportunitySpec,
  OpportunityScore,
  RawEmail,
  StudentProfileSpec,
} from "@/lib/types";
import { OPPORTUNITY_TYPES } from "@/lib/types";

// ─── Request / response types ─────────────────────────────────────────────────

type AnalyzePayload = {
  emails: RawEmail[];
  profile: StudentProfileSpec;
  useDemoFallback?: boolean;
};

type RankedResult = ExtractedOpportunitySpec & {
  score: OpportunityScore;
  rank: number;
  aiExplanation?: string;
};

type AnalyzeResponse = {
  sessionId: string;
  results: RankedResult[];
  skippedEmails: Array<{ id: string; subject: string; reason: string; confidence: number }>;
  totalOpportunitiesFound: number;
  topOpportunity: string | null;
  generatedAt: string;
  provider: "grok" | "heuristic-fallback";
};

// ─── Build profile-aware extraction prompt ───────────────────────────────────

function buildExtractionPrompt(profile: StudentProfileSpec): string {
  return [
    "You are an expert at extracting structured information from opportunity announcement emails.",
    "You are analyzing emails FOR A SPECIFIC STUDENT — use their profile to guide extraction.",
    "",
    `STUDENT PROFILE:`,
    `- Name: ${profile.name}`,
    `- Degree: ${profile.degree} in ${profile.program}`,
    `- Semester: ${profile.semester}`,
    `- CGPA: ${profile.cgpa.toFixed(2)}`,
    `- Skills: ${profile.skills.join(", ") || "none listed"}`,
    `- Interests: ${profile.interests.join(", ") || "none listed"}`,
    `- Preferred opportunity types: ${profile.opportunityTypes.join(", ")}`,
    `- Location preference: ${profile.locationPreference}`,
    `- Financial need: ${profile.financialNeed}`,
    "",
    "INSTRUCTIONS:",
    "1. Extract ALL available information from the email. If a field is not present, set it to null.",
    "2. Never hallucinate information not present in the email.",
    "3. For opportunityType, classify based on email content: scholarship|internship|competition|fellowship|admission|conference|job|grant|workshop|other",
    "4. For eligibility.skillsRequired, extract skills mentioned in the email and also note which of the student's skills match.",
    "5. For eligibility.degreeRequired, extract degree requirements and check if student's degree qualifies.",
    "6. In extractionWarnings, flag any eligibility mismatches (e.g., 'Student CGPA 3.2 meets minimum 3.0', 'Student degree BS matches requirement', 'Student lacks required skill: research').",
    "7. Set isFullyFunded=true if the email mentions full funding, stipend, or scholarship covering all costs.",
    "",
    "Return ONLY valid JSON matching this exact schema (no markdown, no explanation):",
    JSON.stringify({
      emailId: "string",
      opportunityType: "scholarship|internship|competition|fellowship|admission|conference|job|grant|workshop|other",
      title: "string",
      organization: "string",
      deadline: "string|null (ISO 8601 date, or null)",
      eligibility: {
        minCGPA: "number|null",
        degreeRequired: "string[]",
        semesterRange: { min: "number|null", max: "number|null" },
        skillsRequired: "string[]",
        nationalityRequired: "string|null",
        otherConditions: "string[]",
      },
      requiredDocuments: "string[]",
      benefits: "string (describe stipend amount, funding, perks)",
      applicationLink: "string|null",
      contactEmail: "string|null",
      location: "string (city/country or Remote/Hybrid/Pakistan/International)",
      isFullyFunded: "boolean",
      summary: "string (2 sentences: what the opportunity is + why it may/may not fit this student)",
      extractionWarnings: "string[] (eligibility matches and mismatches for this specific student)",
    }),
  ].join("\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysLeft(deadlineIso: string | null): number | null {
  if (!deadlineIso) return null;
  const d = new Date(deadlineIso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((d.getTime() - Date.now()) / 86_400_000);
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

function asBoolean(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function extractJson(text: string): string {
  // Strip markdown fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const first = text.indexOf("{");
  const last  = text.lastIndexOf("}");
  return first >= 0 && last > first ? text.slice(first, last + 1) : text;
}

function normalizeExtracted(raw: Record<string, unknown>, emailId: string): ExtractedOpportunitySpec {
  const elig = (typeof raw.eligibility === "object" && raw.eligibility !== null
    ? raw.eligibility
    : {}) as Record<string, unknown>;

  const semRange = (typeof elig.semesterRange === "object" && elig.semesterRange !== null
    ? elig.semesterRange
    : {}) as Record<string, unknown>;

  const deadlineRaw = asString(raw.deadline) || null;
  const deadline    = deadlineRaw && !Number.isNaN(new Date(deadlineRaw).getTime())
    ? new Date(deadlineRaw).toISOString()
    : null;

  const type = OPPORTUNITY_TYPES.includes(raw.opportunityType as (typeof OPPORTUNITY_TYPES)[number])
    ? (raw.opportunityType as ExtractedOpportunitySpec["opportunityType"])
    : "other";

  return {
    emailId:                  asString(raw.emailId) || emailId,
    isOpportunity:            true,
    classificationConfidence: 0.9,
    opportunityType:          type,
    title:                    asString(raw.title) || "Untitled Opportunity",
    organization:             asString(raw.organization) || "Unknown Organization",
    deadline,
    deadlineDaysLeft:         daysLeft(deadline),
    eligibility: {
      minCGPA:             asNumber(elig.minCGPA),
      degreeRequired:      toStringArray(elig.degreeRequired),
      semesterRange: {
        min: asNumber(semRange.min),
        max: asNumber(semRange.max),
      },
      skillsRequired:      toStringArray(elig.skillsRequired),
      nationalityRequired: asString(elig.nationalityRequired) || null,
      otherConditions:     toStringArray(elig.otherConditions),
    },
    requiredDocuments: toStringArray(raw.requiredDocuments),
    benefits:          asString(raw.benefits),
    applicationLink:   asString(raw.applicationLink) || null,
    contactEmail:      asString(raw.contactEmail) || null,
    location:          asString(raw.location) || "Unknown",
    isFullyFunded:     asBoolean(raw.isFullyFunded),
    summary:           asString(raw.summary) || "No summary available.",
    extractionWarnings: toStringArray(raw.extractionWarnings),
  };
}

// ─── Heuristic fallback extraction ───────────────────────────────────────────

function heuristicExtract(email: RawEmail): ExtractedOpportunitySpec {
  const text = `${email.subject ?? ""} ${email.body}`.toLowerCase();

  const typeMap: Array<[string[], ExtractedOpportunitySpec["opportunityType"]]> = [
    [["scholar"],                                    "scholarship"],
    [["intern"],                                     "internship"],
    [["competition", "hackathon", "challenge"],      "competition"],
    [["fellow"],                                     "fellowship"],
    [["conference", "summit"],                       "conference"],
    [["grant"],                                      "grant"],
    [["workshop", "bootcamp"],                       "workshop"],
    [["job", "hiring", "vacancy"],                   "job"],
    [["admission", "program"],                       "admission"],
  ];

  let opportunityType: ExtractedOpportunitySpec["opportunityType"] = "other";
  for (const [keywords, type] of typeMap) {
    if (keywords.some((k) => text.includes(k))) { opportunityType = type; break; }
  }

  const urlMatch   = email.body.match(/https?:\/\/[^\s)]+/i);
  const emailMatch = email.body.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const cgpaMatch  = email.body.match(/(?:cgpa|gpa)\s*(?:of|>=|>|min\.?|at least)?\s*([0-4](?:\.\d{1,2})?)/i);

  const deadlinePatterns = [
    /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/,
    /\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})\b/i,
    /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})\b/i,
  ];
  let deadline: string | null = null;
  for (const pat of deadlinePatterns) {
    const m = email.body.match(pat);
    if (m?.[1]) {
      const d = new Date(m[1]);
      if (!Number.isNaN(d.getTime())) { deadline = d.toISOString(); break; }
    }
  }

  return {
    emailId:                  email.id,
    isOpportunity:            true,
    classificationConfidence: 0.6,
    opportunityType,
    title:                    email.subject ?? "Opportunity Email",
    organization:             email.sender?.match(/@([\w.-]+)/)?.[1] ?? "Unknown",
    deadline,
    deadlineDaysLeft:         daysLeft(deadline),
    eligibility: {
      minCGPA:             cgpaMatch?.[1] ? Number(cgpaMatch[1]) : null,
      degreeRequired:      [],
      semesterRange:       { min: null, max: null },
      skillsRequired:      [],
      nationalityRequired: null,
      otherConditions:     [],
    },
    requiredDocuments: [],
    benefits:          "",
    applicationLink:   urlMatch?.[0] ?? null,
    contactEmail:      emailMatch?.[0] ?? null,
    location:          text.includes("remote") ? "Remote"
                     : text.includes("pakistan") ? "Pakistan"
                     : text.includes("international") ? "International"
                     : "Unknown",
    isFullyFunded:     text.includes("fully funded") || text.includes("full scholarship"),
    summary:           email.body.slice(0, 200).trim(),
    extractionWarnings: ["Extracted using heuristic fallback — verify all fields manually."],
  };
}

// ─── Spam / classification ────────────────────────────────────────────────────

// Only very obvious spam patterns — require 2+ hits to flag
const SPAM_SIGNALS = [
  "won a prize", "free macbook", "free iphone", "claim your prize",
  "click here to claim", "you have been selected to receive a free",
  "congratulations! you have won", "claim now",
  "limited offer! act now",
];

// Strong opportunity signals — 1 hit is enough to keep
const STRONG_OPP_SIGNALS = [
  "scholarship", "internship", "fellowship", "deadline", "apply",
  "eligibility", "stipend", "cgpa", "gpa", "semester", "university",
  "hec", "pitb", "google", "ieee", "lums", "nust", "fast", "iba",
  "registration", "application", "program", "award", "grant",
  "competition", "hackathon", "conference", "workshop", "admission",
];

// Trusted sender domains — always legitimate
const TRUSTED_DOMAINS = [
  "hec.gov.pk", "google.com", "ieee.org", "lums.edu.pk", "nust.edu.pk",
  "fast.edu.pk", "iba.edu.pk", "comsats.edu.pk", "uet.edu.pk",
  "pitb.gov.pk", "pasha.org.pk", "linkedin.com", "microsoft.com",
  ".edu", ".gov", ".org", ".ac.pk", ".edu.pk",
];

function isTrustedSender(sender: string): boolean {
  const lower = sender.toLowerCase();
  return TRUSTED_DOMAINS.some((d) => lower.includes(d));
}

type ClassifiedEmail = {
  email: RawEmail;
  isOpportunity: boolean;
  confidence: number;
  reason: string;
};

async function classifyEmails(
  emails: RawEmail[],
  _useFallback: boolean,
): Promise<ClassifiedEmail[]> {
  return emails.map((email): ClassifiedEmail => {
    const text = `${email.subject ?? ""} ${email.body}`.toLowerCase();
    const sender = email.sender ?? "";

    // Trusted sender → always an opportunity
    if (isTrustedSender(sender)) {
      return { email, isOpportunity: true, confidence: 0.95, reason: "Trusted sender domain" };
    }

    const spamHits = SPAM_SIGNALS.filter((s) => text.includes(s)).length;
    const oppHits  = STRONG_OPP_SIGNALS.filter((s) => text.includes(s)).length;

    // Only flag spam if 2+ spam signals AND fewer than 2 opportunity signals
    if (spamHits >= 2 && oppHits < 2) {
      return {
        email, isOpportunity: false,
        confidence: Math.min(0.95, 0.6 + spamHits * 0.1),
        reason: `Spam signals: ${SPAM_SIGNALS.filter((s) => text.includes(s)).join(", ")}`,
      };
    }

    // Has any opportunity signal → keep it
    if (oppHits >= 1) {
      return {
        email, isOpportunity: true,
        confidence: Math.min(0.95, 0.6 + oppHits * 0.05),
        reason: `Opportunity signals: ${STRONG_OPP_SIGNALS.filter((s) => text.includes(s)).slice(0, 4).join(", ")}`,
      };
    }

    // Ambiguous — default to opportunity (better to show than miss)
    return { email, isOpportunity: true, confidence: 0.5, reason: "No clear spam signals — treated as opportunity" };
  });
}

async function extractOne(
  email: RawEmail,
  profile: StudentProfileSpec,
  useFallback: boolean,
): Promise<ExtractedOpportunitySpec> {
  if (!hasGrokKey()) return heuristicExtract(email);

  try {
    const client = getGrokClient();
    const systemPrompt = buildExtractionPrompt(profile);

    const completion = await client.chat.completions.create({
      model: GROK_EXTRACTION_MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            emailId: email.id,
            subject: email.subject,
            sender:  email.sender,
            body:    email.body,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const raw = JSON.parse(extractJson(content)) as Record<string, unknown>;
    return normalizeExtracted(raw, email.id);
  } catch {
    if (!useFallback) throw new Error(`Extraction failed for email ${email.id}`);
    return heuristicExtract(email);
  }
}

// ─── AI explanation for top 3 ─────────────────────────────────────────────────

async function generateExplanation(
  opp: ExtractedOpportunitySpec,
  score: OpportunityScore,
  profile: StudentProfileSpec,
  rank: number,
): Promise<string> {
  if (!hasGrokKey()) return "";

  try {
    const client = getGrokClient();

    const completion = await client.chat.completions.create({
      model: GROK_EXTRACTION_MODEL,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You write concise, personalized opportunity explanations for students. " +
            "Plain text only, no markdown, no bullet points.",
        },
        {
          role: "user",
          content:
            `Given this student profile ${JSON.stringify({ name: profile.name, cgpa: profile.cgpa, skills: profile.skills, degree: profile.degree, program: profile.program })} ` +
            `and this opportunity ${JSON.stringify({ title: opp.title, organization: opp.organization, deadline: opp.deadline, deadlineDaysLeft: opp.deadlineDaysLeft, eligibility: opp.eligibility })} ` +
            `with score ${score.totalScore}, ` +
            `write a 3-sentence personalized explanation of why this opportunity is ranked #${rank} for this student. ` +
            `Be specific. Mention their CGPA, skills, and deadline. Plain text, no markdown.`,
        },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() ?? "";
  } catch {
    return "";
  }
}

// ─── Input validation ─────────────────────────────────────────────────────────

function validatePayload(payload: unknown): { emails: RawEmail[]; profile: StudentProfileSpec; useDemoFallback: boolean } | { error: string } {
  if (typeof payload !== "object" || payload === null) return { error: "Invalid payload." };
  const p = payload as Record<string, unknown>;

  if (!Array.isArray(p.emails) || p.emails.length < 1) return { error: "emails must be a non-empty array." };
  if (p.emails.length < 5) return { error: "Please provide at least 5 emails for a meaningful analysis. Add more emails and try again." };
  if (p.emails.length > 15) return { error: "Maximum 15 emails per request." };
  if (typeof p.profile !== "object" || p.profile === null) return { error: "profile is required." };

  const emails = (p.emails as unknown[])
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    .map((e, i) => ({
      id:          typeof e.id === "string"          ? e.id          : `email-${i + 1}`,
      subject:     typeof e.subject === "string"     ? e.subject     : "",
      body:        typeof e.body === "string"        ? e.body        : "",
      sender:      typeof e.sender === "string"      ? e.sender      : undefined,
      receivedDate: typeof e.receivedDate === "string" ? e.receivedDate : undefined,
    } satisfies RawEmail));

  const prof = p.profile as Record<string, unknown>;
  const profile: StudentProfileSpec = {
    name:               asString(prof.name, "Student"),
    university:         asString(prof.university, "University"),
    degree:             (["BS","MS","PhD","BBA","MBA","Other"].includes(asString(prof.degree)) ? asString(prof.degree) : "BS") as StudentProfileSpec["degree"],
    program:            asString(prof.program, "Computer Science"),
    semester:           typeof prof.semester === "number" ? prof.semester : 5,
    cgpa:               typeof prof.cgpa === "number" ? prof.cgpa : 3.0,
    skills:             toStringArray(prof.skills),
    interests:          toStringArray(prof.interests),
    opportunityTypes:   toStringArray(prof.opportunityTypes).filter((t) => OPPORTUNITY_TYPES.includes(t as (typeof OPPORTUNITY_TYPES)[number])) as StudentProfileSpec["opportunityTypes"],
    financialNeed:      (["none","low","medium","high"].includes(asString(prof.financialNeed)) ? asString(prof.financialNeed) : "none") as StudentProfileSpec["financialNeed"],
    locationPreference: (["local","national","international","remote","any"].includes(asString(prof.locationPreference)) ? asString(prof.locationPreference) : "any") as StudentProfileSpec["locationPreference"],
    pastExperience:     toStringArray(prof.pastExperience),
    availableFrom:      asString(prof.availableFrom, new Date().toISOString()),
  };

  return { emails, profile, useDemoFallback: asBoolean(p.useDemoFallback, true) };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validated = validatePayload(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { emails, profile, useDemoFallback } = validated;

  try {
    // 1. Classify all emails — detect spam before extraction
    const classified = await classifyEmails(emails, useDemoFallback);
    const opportunityEmails = classified.filter((c) => c.isOpportunity).map((c) => c.email);
    const skippedEmails = classified
      .filter((c) => !c.isOpportunity)
      .map((c) => ({
        id:         c.email.id,
        subject:    c.email.subject ?? "No subject",
        reason:     c.reason,
        confidence: c.confidence,
      }));

    // 2. Extract only genuine opportunity emails
    const extracted = await Promise.all(
      opportunityEmails.map((email) => extractOne(email, profile, useDemoFallback)),
    );

    // 3. Score each with the deterministic engine
    const scored = extracted.map((opp) => ({
      opp,
      score: scoreOpportunity(opp, profile),
    }));

    // 4. Sort by totalScore desc, then urgency asc
    scored.sort((a, b) => {
      if (b.score.totalScore !== a.score.totalScore) return b.score.totalScore - a.score.totalScore;
      const aD = a.opp.deadlineDaysLeft ?? Infinity;
      const bD = b.opp.deadlineDaysLeft ?? Infinity;
      return aD - bD;
    });

    // 5. Generate AI explanations for top 3 in parallel
    const withExplanations = await Promise.all(
      scored.map(async ({ opp, score }, index) => {
        const rank = index + 1;
        const aiExplanation =
          rank <= 3 ? await generateExplanation(opp, score, profile, rank) : undefined;

        return { ...opp, score, rank, aiExplanation } satisfies RankedResult;
      }),
    );

    const sessionId = crypto.randomUUID();
    const topOpportunity = withExplanations[0]?.emailId ?? null;

    // 6. Build the session data including skipped emails
    const sessionData = {
      opportunities: withExplanations.map((r) => ({
        id:              r.emailId,
        sourceEmailId:   r.emailId,
        title:           r.title,
        organization:    r.organization,
        opportunityType: r.opportunityType,
        location:        r.location as "pakistan" | "remote" | "international" | "hybrid" | "unknown",
        summary:         r.summary,
        deadlineIso:     r.deadline,
        applicationLink: r.applicationLink,
        minCgpa:         r.eligibility.minCGPA,
        eligibleMajors:  r.eligibility.degreeRequired,
        requiredSkills:  r.eligibility.skillsRequired,
        requiredDocuments: r.requiredDocuments,
        benefits:        r.benefits ? [r.benefits] : [],
        confidence:      r.classificationConfidence,
        signals:         r.extractionWarnings,
        rank:            r.rank,
        urgencyDays:     r.deadlineDaysLeft,
        completenessRatio: r.score.breakdown.completeness / 20,
        scoreBreakdown: {
          profileFit:   r.score.breakdown.profileFit,
          urgency:      r.score.breakdown.urgency,
          completeness: r.score.breakdown.completeness,
          total:        r.score.totalScore,
        },
        reasons:         r.score.reasons,
        actionChecklist: r.score.actionChecklist.map((item) => ({
          id:       `${r.emailId}-step-${item.step}`,
          task:     item.action,
          evidence: item.deadline ?? "",
        })),
        aiExplanation:   r.aiExplanation,
      })),
      skippedEmails,
      extractedCount: opportunityEmails.length,
      generatedAt:    new Date().toISOString(),
      provider:       hasGrokKey() ? "grok" as const : "heuristic-fallback" as const,
      summary: {
        generatedAt:         new Date().toISOString(),
        provider:            hasGrokKey() ? "grok" as const : "heuristic-fallback" as const,
        totalEmails:         emails.length,
        totalOpportunities:  withExplanations.length,
        topScore:            withExplanations[0]?.score.totalScore ?? 0,
        avgScore:            withExplanations.length
          ? Math.round(withExplanations.reduce((s, r) => s + r.score.totalScore, 0) / withExplanations.length)
          : 0,
      },
    };

    saveSession(sessionId, sessionData);

    // Persist to Supabase — fire-and-forget, never blocks the response
    saveSessionToDb({
      sessionId,
      profile,
      emails,
      results:            { opportunities: sessionData.opportunities, skippedEmails },
      totalOpportunities: withExplanations.length,
      topOpportunityId:   topOpportunity,
    }).catch((err: unknown) => {
      console.warn("[analyze] DB persist failed (non-fatal):", err instanceof Error ? err.message : err);
    });

    const response: AnalyzeResponse = {
      sessionId,
      results:                 withExplanations,
      skippedEmails,
      totalOpportunitiesFound: withExplanations.length,
      topOpportunity,
      generatedAt:             new Date().toISOString(),
      provider:                hasGrokKey() ? "grok" : "heuristic-fallback",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
