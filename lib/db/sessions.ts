/**
 * Supabase persistence for analysis sessions.
 * Table: analysis_sessions (see supabase/migrations/001_analysis_sessions.sql)
 */
import { createClient } from "@/lib/supabase/server";
import type { RawEmail, StudentProfileSpec } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionRow = {
  id: string;
  session_id: string;
  student_profile: StudentProfileSpec;
  raw_emails: RawEmail[];
  results: unknown;
  total_opportunities: number;
  top_opportunity_id: string | null;
  created_at: string;
};

export type SaveSessionInput = {
  sessionId: string;
  profile: StudentProfileSpec;
  emails: RawEmail[];
  results: unknown;
  totalOpportunities: number;
  topOpportunityId: string | null;
};

export class SessionDbError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "SessionDbError";
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function saveSessionToDb(input: SaveSessionInput): Promise<SessionRow> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analysis_sessions")
    .insert({
      session_id:          input.sessionId,
      student_profile:     input.profile,
      raw_emails:          input.emails,
      results:             input.results,
      total_opportunities: input.totalOpportunities,
      top_opportunity_id:  input.topOpportunityId,
    })
    .select()
    .single();

  if (error) throw new SessionDbError(error.message, error.code);
  if (!data)  throw new SessionDbError("No data returned after insert.");

  return data as SessionRow;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSessionFromDb(sessionId: string): Promise<SessionRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analysis_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error?.code === "PGRST116") return null; // not found
  if (error) throw new SessionDbError(error.message, error.code);

  return data as SessionRow;
}

export async function listSessionsFromDb(limit = 50): Promise<SessionRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analysis_sessions")
    .select("id, session_id, total_opportunities, top_opportunity_id, created_at, student_profile")
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 200));

  if (error) throw new SessionDbError(error.message, error.code);
  return (data ?? []) as SessionRow[];
}
