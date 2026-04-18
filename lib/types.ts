/**
 * Canonical type exports for the Opportunity Inbox Copilot.
 * All Section 04 spec interfaces live here, sourced from lib/opportunity-inbox/types.ts.
 */
export type {
  // Enums / constants
  OpportunityType,
  DegreeLevel,
  SpecDegree,
  OpportunityLocation,

  // Raw inputs
  RawEmail,
  RawOpportunityEmail,

  // Profiles
  StudentProfile,
  StudentProfileSpec,

  // Extraction
  ExtractedOpportunity,
  ExtractedOpportunitySpec,

  // Scoring
  ScoreBreakdown,
  ActionChecklistItem,
  ActionItem,
  OpportunityScore,
  RankedOpportunity,

  // Session
  AnalysisSession,

  // API
  AnalyzeOpportunitiesRequest,
  AnalyzeOpportunitiesResponse,
  AnalysisSummarySnapshot,
} from "@/lib/opportunity-inbox/types";

export {
  OPPORTUNITY_TYPES,
  DEGREE_LEVELS,
  OPPORTUNITY_LOCATIONS,
} from "@/lib/opportunity-inbox/types";
