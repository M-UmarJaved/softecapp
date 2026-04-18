import {
  type ActionChecklistItem,
  type ExtractedOpportunity,
  type OpportunityType,
  type RankedOpportunity,
  type StudentProfile,
} from "@/lib/opportunity-inbox/types";

// Section 04 spec: 40 + 30 + 20 + 10 = 100
const PROFILE_FIT_MAX = 40;
const URGENCY_MAX = 30;
const COMPLETENESS_MAX = 20;
const PREFERENCE_MATCH_MAX = 10;

const HOURS_REQUIRED_BY_TYPE: Record<OpportunityType, number> = {
  scholarship: 6,
  internship: 12,
  competition: 10,
  fellowship: 11,
  admission: 8,
  conference: 4,
  job: 40,
  grant: 8,
  workshop: 4,
  other: 8,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function daysUntil(deadlineIso: string | null) {
  if (!deadlineIso) {
    return null;
  }

  const deadline = new Date(deadlineIso);

  if (Number.isNaN(deadline.getTime())) {
    return null;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((deadline.getTime() - Date.now()) / msPerDay);
}

function formatDeadline(deadlineIso: string | null) {
  if (!deadlineIso) {
    return "unknown";
  }

  const parsed = new Date(deadlineIso);

  if (Number.isNaN(parsed.getTime())) {
    return "unknown";
  }

  return parsed.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function scoreProfileFit(opportunity: ExtractedOpportunity, profile: StudentProfile) {
  let score = 0;
  const reasons: string[] = [];

  // Type match — 8pts
  if (profile.targetOpportunityTypes.includes(opportunity.opportunityType)) {
    score += 8;
    reasons.push(`Type match: ${opportunity.opportunityType} is in your target types (+8).`);
  } else {
    score += 2;
    reasons.push(`Type mismatch: ${opportunity.opportunityType} is not your primary target (+2).`);
  }

  // Major fit — 8pts
  const eligibleMajors = opportunity.eligibleMajors.map(normalizeToken);
  const profileMajor = normalizeToken(profile.major);
  const hasAllMajors = eligibleMajors.some((m) => m.includes("all"));
  const majorMatch =
    hasAllMajors ||
    eligibleMajors.length === 0 ||
    eligibleMajors.some((m) => m.includes(profileMajor) || profileMajor.includes(m));

  if (majorMatch && hasAllMajors) {
    score += 6;
    reasons.push("Major fit: opportunity accepts all majors (+6).");
  } else if (majorMatch) {
    score += 8;
    reasons.push(`Major fit: ${profile.major} aligns with listed eligibility (+8).`);
  } else {
    reasons.push(`Major fit: ${profile.major} does not match listed eligible majors (+0).`);
  }

  // CGPA fit — 8pts
  if (opportunity.minCgpa === null) {
    score += 5;
    reasons.push("CGPA fit: no explicit minimum CGPA found (+5).");
  } else if (profile.cgpa >= opportunity.minCgpa) {
    score += 8;
    reasons.push(`CGPA fit: your CGPA ${profile.cgpa.toFixed(2)} meets minimum ${opportunity.minCgpa.toFixed(2)} (+8).`);
  } else if (profile.cgpa >= opportunity.minCgpa - 0.2) {
    score += 3;
    reasons.push(`CGPA fit: slightly below minimum ${opportunity.minCgpa.toFixed(2)} (+3).`);
  } else {
    reasons.push(`CGPA fit: below required minimum ${opportunity.minCgpa.toFixed(2)} (+0).`);
  }

  // Skill fit — 12pts
  const normalizedProfileSkills = profile.skills.map(normalizeToken);
  const normalizedRequiredSkills = opportunity.requiredSkills.map(normalizeToken);
  if (normalizedRequiredSkills.length === 0) {
    score += 6;
    reasons.push("Skill fit: no hard skill prerequisites detected (+6).");
  } else {
    const matchedSkills = normalizedRequiredSkills.filter((req) =>
      normalizedProfileSkills.some((s) => s.includes(req) || req.includes(s)),
    );
    const overlapRatio = matchedSkills.length / normalizedRequiredSkills.length;
    const skillScore = Math.round(overlapRatio * 12);
    score += skillScore;
    reasons.push(`Skill fit: matched ${matchedSkills.length}/${normalizedRequiredSkills.length} required skills (+${skillScore}).`);
  }

  // Availability fit — 6pts
  const requiredHours = HOURS_REQUIRED_BY_TYPE[opportunity.opportunityType] ?? HOURS_REQUIRED_BY_TYPE.other;
  const availabilityRatio = clamp(profile.availabilityHoursPerWeek / requiredHours, 0, 1);
  const availabilityScore = Math.round(availabilityRatio * 6);
  score += availabilityScore;
  reasons.push(`Availability: ${profile.availabilityHoursPerWeek}h/week vs ~${requiredHours}h/week needed (+${availabilityScore}).`);

  return {
    score: clamp(score, 0, PROFILE_FIT_MAX),
    reasons,
  };
}

function scorePreferenceMatch(opportunity: ExtractedOpportunity, profile: StudentProfile) {
  let score = 0;
  const reasons: string[] = [];

  // Location preference — 6pts
  if (opportunity.location === "unknown") {
    score += 2;
    reasons.push("Location: not explicitly mentioned (+2).");
  } else if (profile.preferredLocations.includes(opportunity.location)) {
    score += 6;
    reasons.push(`Location: ${opportunity.location} matches your preferences (+6).`);
  } else if (opportunity.location === "hybrid" || opportunity.location === "remote") {
    score += 4;
    reasons.push(`Location: ${opportunity.location} is flexible (+4).`);
  } else {
    score += 1;
    reasons.push(`Location: ${opportunity.location} is not in preferred locations (+1).`);
  }

  // Financial aid alignment — 4pts
  if (profile.needsFinancialAid && opportunity.benefits.some((b) =>
    ["stipend", "funding", "scholarship", "full tuition", "travel grant"].includes(b.toLowerCase()),
  )) {
    score += 4;
    reasons.push("Financial fit: funded opportunity matches your financial aid preference (+4).");
  } else if (!profile.needsFinancialAid) {
    score += 2;
    reasons.push("Financial fit: no financial aid required (+2).");
  }

  return {
    score: clamp(score, 0, PREFERENCE_MATCH_MAX),
    reasons,
  };
}

function scoreUrgency(opportunity: ExtractedOpportunity) {
  const days = daysUntil(opportunity.deadlineIso);

  if (days === null) {
    return {
      score: 6,
      daysUntilDeadline: null,
      reason: "Urgency: deadline not found, assigned conservative urgency (+6).",
    };
  }

  if (days < 0) {
    return {
      score: 0,
      daysUntilDeadline: days,
      reason: `Urgency: deadline ${formatDeadline(opportunity.deadlineIso)} is in the past (+0).`,
    };
  }

  if (days <= 2)  return { score: 30, daysUntilDeadline: days, reason: `Urgency: deadline in ${days} day(s), immediate action required (+30).` };
  if (days <= 7)  return { score: 25, daysUntilDeadline: days, reason: `Urgency: deadline in ${days} day(s), high priority (+25).` };
  if (days <= 14) return { score: 18, daysUntilDeadline: days, reason: `Urgency: deadline in ${days} day(s), medium-high priority (+18).` };
  if (days <= 30) return { score: 12, daysUntilDeadline: days, reason: `Urgency: deadline in ${days} day(s), manageable window (+12).` };
  if (days <= 60) return { score: 7,  daysUntilDeadline: days, reason: `Urgency: deadline in ${days} day(s), can be scheduled (+7).` };

  return { score: 3, daysUntilDeadline: days, reason: `Urgency: deadline in ${days} day(s), low immediate pressure (+3).` };
}

function scoreCompleteness(opportunity: ExtractedOpportunity) {
  const checks = [
    { present: Boolean(opportunity.title.trim()) },
    { present: Boolean(opportunity.organization.trim()) },
    { present: Boolean(opportunity.deadlineIso) },
    { present: Boolean(opportunity.applicationLink) },
    { present: opportunity.requiredSkills.length > 0 },
    { present: opportunity.requiredDocuments.length > 0 },
    { present: opportunity.benefits.length > 0 },
  ];

  const completed = checks.filter((c) => c.present).length;
  const ratio = completed / checks.length;
  const score = Math.round(ratio * COMPLETENESS_MAX);

  return {
    score,
    ratio,
    reason: `Completeness: ${completed}/${checks.length} key fields extracted (+${score}).`,
  };
}

function createActionChecklist(
  opportunity: ExtractedOpportunity,
  profile: StudentProfile,
  days: number | null,
): ActionChecklistItem[] {
  const checklist: ActionChecklistItem[] = [];

  checklist.push({
    id: `${opportunity.id}-read`,
    task: "Read the original email carefully and verify scope.",
    evidence: `Source: ${opportunity.sourceEmailId}`,
  });

  if (opportunity.applicationLink) {
    checklist.push({
      id: `${opportunity.id}-link`,
      task: "Open application portal and create a draft submission.",
      evidence: opportunity.applicationLink,
    });
  } else {
    checklist.push({
      id: `${opportunity.id}-find-link`,
      task: "Find official application link from sender website or email body.",
      evidence: "No apply link extracted.",
    });
  }

  if (opportunity.deadlineIso) {
    checklist.push({
      id: `${opportunity.id}-deadline`,
      task: "Set calendar reminder and submit before deadline.",
      evidence: `Deadline: ${formatDeadline(opportunity.deadlineIso)} (${days ?? "?"} day(s) left).`,
    });
  } else {
    checklist.push({
      id: `${opportunity.id}-deadline-missing`,
      task: "Confirm exact deadline from official source.",
      evidence: "Deadline missing in extracted data.",
    });
  }

  for (const doc of opportunity.requiredDocuments.slice(0, 4)) {
    checklist.push({
      id: `${opportunity.id}-doc-${doc}`,
      task: `Prepare ${doc}.`,
      evidence: `Required document detected: ${doc}.`,
    });
  }

  if (opportunity.minCgpa !== null && profile.cgpa < opportunity.minCgpa) {
    checklist.push({
      id: `${opportunity.id}-cgpa-check`,
      task: "Check if a CGPA waiver or exception is possible.",
      evidence: `Your CGPA ${profile.cgpa.toFixed(2)} vs required ${opportunity.minCgpa.toFixed(2)}.`,
    });
  }

  return checklist.slice(0, 8);
}

export function rankOpportunities(
  opportunities: ExtractedOpportunity[],
  profile: StudentProfile,
): RankedOpportunity[] {
  const scored = opportunities.map((opportunity) => {
    const profileFit = scoreProfileFit(opportunity, profile);
    const urgency = scoreUrgency(opportunity);
    const completeness = scoreCompleteness(opportunity);
    const preference = scorePreferenceMatch(opportunity, profile);

    const total = clamp(
      profileFit.score + urgency.score + completeness.score + preference.score,
      0,
      PROFILE_FIT_MAX + URGENCY_MAX + COMPLETENESS_MAX + PREFERENCE_MATCH_MAX,
    );

    const reasons = [
      ...profileFit.reasons,
      urgency.reason,
      completeness.reason,
      ...preference.reasons,
    ];

    return {
      ...opportunity,
      rank: 0,
      urgencyDays: urgency.daysUntilDeadline,
      completenessRatio: completeness.ratio,
      scoreBreakdown: {
        profileFit: profileFit.score,
        urgency: urgency.score,
        completeness: completeness.score,
        total,
      },
      reasons,
      actionChecklist: createActionChecklist(opportunity, profile, urgency.daysUntilDeadline),
    } satisfies RankedOpportunity;
  });

  scored.sort((a, b) => {
    if (b.scoreBreakdown.total !== a.scoreBreakdown.total) {
      return b.scoreBreakdown.total - a.scoreBreakdown.total;
    }
    const aU = a.urgencyDays ?? Number.POSITIVE_INFINITY;
    const bU = b.urgencyDays ?? Number.POSITIVE_INFINITY;
    if (aU !== bU) return aU - bU;
    return b.confidence - a.confidence;
  });

  return scored.map((opp, index) => ({ ...opp, rank: index + 1 }));
}
