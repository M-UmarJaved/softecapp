export const OPPORTUNITY_TYPES = [
  "scholarship",
  "internship",
  "competition",
  "fellowship",
  "admission",
  "conference",
  "job",
  "grant",
  "workshop",
  "other",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const DEGREE_LEVELS = ["bachelors", "masters", "phd"] as const;
export type DegreeLevel = (typeof DEGREE_LEVELS)[number];

// Section 04 spec degree values — used by StudentProfile
export type SpecDegree = "BS" | "MS" | "PhD" | "BBA" | "MBA" | "Other";

export const OPPORTUNITY_LOCATIONS = [
  "pakistan",
  "remote",
  "international",
  "hybrid",
  "unknown",
] as const;

export type OpportunityLocation = (typeof OPPORTUNITY_LOCATIONS)[number];

// ─── Raw email ────────────────────────────────────────────────────────────────

export type RawOpportunityEmail = {
  id: string;
  subject: string;
  sender: string;
  receivedAt: string;
  body: string;
};

/** Spec alias — same shape, looser sender/receivedDate fields */
export interface RawEmail {
  id: string;
  subject: string;
  body: string;
  sender?: string;
  receivedDate?: string;
}

// ─── Student profile ──────────────────────────────────────────────────────────

/** Internal pipeline profile (used by scoring + extraction) */
export type StudentProfile = {
  fullName: string;
  university: string;
  degreeLevel: DegreeLevel;
  major: string;
  semester: number;
  cgpa: number;
  graduationYear: number;
  targetOpportunityTypes: OpportunityType[];
  preferredLocations: OpportunityLocation[];
  skills: string[];
  interests: string[];
  availabilityHoursPerWeek: number;
  needsFinancialAid: boolean;
};

/** Section 04 spec StudentProfile — richer fields, used by forms + session */
export interface StudentProfileSpec {
  name: string;
  university: string;
  degree: SpecDegree;
  program: string;
  semester: number;
  cgpa: number;
  skills: string[];
  interests: string[];
  opportunityTypes: OpportunityType[];
  financialNeed: "none" | "low" | "medium" | "high";
  locationPreference: "local" | "national" | "international" | "remote" | "any";
  pastExperience: string[];
  availableFrom: string; // ISO date string
}

// ─── Extraction ───────────────────────────────────────────────────────────────

export type ExtractedOpportunity = {
  id: string;
  sourceEmailId: string;
  title: string;
  organization: string;
  opportunityType: OpportunityType;
  location: OpportunityLocation;
  summary: string;
  deadlineIso: string | null;
  applicationLink: string | null;
  minCgpa: number | null;
  eligibleMajors: string[];
  requiredSkills: string[];
  requiredDocuments: string[];
  benefits: string[];
  confidence: number;
  signals: string[];
};

/** Section 04 spec ExtractedOpportunity — richer eligibility + metadata */
export interface ExtractedOpportunitySpec {
  emailId: string;
  isOpportunity: boolean;
  classificationConfidence: number;
  opportunityType: OpportunityType;
  title: string;
  organization: string;
  deadline: string | null;
  deadlineDaysLeft: number | null;
  eligibility: {
    minCGPA: number | null;
    degreeRequired: string[];
    semesterRange: { min: number | null; max: number | null };
    skillsRequired: string[];
    nationalityRequired: string | null;
    otherConditions: string[];
  };
  requiredDocuments: string[];
  benefits: string;
  applicationLink: string | null;
  contactEmail: string | null;
  location: string;
  isFullyFunded: boolean;
  summary: string;
  extractionWarnings: string[];
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export type ScoreBreakdown = {
  profileFit: number;
  urgency: number;
  completeness: number;
  total: number;
};

export type ActionChecklistItem = {
  id: string;
  task: string;
  evidence: string;
};

/** Section 04 spec ActionItem */
export interface ActionItem {
  step: number;
  action: string;
  deadline?: string;
  isUrgent: boolean;
}

/** Section 04 spec OpportunityScore */
export interface OpportunityScore {
  emailId: string;
  totalScore: number;
  breakdown: {
    profileFit: number;      // 0–40
    urgency: number;         // 0–30
    completeness: number;    // 0–20
    preferenceMatch: number; // 0–10
  };
  priorityLevel: "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "SKIP";
  reasons: string[];
  actionChecklist: ActionItem[];
  matchedSkills: string[];
  missingRequirements: string[];
}

export type RankedOpportunity = ExtractedOpportunity & {
  rank: number;
  urgencyDays: number | null;
  completenessRatio: number;
  scoreBreakdown: ScoreBreakdown;
  reasons: string[];
  actionChecklist: ActionChecklistItem[];
};

// ─── Session ──────────────────────────────────────────────────────────────────

/** Section 04 spec AnalysisSession */
export interface AnalysisSession {
  sessionId: string;
  profile: StudentProfileSpec;
  rawEmails: RawEmail[];
  results: Array<ExtractedOpportunitySpec & { score: OpportunityScore }>;
  createdAt: string;
  totalOpportunitiesFound: number;
  topOpportunity: string | null; // emailId of highest scored
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export type AnalyzeOpportunitiesRequest = {
  emails: RawOpportunityEmail[];
  profile: StudentProfile;
  useDemoFallback?: boolean;
};

export type AnalyzeOpportunitiesResponse = {
  opportunities: RankedOpportunity[];
  extractedCount: number;
  generatedAt: string;
  provider: "grok" | "heuristic-fallback";
  summary?: AnalysisSummarySnapshot;
};

export type AnalysisSummarySnapshot = {
  generatedAt: string;
  provider: "grok" | "heuristic-fallback";
  totalEmails: number;
  totalOpportunities: number;
  topScore: number;
  avgScore: number;
};
