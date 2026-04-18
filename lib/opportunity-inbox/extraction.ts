import OpenAI from "openai";

import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_LOCATIONS,
  type DegreeLevel,
  type ExtractedOpportunity,
  type OpportunityLocation,
  type OpportunityType,
  type RawOpportunityEmail,
  type StudentProfile,
} from "@/lib/opportunity-inbox/types";

const GROK_EXTRACTION_MODEL = "grok-3";       // high-quality: main extraction call
const GROK_FAST_MODEL = "grok-3-mini";        // fast/cheap: classification fallback
const DEFAULT_GROK_BASE_URL = "https://api.x.ai/v1";

type ExtractWithGrokResult = {
  opportunities: ExtractedOpportunity[];
  provider: "grok" | "heuristic-fallback";
};

const MONTH_PATTERN =
  /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)/i;

const DOCUMENT_KEYWORDS = [
  "cv",
  "resume",
  "transcript",
  "statement of purpose",
  "sop",
  "recommendation letter",
  "portfolio",
  "cover letter",
  "passport",
  "cnic",
] as const;

const SKILL_KEYWORDS = [
  "python",
  "javascript",
  "typescript",
  "react",
  "next.js",
  "machine learning",
  "data analysis",
  "deep learning",
  "sql",
  "problem solving",
  "leadership",
  "communication",
  "research",
  "ui/ux",
  "design",
  "cloud",
  "cybersecurity",
] as const;

const BENEFIT_KEYWORDS = [
  "stipend",
  "funding",
  "scholarship",
  "certificate",
  "mentorship",
  "networking",
  "full tuition",
  "travel grant",
  "accommodation",
  "job offer",
] as const;

const MAJOR_KEYWORDS = [
  "computer science",
  "software engineering",
  "electrical engineering",
  "mechanical engineering",
  "business",
  "economics",
  "data science",
  "artificial intelligence",
  "information technology",
  "mathematics",
  "physics",
] as const;

function uniq(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function normalizeType(value: string): OpportunityType {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("scholar")) {
    return "scholarship";
  }

  if (normalized.includes("intern")) {
    return "internship";
  }

  if (normalized.includes("competition") || normalized.includes("hackathon") || normalized.includes("challenge")) {
    return "competition";
  }

  if (normalized.includes("fellow")) {
    return "fellowship";
  }

  if (normalized.includes("admission") || normalized.includes("apply") || normalized.includes("program")) {
    return "admission";
  }

  return OPPORTUNITY_TYPES.includes(normalized as OpportunityType)
    ? (normalized as OpportunityType)
    : "other";
}

function normalizeLocation(value: string): OpportunityLocation {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("remote")) {
    return "remote";
  }

  if (normalized.includes("hybrid")) {
    return "hybrid";
  }

  if (
    normalized.includes("lahore") ||
    normalized.includes("karachi") ||
    normalized.includes("islamabad") ||
    normalized.includes("pakistan")
  ) {
    return "pakistan";
  }

  if (
    normalized.includes("international") ||
    normalized.includes("global") ||
    normalized.includes("abroad") ||
    normalized.includes("usa") ||
    normalized.includes("uk")
  ) {
    return "international";
  }

  return OPPORTUNITY_LOCATIONS.includes(normalized as OpportunityLocation)
    ? (normalized as OpportunityLocation)
    : "unknown";
}

function parseSenderOrganization(sender: string) {
  const emailMatch = sender.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i);

  if (!emailMatch) {
    return "Unknown Organization";
  }

  const domain = emailMatch[1]?.toLowerCase() ?? "unknown.org";
  const withoutTld = domain.split(".")[0] ?? domain;
  const cleaned = withoutTld.replace(/[-_]/g, " ");

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function extractFirstUrl(text: string) {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match?.[0] ?? null;
}

function extractMinCgpa(text: string) {
  const match = text.match(/(?:cgpa|gpa)\s*(?:of|>=|>|minimum|min\.?|at least)?\s*([0-4](?:\.\d{1,2})?)/i);

  if (!match?.[1]) {
    return null;
  }

  const numeric = Number(match[1]);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseDateCandidate(candidate: string) {
  const sanitized = candidate.replace(/(st|nd|rd|th)/gi, "").trim();
  const parsed = new Date(sanitized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function extractDeadlineIso(text: string) {
  const datePatterns = [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    new RegExp(`\\b\\d{1,2}\\s+${MONTH_PATTERN.source}\\s+\\d{2,4}\\b`, "gi"),
    new RegExp(`\\b${MONTH_PATTERN.source}\\s+\\d{1,2},?\\s+\\d{2,4}\\b`, "gi"),
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern) ?? [];

    for (const match of matches) {
      const parsed = parseDateCandidate(match);

      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

function extractKeywordMatches(text: string, keywords: readonly string[]) {
  const normalized = text.toLowerCase();
  return keywords.filter((keyword) => normalized.includes(keyword));
}

function detectTypeFromText(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("scholar")) {
    return "scholarship" as const;
  }

  if (normalized.includes("intern")) {
    return "internship" as const;
  }

  if (
    normalized.includes("competition") ||
    normalized.includes("hackathon") ||
    normalized.includes("challenge")
  ) {
    return "competition" as const;
  }

  if (normalized.includes("fellow")) {
    return "fellowship" as const;
  }

  if (normalized.includes("admission") || normalized.includes("program")) {
    return "admission" as const;
  }

  return "other" as const;
}

function detectLocationFromText(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("remote")) {
    return "remote" as const;
  }

  if (normalized.includes("hybrid")) {
    return "hybrid" as const;
  }

  if (
    normalized.includes("pakistan") ||
    normalized.includes("lahore") ||
    normalized.includes("karachi") ||
    normalized.includes("islamabad")
  ) {
    return "pakistan" as const;
  }

  if (
    normalized.includes("international") ||
    normalized.includes("global") ||
    normalized.includes("abroad") ||
    normalized.includes("usa") ||
    normalized.includes("uk")
  ) {
    return "international" as const;
  }

  return "unknown" as const;
}

function heuristicExtractFromEmail(email: RawOpportunityEmail): ExtractedOpportunity {
  const combined = `${email.subject}\n${email.body}`;
  const type = detectTypeFromText(combined);
  const location = detectLocationFromText(combined);

  const requiredDocuments = uniq(extractKeywordMatches(combined, DOCUMENT_KEYWORDS));
  const requiredSkills = uniq(extractKeywordMatches(combined, SKILL_KEYWORDS));
  const benefits = uniq(extractKeywordMatches(combined, BENEFIT_KEYWORDS));
  const eligibleMajors = uniq(extractKeywordMatches(combined, MAJOR_KEYWORDS));

  const title = email.subject.trim() || `${type[0]?.toUpperCase() ?? "O"}${type.slice(1)} Opportunity`;
  const summary = email.body.slice(0, 450).trim() || "Opportunity content extracted from email.";

  const populatedFields = [
    title,
    parseSenderOrganization(email.sender),
    extractDeadlineIso(combined),
    extractFirstUrl(combined),
    requiredDocuments.length > 0 ? "docs" : "",
    requiredSkills.length > 0 ? "skills" : "",
    benefits.length > 0 ? "benefits" : "",
  ].filter(Boolean).length;

  const confidence = Math.min(0.9, 0.35 + populatedFields * 0.08);

  return {
    id: crypto.randomUUID(),
    sourceEmailId: email.id,
    title,
    organization: parseSenderOrganization(email.sender),
    opportunityType: type,
    location,
    summary,
    deadlineIso: extractDeadlineIso(combined),
    applicationLink: extractFirstUrl(combined),
    minCgpa: extractMinCgpa(combined),
    eligibleMajors,
    requiredSkills,
    requiredDocuments,
    benefits,
    confidence: Number(confidence.toFixed(2)),
    signals: [
      `Heuristic classification based on keyword detection for type=${type}.`,
      `Detected ${requiredSkills.length} skill keyword(s), ${requiredDocuments.length} document keyword(s).`,
    ],
  };
}

function resolveApiKey() {
  return process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.OPENAI_API_KEY || "";
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

function normalizeParsedOpportunity(
  item: Record<string, unknown>,
  index: number,
  emails: RawOpportunityEmail[],
): ExtractedOpportunity {
  const sourceEmailIdRaw = typeof item.sourceEmailId === "string" ? item.sourceEmailId : "";
  const sourceEmailId =
    emails.find((email) => email.id === sourceEmailIdRaw)?.id ?? emails[index]?.id ?? emails[0]?.id ?? "email-unknown";

  const title = typeof item.title === "string" && item.title.trim()
    ? item.title.trim()
    : `Opportunity ${index + 1}`;

  const confidenceRaw = typeof item.confidence === "number" ? item.confidence : 0.62;
  const confidence = Math.min(Math.max(confidenceRaw, 0), 1);

  const deadlineCandidate = typeof item.deadlineIso === "string" ? item.deadlineIso : null;
  const deadlineIso = deadlineCandidate && !Number.isNaN(new Date(deadlineCandidate).getTime())
    ? new Date(deadlineCandidate).toISOString()
    : null;

  const toStringArray = (value: unknown) => {
    if (!Array.isArray(value)) {
      return [] as string[];
    }

    return uniq(
      value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.slice(0, 120)),
    );
  };

  const opportunityType = normalizeType(typeof item.opportunityType === "string" ? item.opportunityType : "other");
  const location = normalizeLocation(typeof item.location === "string" ? item.location : "unknown");

  return {
    id: crypto.randomUUID(),
    sourceEmailId,
    title,
    organization:
      typeof item.organization === "string" && item.organization.trim()
        ? item.organization.trim()
        : "Unknown Organization",
    opportunityType,
    location,
    summary:
      typeof item.summary === "string" && item.summary.trim()
        ? item.summary.trim()
        : "No summary extracted from the email.",
    deadlineIso,
    applicationLink:
      typeof item.applicationLink === "string" && item.applicationLink.trim()
        ? item.applicationLink.trim()
        : null,
    minCgpa: typeof item.minCgpa === "number" ? item.minCgpa : null,
    eligibleMajors: toStringArray(item.eligibleMajors),
    requiredSkills: toStringArray(item.requiredSkills),
    requiredDocuments: toStringArray(item.requiredDocuments),
    benefits: toStringArray(item.benefits),
    confidence: Number(confidence.toFixed(2)),
    signals: toStringArray(item.signals),
  };
}

function toCompactProfileSummary(profile: StudentProfile) {
  return {
    degreeLevel: profile.degreeLevel,
    major: profile.major,
    semester: profile.semester,
    cgpa: profile.cgpa,
    targetOpportunityTypes: profile.targetOpportunityTypes,
    preferredLocations: profile.preferredLocations,
    skills: profile.skills,
    interests: profile.interests,
    availabilityHoursPerWeek: profile.availabilityHoursPerWeek,
    needsFinancialAid: profile.needsFinancialAid,
    graduationYear: profile.graduationYear,
  };
}

export async function extractOpportunities(
  emails: RawOpportunityEmail[],
  profile: StudentProfile,
  useDemoFallback = true,
): Promise<ExtractWithGrokResult> {
  const apiKey = resolveApiKey();

  if (!apiKey) {
    return {
      opportunities: emails.map(heuristicExtractFromEmail),
      provider: "heuristic-fallback",
    };
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.GROK_BASE_URL || DEFAULT_GROK_BASE_URL,
  });

  try {
    // Use grok-3 for the main extraction call (higher quality JSON output)
    const model = process.env.GROK_MODEL || GROK_EXTRACTION_MODEL;

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: [
            "You are an extraction engine for opportunity emails.",
            "Return only one valid JSON object with this exact top-level shape:",
            '{"opportunities": [{"sourceEmailId": string, "title": string, "organization": string, "opportunityType": "scholarship|internship|competition|fellowship|admission|other", "location": "pakistan|remote|international|hybrid|unknown", "summary": string, "deadlineIso": string|null, "applicationLink": string|null, "minCgpa": number|null, "eligibleMajors": string[], "requiredSkills": string[], "requiredDocuments": string[], "benefits": string[], "confidence": number, "signals": string[]}]}',
            "Do not include markdown code fences.",
            "Do not score opportunities.",
            "Use sourceEmailId exactly from input.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              profile: toCompactProfileSummary(profile),
              emails,
            },
            null,
            2,
          ),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response content.");
    }

    const jsonText = extractJsonObject(content);
    const parsed = JSON.parse(jsonText) as { opportunities?: Array<Record<string, unknown>> };

    if (!Array.isArray(parsed.opportunities)) {
      throw new Error("AI response missing opportunities array.");
    }

    const opportunities = parsed.opportunities
      .map((item, index) => normalizeParsedOpportunity(item, index, emails))
      .slice(0, emails.length);

    if (opportunities.length === 0) {
      throw new Error("No opportunities extracted from AI response.");
    }

    return {
      opportunities,
      provider: "grok",
    };
  } catch (error) {
    if (!useDemoFallback) {
      throw error;
    }

    return {
      opportunities: emails.map(heuristicExtractFromEmail),
      provider: "heuristic-fallback",
    };
  }
}

export function normalizeEmailsInput(rawEmails: RawOpportunityEmail[]) {
  return rawEmails.map((email, index) => {
    const body = email.body.trim();
    const subject = email.subject.trim() || `Opportunity Email ${index + 1}`;
    const sender = email.sender.trim() || "unknown@source.local";
    const receivedAt = email.receivedAt.trim() || new Date().toISOString();

    return {
      id: email.id.trim() || `email-${index + 1}`,
      subject,
      sender,
      receivedAt,
      body,
    } satisfies RawOpportunityEmail;
  });
}

export function normalizeDegreeLevel(value: string): DegreeLevel {
  const normalized = value.trim().toLowerCase();

  if (normalized === "masters") {
    return "masters";
  }

  if (normalized === "phd") {
    return "phd";
  }

  return "bachelors";
}
