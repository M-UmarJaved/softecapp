/**
 * Deterministic scoring engine — pure TypeScript, zero AI calls.
 * Implements the exact Section 05 spec: 40 + 30 + 20 + 10 = 100 points.
 *
 * Works with the richer Section 04 spec types:
 *   ExtractedOpportunitySpec + StudentProfileSpec → OpportunityScore
 */

import type {
  ActionItem,
  ExtractedOpportunitySpec,
  OpportunityScore,
  StudentProfileSpec,
} from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function tok(s: string): string {
  return s.trim().toLowerCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}

function subtractDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() - days);
  return formatDate(d.toISOString());
}

// ─── Profile Fit (0–40) ───────────────────────────────────────────────────────

function scoreProfileFit(
  opp: ExtractedOpportunitySpec,
  profile: StudentProfileSpec,
): { score: number; reasons: string[]; matchedSkills: string[]; missingRequirements: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const matchedSkills: string[] = [];
  const missingRequirements: string[] = [];

  // ── Opportunity type match — 12pts (CORE preference factor) ──────────────
  // This is the most important preference: if the student doesn't want this type, score drops hard
  const typeMatch = profile.opportunityTypes.includes(opp.opportunityType);
  if (typeMatch) {
    score += 12;
    reasons.push(`✓ ${opp.opportunityType.charAt(0).toUpperCase() + opp.opportunityType.slice(1)} is in your preferred opportunity types (+12).`);
  } else if (profile.opportunityTypes.length === 0) {
    score += 6;
    reasons.push(`No opportunity type preference set — partial credit (+6).`);
  } else {
    // Type mismatch — only 2pts, this opportunity is not what the student wants
    score += 2;
    reasons.push(`✗ ${opp.opportunityType} is NOT in your preferred types (${profile.opportunityTypes.join(", ")}) — low priority (+2).`);
    missingRequirements.push(`Type mismatch: you want ${profile.opportunityTypes.join("/")} but this is a ${opp.opportunityType}`);
  }

  // ── CGPA match — 10pts ────────────────────────────────────────────────────
  const { minCGPA } = opp.eligibility;
  if (minCGPA === null) {
    score += 10;
    reasons.push(`✓ No minimum CGPA requirement (+10).`);
  } else if (profile.cgpa >= minCGPA) {
    score += 10;
    reasons.push(`✓ Your CGPA ${profile.cgpa.toFixed(2)} meets the minimum of ${minCGPA.toFixed(2)} (+10).`);
  } else if (profile.cgpa >= minCGPA - 0.3) {
    score += 5;
    reasons.push(`⚠ Your CGPA ${profile.cgpa.toFixed(2)} is slightly below the minimum ${minCGPA.toFixed(2)} (+5).`);
    missingRequirements.push(`CGPA slightly below minimum (need ${minCGPA.toFixed(2)}, have ${profile.cgpa.toFixed(2)})`);
  } else {
    score += 0;
    reasons.push(`✗ Your CGPA ${profile.cgpa.toFixed(2)} does not meet the minimum ${minCGPA.toFixed(2)} (+0).`);
    missingRequirements.push(`CGPA below minimum (need ${minCGPA.toFixed(2)}, have ${profile.cgpa.toFixed(2)})`);
  }

  // ── Degree match — 8pts ───────────────────────────────────────────────────
  const { degreeRequired } = opp.eligibility;
  if (degreeRequired.length === 0) {
    score += 8;
    reasons.push(`✓ Open to all degree levels (+8).`);
  } else if (degreeRequired.map(tok).some((d) => d.includes(tok(profile.degree)) || tok(profile.degree).includes(d))) {
    score += 8;
    reasons.push(`✓ Your ${profile.degree} degree matches the requirement (+8).`);
  } else {
    score += 0;
    reasons.push(`✗ Your degree (${profile.degree}) does not match required: ${degreeRequired.join(", ")} (+0).`);
    missingRequirements.push(`Degree mismatch (requires ${degreeRequired.join(" or ")})`);
  }

  // ── Skills overlap — 10pts ────────────────────────────────────────────────
  const required = opp.eligibility.skillsRequired.map(tok);
  const profileSkills = profile.skills.map(tok);

  if (required.length === 0) {
    score += 6;
    reasons.push(`✓ No specific skills required (+6).`);
  } else {
    const matched = required.filter((req) =>
      profileSkills.some((s) => s.includes(req) || req.includes(s)),
    );
    const missing = required.filter((req) =>
      !profileSkills.some((s) => s.includes(req) || req.includes(s)),
    );

    matched.forEach((s) => matchedSkills.push(s));
    missing.forEach((s) => missingRequirements.push(`Missing skill: ${s}`));

    const skillScore = clamp(Math.round((matched.length / Math.max(required.length, 1)) * 10), 0, 10);
    score += skillScore;

    if (matched.length > 0) {
      reasons.push(`✓ Skills matched: ${matched.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")} (${matched.length}/${required.length}) (+${skillScore}).`);
    }
    if (missing.length > 0) {
      reasons.push(`✗ Missing skills: ${missing.join(", ")}.`);
    }
  }

  return { score: clamp(score, 0, 40), reasons, matchedSkills, missingRequirements };
}

// ─── Urgency (0–30) ───────────────────────────────────────────────────────────

function scoreUrgency(
  opp: ExtractedOpportunitySpec,
): { score: number; reason: string } {
  const days = opp.deadlineDaysLeft;

  if (days === null)  return { score: 5,  reason: "Deadline unknown — treated as medium urgency." };
  if (days <= 0)      return { score: 0,  reason: `Deadline has passed (${formatDate(opp.deadline ?? "")}).` };
  if (days <= 2)      return { score: 30, reason: `Deadline in ${days} day${days === 1 ? "" : "s"} — CRITICAL, must act today.` };
  if (days <= 7)      return { score: 25, reason: `Deadline in ${days} days — URGENT.` };
  if (days <= 14)     return { score: 20, reason: `Deadline in ${days} days — HIGH priority.` };
  if (days <= 30)     return { score: 15, reason: `Deadline in ${days} days — MEDIUM priority.` };
  if (days <= 60)     return { score: 10, reason: `Deadline in ${days} days — LOW urgency.` };
  return               { score: 5,  reason: `Deadline in ${days} days — FUTURE, plan ahead.` };
}

// ─── Completeness (0–20) ──────────────────────────────────────────────────────

function scoreCompleteness(
  opp: ExtractedOpportunitySpec,
): { score: number; reason: string } {
  let score = 0;
  const parts: string[] = [];

  if (opp.applicationLink)                    { score += 4; parts.push("application link"); }
  if (opp.deadline)                           { score += 4; parts.push("deadline"); }
  if (
    opp.eligibility.skillsRequired.length > 0 ||
    opp.eligibility.degreeRequired.length > 0 ||
    opp.eligibility.minCGPA !== null
  )                                           { score += 4; parts.push("eligibility details"); }
  if (opp.requiredDocuments.length > 0)       { score += 4; parts.push("required documents"); }
  if (opp.benefits)                           { score += 4; parts.push("benefits"); }

  const reason = parts.length > 0
    ? `Extracted: ${parts.join(", ")} (+${score}).`
    : "Minimal data extracted from this email (+0).";

  return { score, reason };
}

// ─── Preference Match (0–10) ──────────────────────────────────────────────────

function scorePreferenceMatch(
  opp: ExtractedOpportunitySpec,
  profile: StudentProfileSpec,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // ── Opportunity type already scored in profileFit (12pts there)
  // Here we give bonus for interest keyword match — 4pts
  const titleOrg = tok(`${opp.title} ${opp.organization} ${opp.summary}`);
  const interestMatches = profile.interests.filter((interest) =>
    titleOrg.includes(tok(interest)),
  );
  if (interestMatches.length > 0) {
    const interestScore = clamp(interestMatches.length * 2, 0, 4);
    score += interestScore;
    reasons.push(`✓ Matches your interest${interestMatches.length > 1 ? "s" : ""}: ${interestMatches.join(", ")} (+${interestScore}).`);
  }

  // ── Location preference — 4pts ────────────────────────────────────────────
  const loc = tok(opp.location);
  const pref = profile.locationPreference;
  const locationMatch =
    pref === "any" ||
    (pref === "local"         && (loc.includes("pakistan") || loc.includes("lahore") || loc.includes("karachi") || loc.includes("islamabad"))) ||
    (pref === "national"      && (loc.includes("pakistan") || loc.includes("lahore") || loc.includes("karachi") || loc.includes("islamabad"))) ||
    (pref === "international" && (loc.includes("international") || loc.includes("global") || loc.includes("abroad") || loc.includes("usa") || loc.includes("uk") || loc.includes("germany") || loc.includes("europe"))) ||
    (pref === "remote"        && loc.includes("remote"));

  if (locationMatch) {
    score += 4;
    reasons.push(`✓ Location (${opp.location}) matches your preference (${pref}) (+4).`);
  } else if (loc.includes("remote") || loc.includes("hybrid")) {
    score += 2;
    reasons.push(`~ Location is ${opp.location} — flexible (+2).`);
  } else {
    reasons.push(`✗ Location (${opp.location}) does not match your preference (${pref}) (+0).`);
  }

  // ── Financial need — 2pts ─────────────────────────────────────────────────
  if (opp.isFullyFunded && (profile.financialNeed === "medium" || profile.financialNeed === "high")) {
    score += 2;
    reasons.push(`✓ Fully funded — aligns with your financial need (${profile.financialNeed}) (+2).`);
  } else if (profile.financialNeed === "none" || profile.financialNeed === "low") {
    score += 1;
    reasons.push(`~ Financial need is low — funding not a priority (+1).`);
  }

  return { score: clamp(score, 0, 10), reasons };
}

// ─── Priority level ───────────────────────────────────────────────────────────

function getPriorityLevel(
  totalScore: number,
  isOpportunity: boolean,
): OpportunityScore["priorityLevel"] {
  if (!isOpportunity) return "SKIP";
  if (totalScore >= 80) return "URGENT";
  if (totalScore >= 60) return "HIGH";
  if (totalScore >= 40) return "MEDIUM";
  if (totalScore >= 20) return "LOW";
  return "SKIP";
}

// ─── Action checklist ─────────────────────────────────────────────────────────

function buildActionChecklist(opp: ExtractedOpportunitySpec): ActionItem[] {
  const items: ActionItem[] = [];
  let step = 1;

  items.push({
    step: step++,
    action: "Read full opportunity details and verify eligibility.",
    isUrgent: false,
  });

  if (opp.deadline) {
    const deadlineLabel = formatDate(opp.deadline);
    const reminderLabel = subtractDays(opp.deadline, 3);
    const isClose = opp.deadlineDaysLeft !== null && opp.deadlineDaysLeft <= 7;

    items.push({
      step: step++,
      action: `Note deadline: ${deadlineLabel} — set a reminder for ${reminderLabel}.`,
      deadline: opp.deadline,
      isUrgent: isClose,
    });
  }

  for (const doc of opp.requiredDocuments.slice(0, 5)) {
    items.push({
      step: step++,
      action: `Prepare: ${doc}.`,
      isUrgent: false,
    });
  }

  if (opp.applicationLink) {
    items.push({
      step: step++,
      action: `Visit application portal: ${opp.applicationLink}`,
      isUrgent: opp.deadlineDaysLeft !== null && opp.deadlineDaysLeft <= 7,
    });
  }

  if (opp.contactEmail) {
    items.push({
      step: step++,
      action: `Email contact at ${opp.contactEmail} if you have questions.`,
      isUrgent: false,
    });
  }

  items.push({
    step: step,
    action: `Submit application before ${opp.deadline ? formatDate(opp.deadline) : "the stated deadline"}.`,
    deadline: opp.deadline ?? undefined,
    isUrgent: opp.deadlineDaysLeft !== null && opp.deadlineDaysLeft <= 3,
  });

  return items;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function scoreOpportunity(
  opportunity: ExtractedOpportunitySpec,
  profile: StudentProfileSpec,
): OpportunityScore {
  const profileFit    = scoreProfileFit(opportunity, profile);
  const urgency       = scoreUrgency(opportunity);
  const completeness  = scoreCompleteness(opportunity);
  const preference    = scorePreferenceMatch(opportunity, profile);

  const totalScore = clamp(
    profileFit.score + urgency.score + completeness.score + preference.score,
    0,
    100,
  );

  const priorityLevel = getPriorityLevel(totalScore, opportunity.isOpportunity);

  const reasons: string[] = [
    ...profileFit.reasons,
    urgency.reason,
    completeness.reason,
    ...preference.reasons,
  ];

  return {
    emailId: opportunity.emailId,
    totalScore,
    breakdown: {
      profileFit:       profileFit.score,
      urgency:          urgency.score,
      completeness:     completeness.score,
      preferenceMatch:  preference.score,
    },
    priorityLevel,
    reasons,
    actionChecklist:      buildActionChecklist(opportunity),
    matchedSkills:        profileFit.matchedSkills,
    missingRequirements:  profileFit.missingRequirements,
  };
}
