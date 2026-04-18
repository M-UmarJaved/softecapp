import { NextResponse } from "next/server";

import {
  extractOpportunities,
  normalizeDegreeLevel,
  normalizeEmailsInput,
} from "@/lib/opportunity-inbox/extraction";
import { saveSession } from "@/lib/session-store";
import { rankOpportunities } from "@/lib/opportunity-inbox/scoring";
import {
  OPPORTUNITY_LOCATIONS,
  OPPORTUNITY_TYPES,
  type OpportunityLocation,
  type OpportunityType,
  type RawOpportunityEmail,
  type StudentProfile,
} from "@/lib/opportunity-inbox/types";

type AnalyzePayload = {
  emails?: unknown;
  profile?: unknown;
  useDemoFallback?: unknown;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

declare global {
  var __opportunityApiRateLimit: Map<string, RateLimitState> | undefined;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

const rateStore = globalThis.__opportunityApiRateLimit ?? new Map<string, RateLimitState>();
globalThis.__opportunityApiRateLimit = rateStore;

function getClientId(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

function applyRateLimit(clientId: string) {
  const now = Date.now();

  for (const [key, state] of rateStore.entries()) {
    if (state.resetAt <= now) {
      rateStore.delete(key);
    }
  }

  const current = rateStore.get(clientId);

  if (!current || current.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateStore.set(clientId, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt,
    };
  }

  current.count += 1;
  rateStore.set(clientId, current);

  if (current.count > RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, RATE_LIMIT_MAX - current.count),
    resetAt: current.resetAt,
  };
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return fallback;
}

function normalizeOpportunityTypes(value: unknown): OpportunityType[] {
  const values = asStringArray(value)
    .map((entry) => entry.toLowerCase())
    .filter((entry): entry is OpportunityType => OPPORTUNITY_TYPES.includes(entry as OpportunityType));

  return values.length > 0 ? values : (["internship", "scholarship"] as OpportunityType[]);
}

function normalizeLocations(value: unknown): OpportunityLocation[] {
  const values = asStringArray(value)
    .map((entry) => entry.toLowerCase())
    .filter(
      (entry): entry is OpportunityLocation => OPPORTUNITY_LOCATIONS.includes(entry as OpportunityLocation),
    );

  return values.length > 0 ? values : (["pakistan", "remote"] as OpportunityLocation[]);
}

function normalizeProfile(raw: unknown): StudentProfile {
  const profile = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  const skills = asStringArray(profile.skills)
    .map((entry) => entry.toLowerCase())
    .slice(0, 20);

  const interests = asStringArray(profile.interests)
    .map((entry) => entry.toLowerCase())
    .slice(0, 20);

  const graduationYear = Math.round(asNumber(profile.graduationYear, new Date().getFullYear() + 2));

  return {
    fullName: asString(profile.fullName, "Student").slice(0, 80),
    university: asString(profile.university, "FAST-NUCES").slice(0, 120),
    degreeLevel: normalizeDegreeLevel(asString(profile.degreeLevel, "bachelors")),
    major: asString(profile.major, "Computer Science").slice(0, 120),
    semester: Math.round(Math.min(Math.max(asNumber(profile.semester, 5), 1), 16)),
    cgpa: Math.min(Math.max(asNumber(profile.cgpa, 3), 0), 4),
    graduationYear: Math.min(Math.max(graduationYear, new Date().getFullYear()), new Date().getFullYear() + 10),
    targetOpportunityTypes: normalizeOpportunityTypes(profile.targetOpportunityTypes),
    preferredLocations: normalizeLocations(profile.preferredLocations),
    skills,
    interests,
    availabilityHoursPerWeek: Math.min(Math.max(asNumber(profile.availabilityHoursPerWeek, 10), 1), 80),
    needsFinancialAid: asBoolean(profile.needsFinancialAid, false),
  };
}

function normalizeEmails(raw: unknown): RawOpportunityEmail[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const parsed = raw
    .map((item, index) => {
      const record = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;

      return {
        id: asString(record.id, `email-${index + 1}`),
        subject: asString(record.subject, ""),
        sender: asString(record.sender, ""),
        receivedAt: asString(record.receivedAt, ""),
        body: asString(record.body, ""),
      } satisfies RawOpportunityEmail;
    })
    .filter((email) => email.body.trim().length > 0);

  return normalizeEmailsInput(parsed);
}

export async function POST(request: Request) {
  const rate = applyRateLimit(getClientId(request));

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Try again shortly.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
          "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  let payload: AnalyzePayload;

  try {
    payload = (await request.json()) as AnalyzePayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      {
        status: 400,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }

  const emails = normalizeEmails(payload.emails);

  if (emails.length < 5 || emails.length > 15) {
    return NextResponse.json(
      {
        error: "Please provide between 5 and 15 emails.",
      },
      {
        status: 400,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }

  const profile = normalizeProfile(payload.profile);
  const useDemoFallback = asBoolean(payload.useDemoFallback, true);

  try {
    const extraction = await extractOpportunities(emails, profile, useDemoFallback);
    const ranked = rankOpportunities(extraction.opportunities, profile);
    const totalScore = ranked.reduce((sum, item) => sum + item.scoreBreakdown.total, 0);

    const sessionId = crypto.randomUUID();
    const responseData = {
      opportunities: ranked,
      extractedCount: extraction.opportunities.length,
      generatedAt: new Date().toISOString(),
      provider: extraction.provider,
      summary: {
        generatedAt: new Date().toISOString(),
        provider: extraction.provider,
        totalEmails: emails.length,
        totalOpportunities: ranked.length,
        avgScore: ranked.length ? Number((totalScore / ranked.length).toFixed(2)) : 0,
        topScore: ranked[0]?.scoreBreakdown.total ?? 0,
      },
    };

    saveSession(sessionId, responseData);

    return NextResponse.json(
      { ...responseData, sessionId },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze opportunities.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 502,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }
}
