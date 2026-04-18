-- Migration 003: extend user_profiles with full StudentProfileSpec fields
-- Run in Supabase SQL Editor (safe to run multiple times)

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS opportunity_types   TEXT[]       DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS financial_need      TEXT         DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS location_preference TEXT         DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS past_experience     TEXT[]       DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available_from      DATE,
  ADD COLUMN IF NOT EXISTS program             TEXT         DEFAULT 'Computer Science',
  ADD COLUMN IF NOT EXISTS degree              TEXT         DEFAULT 'BS',
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ  DEFAULT NOW();
