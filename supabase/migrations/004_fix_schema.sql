-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Fix schema cache + ensure all columns exist
-- Run this ENTIRE script in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure user_profiles has ALL required columns (safe to run multiple times)
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='opportunity_types') THEN
    ALTER TABLE public.user_profiles ADD COLUMN opportunity_types TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='financial_need') THEN
    ALTER TABLE public.user_profiles ADD COLUMN financial_need TEXT DEFAULT 'none';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='location_preference') THEN
    ALTER TABLE public.user_profiles ADD COLUMN location_preference TEXT DEFAULT 'any';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='past_experience') THEN
    ALTER TABLE public.user_profiles ADD COLUMN past_experience TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='available_from') THEN
    ALTER TABLE public.user_profiles ADD COLUMN available_from DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='program') THEN
    ALTER TABLE public.user_profiles ADD COLUMN program TEXT DEFAULT 'Computer Science';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='degree') THEN
    ALTER TABLE public.user_profiles ADD COLUMN degree TEXT DEFAULT 'BS';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.user_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Force PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';

-- Verify the table looks correct
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;
