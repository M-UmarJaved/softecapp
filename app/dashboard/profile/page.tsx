"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import {
  CheckCircle2Icon,
  Loader2Icon,
  SaveIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import type { StudentProfileSpec, OpportunityType } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS: StudentProfileSpec["degree"][] = ["BS", "MS", "PhD", "BBA", "MBA", "Other"];

const OPPORTUNITY_TYPE_LABELS: Partial<Record<OpportunityType, string>> = {
  scholarship: "Scholarship", internship: "Internship", competition: "Competition",
  fellowship: "Fellowship", admission: "Admission", conference: "Conference",
  workshop: "Workshop", job: "Job", grant: "Grant",
};

const LOCATION_OPTIONS: Array<{ value: StudentProfileSpec["locationPreference"]; label: string }> = [
  { value: "local", label: "Local" }, { value: "national", label: "National" },
  { value: "international", label: "International" }, { value: "remote", label: "Remote" },
  { value: "any", label: "Any" },
];

const FINANCIAL_OPTIONS: Array<{ value: StudentProfileSpec["financialNeed"]; label: string }> = [
  { value: "none", label: "None" }, { value: "low", label: "Low" },
  { value: "medium", label: "Medium" }, { value: "high", label: "High" },
];

function defaultProfile(): StudentProfileSpec {
  return {
    name: "", university: "FAST-NUCES Lahore", degree: "BS",
    program: "Computer Science", semester: 6, cgpa: 3.2,
    skills: ["Python", "React"], interests: ["AI", "Web Development"],
    opportunityTypes: ["scholarship", "internship", "competition"],
    financialNeed: "low", locationPreference: "any",
    pastExperience: [], availableFrom: new Date().toISOString().slice(0, 10),
  };
}

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setInput(""); };
  const remove = (t: string) => onChange(tags.filter((x) => x !== t));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && tags.length) remove(tags[tags.length - 1]!);
  };
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-2.5 py-1.5 focus-within:border-blue-500/40 focus-within:ring-2 focus-within:ring-blue-500/15">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-300">
          {tag}
          <button type="button" onClick={() => remove(tag)} className="text-blue-400/60 hover:text-blue-300"><XIcon className="size-3" /></button>
        </span>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-24 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-600">{hint}</p>}
    </div>
  );
}

const inputCls = "h-10 w-full rounded-xl border border-white/10 bg-white/4 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15 transition-all";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfileSpec>(defaultProfile);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Load on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: { profile?: StudentProfileSpec | null }) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof StudentProfileSpec>(key: K, value: StudentProfileSpec[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const toggleType = (type: OpportunityType) => {
    const cur = profile.opportunityTypes;
    const next = cur.includes(type) ? cur.filter((t) => t !== type) : [...cur, type];
    set("opportunityTypes", next.length > 0 ? next : [type]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <UserIcon className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">
              Saved settings auto-load on the Analyze page
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
            saved
              ? "bg-green-500/15 text-green-400 border border-green-500/20"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:brightness-110 disabled:opacity-50",
          )}
        >
          {saving ? <><Loader2Icon className="size-4 animate-spin" /> Saving…</>
           : saved  ? <><CheckCircle2Icon className="size-4" /> Saved!</>
           : <><SaveIcon className="size-4" /> Save Profile</>}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Form card */}
      <div className="space-y-8 rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm">

        {/* Academic */}
        <Section title="Academic Info">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input value={profile.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Ayesha Khan" className={inputCls} />
            </Field>
            <Field label="University">
              <input value={profile.university} onChange={(e) => set("university", e.target.value)}
                placeholder="FAST-NUCES Lahore" className={inputCls} />
            </Field>
            <Field label="Degree">
              <select value={profile.degree} onChange={(e) => set("degree", e.target.value as StudentProfileSpec["degree"])}
                className={inputCls}>
                {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Program">
              <input value={profile.program} onChange={(e) => set("program", e.target.value)}
                placeholder="Computer Science" className={inputCls} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`Semester — ${profile.semester} of ${["BS","BBA"].includes(profile.degree) ? 8 : 4}`}>
              <input type="range" min={1} max={["BS","BBA"].includes(profile.degree) ? 8 : 4}
                value={profile.semester} onChange={(e) => set("semester", Number(e.target.value))}
                className="w-full accent-blue-500 mt-1" />
            </Field>
            <Field label={`CGPA — ${profile.cgpa.toFixed(2)} / 4.0`}>
              <input type="range" min={0} max={4} step={0.05}
                value={profile.cgpa} onChange={(e) => set("cgpa", Number(e.target.value))}
                className="w-full accent-blue-500 mt-1" />
            </Field>
          </div>
        </Section>

        <div className="h-px bg-border/50" />

        {/* Preferences */}
        <Section title="Preferences">
          <Field label="Skills" hint="Type a skill and press Enter">
            <TagInput tags={profile.skills} onChange={(t) => set("skills", t)} placeholder="Python, React, SQL…" />
          </Field>
          <Field label="Interests" hint="Type an interest and press Enter">
            <TagInput tags={profile.interests} onChange={(t) => set("interests", t)} placeholder="AI, Fintech, Cybersecurity…" />
          </Field>

          <Field label="Opportunity Types I Want">
            <div className="flex flex-wrap gap-2 mt-1">
              {(Object.entries(OPPORTUNITY_TYPE_LABELS) as [OpportunityType, string][]).map(([type, label]) => {
                const active = profile.opportunityTypes.includes(type);
                return (
                  <button key={type} type="button" onClick={() => toggleType(type)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      active ? "border-primary/40 bg-primary/15 text-primary" : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground",
                    )}>
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location Preference">
              <div className="flex flex-wrap gap-3 mt-1">
                {LOCATION_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex cursor-pointer items-center gap-1.5">
                    <input type="radio" name="loc" value={value} checked={profile.locationPreference === value}
                      onChange={() => set("locationPreference", value)} className="accent-primary" />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Financial Need">
              <div className="flex flex-wrap gap-3 mt-1">
                {FINANCIAL_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex cursor-pointer items-center gap-1.5">
                    <input type="radio" name="fin" value={value} checked={profile.financialNeed === value}
                      onChange={() => set("financialNeed", value)} className="accent-primary" />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </Section>

        <div className="h-px bg-border/50" />

        {/* Experience */}
        <Section title="Past Experience">
          <div className="space-y-2">
            {profile.pastExperience.map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm">
                <span className="flex-1 text-foreground">{item}</span>
                <button type="button" onClick={() => set("pastExperience", profile.pastExperience.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive"><XIcon className="size-3.5" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <ExperienceAdder onAdd={(v) => set("pastExperience", [...profile.pastExperience, v])} />
            </div>
          </div>
        </Section>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-8">
        Profile is saved to your account and auto-loaded on the Analyze page.
      </p>
    </div>
  );
}

function ExperienceAdder({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState("");
  const add = () => { if (val.trim()) { onAdd(val.trim()); setVal(""); } };
  return (
    <div className="flex w-full gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder='e.g. "1 internship at Devsinc"'
        className="h-10 flex-1 rounded-xl border border-white/10 bg-white/4 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40 transition-all" />
      <button type="button" onClick={add}
        className="rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-400 hover:bg-white/8 hover:text-white transition-all">
        Add
      </button>
    </div>
  );
}
