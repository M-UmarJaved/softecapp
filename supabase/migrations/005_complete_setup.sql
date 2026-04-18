-- Run this in Supabase SQL Editor → New Query → Run
-- Safe to run multiple times

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- analysis_sessions
CREATE TABLE IF NOT EXISTS public.analysis_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          TEXT        UNIQUE NOT NULL,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  student_profile     JSONB       NOT NULL DEFAULT '{}',
  raw_emails          JSONB       NOT NULL DEFAULT '[]',
  results             JSONB       NOT NULL DEFAULT '{}',
  total_opportunities INTEGER     NOT NULL DEFAULT 0,
  top_opportunity_id  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_sessions" ON public.analysis_sessions;
CREATE POLICY "allow_all_sessions" ON public.analysis_sessions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID         UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT         DEFAULT '',
  university          TEXT         DEFAULT 'FAST-NUCES Lahore',
  degree              TEXT         DEFAULT 'BS',
  program             TEXT         DEFAULT 'Computer Science',
  semester            INTEGER      DEFAULT 6,
  cgpa                NUMERIC(3,2) DEFAULT 3.00,
  skills              TEXT[]       DEFAULT '{}',
  interests           TEXT[]       DEFAULT '{}',
  opportunity_types   TEXT[]       DEFAULT '{}',
  financial_need      TEXT         DEFAULT 'none',
  location_preference TEXT         DEFAULT 'any',
  past_experience     TEXT[]       DEFAULT '{}',
  available_from      DATE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_own_profile" ON public.user_profiles;
CREATE POLICY "allow_own_profile" ON public.user_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- waitlist_signups
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL UNIQUE,
  source       TEXT        NOT NULL DEFAULT 'public-waitlist',
  city         TEXT,
  company_name TEXT,
  created_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waitlist_insert_public"        ON public.waitlist_signups;
DROP POLICY IF EXISTS "waitlist_select_authenticated" ON public.waitlist_signups;
CREATE POLICY "waitlist_insert_public" ON public.waitlist_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "waitlist_select_authenticated" ON public.waitlist_signups
  FOR SELECT TO authenticated USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
