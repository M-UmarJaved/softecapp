-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: analysis_sessions
-- Run this in the Supabase SQL editor or via: npx supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.analysis_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          TEXT        UNIQUE NOT NULL,
  student_profile     JSONB       NOT NULL,
  raw_emails          JSONB       NOT NULL,
  results             JSONB       NOT NULL,
  total_opportunities INTEGER     NOT NULL DEFAULT 0,
  top_opportunity_id  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast session_id lookups
CREATE INDEX IF NOT EXISTS analysis_sessions_session_id_idx
  ON public.analysis_sessions (session_id);

-- Index for dashboard listing (newest first)
CREATE INDEX IF NOT EXISTS analysis_sessions_created_at_idx
  ON public.analysis_sessions (created_at DESC);

-- Enable RLS
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Hackathon policy: allow all operations
CREATE POLICY "Allow all"
  ON public.analysis_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);
