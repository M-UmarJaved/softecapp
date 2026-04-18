/**
 * User profile persistence — saves/loads StudentProfileSpec from user_profiles table.
 */
import { createClient } from "@/lib/supabase/server";
import type { StudentProfileSpec } from "@/lib/types";

export type ProfileRow = {
  user_id:             string;
  full_name:           string;
  university:          string;
  degree:              string;
  program:             string;
  semester:            number;
  cgpa:                number;
  skills:              string[];
  interests:           string[];
  opportunity_types:   string[];
  financial_need:      string;
  location_preference: string;
  past_experience:     string[];
  available_from:      string | null;
  updated_at:          string;
};

export async function loadProfile(): Promise<StudentProfileSpec | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  const row = data as ProfileRow;

  return {
    name:               row.full_name ?? "",
    university:         row.university ?? "FAST-NUCES Lahore",
    degree:             (row.degree as StudentProfileSpec["degree"]) ?? "BS",
    program:            row.program ?? "Computer Science",
    semester:           row.semester ?? 6,
    cgpa:               Number(row.cgpa ?? 3.0),
    skills:             row.skills ?? [],
    interests:          row.interests ?? [],
    opportunityTypes:   (row.opportunity_types ?? []) as StudentProfileSpec["opportunityTypes"],
    financialNeed:      (row.financial_need as StudentProfileSpec["financialNeed"]) ?? "none",
    locationPreference: (row.location_preference as StudentProfileSpec["locationPreference"]) ?? "any",
    pastExperience:     row.past_experience ?? [],
    availableFrom:      row.available_from ?? new Date().toISOString().slice(0, 10),
  };
}

export async function saveProfile(profile: StudentProfileSpec): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_profiles")
    .upsert({
      user_id:             user.id,
      full_name:           profile.name,
      university:          profile.university,
      degree:              profile.degree,
      program:             profile.program,
      semester:            profile.semester,
      cgpa:                profile.cgpa,
      skills:              profile.skills,
      interests:           profile.interests,
      opportunity_types:   profile.opportunityTypes,
      financial_need:      profile.financialNeed,
      location_preference: profile.locationPreference,
      past_experience:     profile.pastExperience,
      available_from:      profile.availableFrom || null,
      updated_at:          new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}
