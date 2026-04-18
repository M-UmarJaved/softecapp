import { NextResponse } from "next/server";

import { getGrokClient, GROK_FAST_MODEL, hasGrokKey } from "@/lib/grok";
import { OPPORTUNITY_TYPES, type OpportunityType } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClassifyPayload = {
  emails?: unknown;
};

type EmailInput = {
  emailId: string;
  subject: string;
  body: string;
};

export type ClassificationResult = {
  emailId: string;
  isOpportunity: boolean;
  confidence: number;
  opportunityType: OpportunityType;
};

// ─── Input normalisation ──────────────────────────────────────────────────────

function asEmailInputs(raw: unknown): EmailInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, i) => ({
      // accept both `id` and `emailId` from callers
      emailId:
        typeof item.emailId === "string" ? item.emailId
        : typeof item.id === "string"    ? item.id
        : `email-${i + 1}`,
      subject: typeof item.subject === "string" ? item.subject : "",
      // truncate body to keep token count low for the fast model
      body: typeof item.body === "string" ? item.body.slice(0, 500) : "",
    }))
    .filter((e) => e.subject || e.body);
}

// ─── Heuristic fallback ───────────────────────────────────────────────────────

function heuristicClassify(email: EmailInput): ClassificationResult {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  let opportunityType: OpportunityType = "other";
  let isOpportunity = false;

  if (text.includes("scholar"))                                                    { opportunityType = "scholarship";  isOpportunity = true; }
  else if (text.includes("intern"))                                                { opportunityType = "internship";   isOpportunity = true; }
  else if (text.includes("competition") || text.includes("hackathon") || text.includes("challenge")) { opportunityType = "competition";  isOpportunity = true; }
  else if (text.includes("fellow"))                                                { opportunityType = "fellowship";   isOpportunity = true; }
  else if (text.includes("conference") || text.includes("summit"))                { opportunityType = "conference";   isOpportunity = true; }
  else if (text.includes("grant"))                                                 { opportunityType = "grant";        isOpportunity = true; }
  else if (text.includes("workshop") || text.includes("bootcamp"))                { opportunityType = "workshop";     isOpportunity = true; }
  else if (text.includes("job") || text.includes("hiring") || text.includes("vacancy")) { opportunityType = "job";   isOpportunity = true; }
  else if (text.includes("admission") || text.includes("apply") || text.includes("program")) { opportunityType = "admission"; isOpportunity = true; }
  else if (text.includes("opportunit") || text.includes("deadline"))              { opportunityType = "other";        isOpportunity = true; }

  return { emailId: email.emailId, isOpportunity, confidence: 0.6, opportunityType };
}

function parseJsonArray(content: string): ClassificationResult[] | null {
  // Model should return a bare JSON array per spec
  const firstBracket = content.indexOf("[");
  const lastBracket  = content.lastIndexOf("]");
  if (firstBracket < 0 || lastBracket < 0) return null;

  try {
    const parsed = JSON.parse(content.slice(firstBracket, lastBracket + 1)) as unknown[];
    if (!Array.isArray(parsed)) return null;

    return parsed
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        emailId:         typeof item.emailId === "string"  ? item.emailId  : "",
        isOpportunity:   typeof item.isOpportunity === "boolean" ? item.isOpportunity : false,
        confidence:      typeof item.confidence === "number"     ? item.confidence    : 0.5,
        opportunityType: OPPORTUNITY_TYPES.includes(item.opportunityType as OpportunityType)
          ? (item.opportunityType as OpportunityType)
          : "other",
      }));
  } catch {
    return null;
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let payload: ClassifyPayload;

  try {
    payload = (await request.json()) as ClassifyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const emails = asEmailInputs(payload.emails);

  if (emails.length === 0) {
    return NextResponse.json({ error: "No emails provided." }, { status: 400 });
  }

  if (!hasGrokKey()) {
    return NextResponse.json({
      results: emails.map(heuristicClassify),
      provider: "heuristic-fallback",
    });
  }

  try {
    const client = getGrokClient();

    const completion = await client.chat.completions.create({
      model: GROK_FAST_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          // Exact spec prompt
          content:
            "You are an email classifier. For each email, determine if it contains a genuine student opportunity " +
            "(scholarship, internship, competition, fellowship, admission, conference, grant, workshop, or job). " +
            "Respond ONLY with a JSON array with no markdown. " +
            "Each item: { emailId, isOpportunity: boolean, confidence: 0-1, opportunityType: string }",
        },
        {
          role: "user",
          content: JSON.stringify(emails),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const results = parseJsonArray(content);

    if (!results || results.length === 0) throw new Error("Empty or unparseable response.");

    // Back-fill any emailIds the model may have dropped
    const filled = emails.map((email) => {
      const found = results.find((r) => r.emailId === email.emailId);
      return found ?? heuristicClassify(email);
    });

    return NextResponse.json({ results: filled, provider: "grok" });
  } catch {
    return NextResponse.json({
      results: emails.map(heuristicClassify),
      provider: "heuristic-fallback",
    });
  }
}
