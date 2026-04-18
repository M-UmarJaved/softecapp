import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/*
  Run this SQL in your Supabase SQL editor to create the waitlist table and policies.

  create extension if not exists pgcrypto;

  create table if not exists public.waitlist_signups (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    source text not null default 'public-waitlist',
    city text,
    company_name text,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
  );

  create index if not exists waitlist_signups_created_at_idx
    on public.waitlist_signups (created_at desc);

  alter table public.waitlist_signups enable row level security;

  -- Allow anonymous or logged-in users to insert waitlist entries.
  create policy "waitlist_insert_public"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

  -- Allow authenticated users (dashboard admins/team) to read entries.
  create policy "waitlist_select_authenticated"
  on public.waitlist_signups
  for select
  to authenticated
  using (true);

  -- Intentionally no update/delete policy from client roles.
*/

const WAITLIST_TABLE = "waitlist_signups";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistSignup = {
  id: string;
  email: string;
  source: string;
  city: string | null;
  company_name: string | null;
  created_at: string;
};

export type AddWaitlistSignupInput = {
  email: string;
  source?: string;
  city?: string;
  companyName?: string;
};

export class WaitlistError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "WaitlistError";
    this.status = status;
    this.code = code;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeText(input: string | undefined, maxLength: number) {
  if (!input) {
    return null;
  }

  const normalized = input.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function validateEmail(email: string) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    throw new WaitlistError("Email is required.", 400);
  }

  if (!EMAIL_REGEX.test(normalized)) {
    throw new WaitlistError("Please enter a valid email address.", 400);
  }

  return normalized;
}

function mapPostgrestError(error: PostgrestError) {
  if (error.code === "23505") {
    return new WaitlistError("This email is already on the waitlist.", 409, error.code);
  }

  if (error.code === "42501") {
    return new WaitlistError(
      "Waitlist RLS policy is blocking this action. Verify SQL policies in lib/db/waitlist.ts.",
      500,
      error.code,
    );
  }

  return new WaitlistError(error.message, 500, error.code);
}

export async function addWaitlistSignup(
  input: AddWaitlistSignupInput,
): Promise<WaitlistSignup> {
  const supabase = await createClient();

  const payload = {
    email: validateEmail(input.email),
    source: normalizeText(input.source, 64) ?? "public-waitlist",
    city: normalizeText(input.city, 64),
    company_name: normalizeText(input.companyName, 128),
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from(WAITLIST_TABLE)
    .insert({
      ...payload,
      created_by: user?.id ?? null,
    })
    .select("id, email, source, city, company_name, created_at")
    .single();

  if (error) {
    throw mapPostgrestError(error);
  }

  if (!data) {
    throw new WaitlistError("Unable to store waitlist signup.", 500);
  }

  return data as WaitlistSignup;
}

export async function listWaitlistSignups(limit = 200): Promise<WaitlistSignup[]> {
  const supabase = await createClient();
  const safeLimit = Math.min(Math.max(limit, 1), 1000);

  const { data, error } = await supabase
    .from(WAITLIST_TABLE)
    .select("id, email, source, city, company_name, created_at")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw mapPostgrestError(error);
  }

  return (data ?? []) as WaitlistSignup[];
}