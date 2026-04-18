-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Full setup — run this ENTIRE script in Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query → paste → Run
-- Safe to run multiple times (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. analysis_sessions ─────────────────────────────────────────────────────
-- Drop and recreate cleanly (safe for hackathon — no prod data yet)
DROP TABLE IF EXISTS public.analysis_sessions CASCADE;

CREATE TABLE public.analysis_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          TEXT        UNIQUE NOT NULL,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  student_profile     JSONB       NOT NULL DEFAULT '{}',
  raw_emails          JSONB       NOT NULL DEFAULT '[]',
  results             JSONB       NOT NULL DEFAULT '[]',
  total_opportunities INTEGER     NOT NULL DEFAULT 0,
  top_opportunity_id  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX analysis_sessions_session_id_idx ON public.analysis_sessions (session_id);
CREATE INDEX analysis_sessions_user_id_idx    ON public.analysis_sessions (user_id);
CREATE INDEX analysis_sessions_created_at_idx ON public.analysis_sessions (created_at DESC);

ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_sessions_insert" ON public.analysis_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "analysis_sessions_select" ON public.analysis_sessions
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "analysis_sessions_update" ON public.analysis_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ── 2. user_profiles ─────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT         DEFAULT '',
  university  TEXT         DEFAULT 'FAST-NUCES Lahore',
  degree      TEXT         DEFAULT 'BS',
  program     TEXT         DEFAULT 'Computer Science',
  semester    INTEGER      DEFAULT 6,
  cgpa        NUMERIC(3,2) DEFAULT 3.00,
  skills      TEXT[]       DEFAULT '{}',
  interests   TEXT[]       DEFAULT '{}',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON public.user_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_profiles_insert" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_update" ON public.user_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ── 3. waitlist_signups ───────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.waitlist_signups CASCADE;

CREATE TABLE public.waitlist_signups (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL UNIQUE,
  source       TEXT        NOT NULL DEFAULT 'public-waitlist',
  city         TEXT,
  company_name TEXT,
  created_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX waitlist_signups_created_at_idx ON public.waitlist_signups (created_at DESC);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_public" ON public.waitlist_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "waitlist_select_authenticated" ON public.waitlist_signups
  FOR SELECT TO authenticated USING (true);

-- ── 4. Auto-create user_profile on signup ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
