"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  Loader2Icon,
  MailIcon,
  PlusIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { InboxSimulator } from "@/components/InboxSimulator";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sampleEmails as SAMPLE_EMAILS, getSampleEmailText } from "@/lib/sampleData";
import type { RawEmail, StudentProfileSpec, OpportunityType } from "@/lib/types";
import { OPPORTUNITY_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailTab = "paste" | "sample";

type FormErrors = Partial<Record<keyof StudentProfileSpec | "emails", string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS: StudentProfileSpec["degree"][] = ["BS", "MS", "PhD", "BBA", "MBA", "Other"];

const LOCATION_OPTIONS: Array<{ value: StudentProfileSpec["locationPreference"]; label: string }> = [
  { value: "local",         label: "Local" },
  { value: "national",      label: "National" },
  { value: "international", label: "International" },
  { value: "remote",        label: "Remote" },
  { value: "any",           label: "Any" },
];

const FINANCIAL_OPTIONS: Array<{ value: StudentProfileSpec["financialNeed"]; label: string }> = [
  { value: "none",   label: "None" },
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
];

const OPPORTUNITY_TYPE_LABELS: Partial<Record<OpportunityType, string>> = {
  scholarship: "Scholarship",
  internship:  "Internship",
  competition: "Competition",
  fellowship:  "Fellowship",
  admission:   "Admission",
  conference:  "Conference",
  workshop:    "Workshop",
  job:         "Job",
  grant:       "Grant",
};

function defaultProfile(): StudentProfileSpec {
  return {
    name:               "",
    university:         "FAST-NUCES Lahore",
    degree:             "BS",
    program:            "Computer Science",
    semester:           6,
    cgpa:               3.2,
    skills:             ["Python", "React"],
    interests:          ["AI", "Fintech"],
    opportunityTypes:   ["scholarship", "internship", "competition"],
    financialNeed:      "low",
    locationPreference: "any",
    pastExperience:     [],
    availableFrom:      new Date().toISOString().slice(0, 10),
  };
}

// ─── Email parsing ────────────────────────────────────────────────────────────

function parseEmailBlocks(text: string): RawEmail[] {
  const blocks = text.split(/\n\s*(?:---|===)\s*\n/g).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const subjectLine = lines.find((l) => /^subject:/i.test(l));
    const fromLine    = lines.find((l) => /^from:/i.test(l));
    const bodyStart   = Math.max(
      subjectLine ? lines.indexOf(subjectLine) + 1 : 0,
      fromLine    ? lines.indexOf(fromLine)    + 1 : 0,
    );

    return {
      id:      `email-${i + 1}`,
      subject: subjectLine ? subjectLine.replace(/^subject:\s*/i, "") : `Email ${i + 1}`,
      sender:  fromLine    ? fromLine.replace(/^from:\s*/i, "")       : undefined,
      body:    lines.slice(bodyStart).join(" ") || block,
    } satisfies RawEmail;
  });
}

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder,
  id,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && tags.length) remove(tags[tags.length - 1]!);
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {tag}
          <button type="button" onClick={() => remove(tag)} className="text-muted-foreground hover:text-foreground">
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// ─── Experience list input ────────────────────────────────────────────────────

function ExperienceInput({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val) { onChange([...items, val]); setInput(""); }
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm">
          <span className="flex-1">{item}</span>
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder='e.g. "1 internship at XYZ", "2 research projects"'
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={add} className="shrink-0 gap-1">
          <PlusIcon className="size-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

function AnalyzePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Email state
  const [emailTab,   setEmailTab]   = useState<EmailTab>("paste");
  const [emailText,  setEmailText]  = useState("");
  const [emails,     setEmails]     = useState<RawEmail[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState<StudentProfileSpec>(defaultProfile);

  // UI state
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiDone,     setApiDone]     = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);
  const [sessionId,   setSessionId]   = useState<string | null>(null);
  const [hints, setHints] = useState<{
    opportunitiesFound?: number;
    totalEmails?: number;
    topScore?: number;
  }>({});

  // Auto-load sample on ?demo=true
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      const text = getSampleEmailText();
      setEmailText(text);
      setEmails(SAMPLE_EMAILS);
      setEmailTab("sample");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Email handlers ──────────────────────────────────────────────────────────

  const handleParse = useCallback(() => {
    const parsed = parseEmailBlocks(emailText);
    setEmails(parsed);
    if (parsed.length === 0) setErrors((e) => ({ ...e, emails: "No emails detected. Use --- to separate emails." }));
    else setErrors((e) => { const n = { ...e }; delete n.emails; return n; });
  }, [emailText]);

  const handleLoadSample = () => {
    const text = getSampleEmailText();
    setEmailText(text);
    setEmails(SAMPLE_EMAILS);
    setEmailTab("sample");
    setErrors((e) => { const n = { ...e }; delete n.emails; return n; });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const contents = await Promise.all(files.map((f) => f.text().catch(() => "")));
    const combined = contents.filter(Boolean).join("\n---\n");
    const next = emailText.trim() ? `${emailText.trim()}\n---\n${combined}` : combined;
    setEmailText(next);
    setEmails(parseEmailBlocks(next));
    e.target.value = "";
  };

  // ── Profile helpers ─────────────────────────────────────────────────────────

  const set = <K extends keyof StudentProfileSpec>(key: K, value: StudentProfileSpec[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const toggleOpportunityType = (type: OpportunityType) => {
    const current = profile.opportunityTypes;
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    set("opportunityTypes", next.length > 0 ? next : [type]);
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (emails.length < 1)  errs.emails    = "Parse at least 1 email before analyzing.";
    if (emails.length > 15) errs.emails    = "Maximum 15 emails allowed.";
    if (!profile.name.trim()) errs.name    = "Name is required.";
    if (!profile.program.trim()) errs.program = "Program is required.";
    if (profile.cgpa < 0 || profile.cgpa > 4) errs.cgpa = "CGPA must be between 0 and 4.";
    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey ?? "")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsAnalyzing(true);
    setApiDone(false);
    setApiError(null);
    setSessionId(null);
    setHints({ totalEmails: emails.length });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, profile, useDemoFallback: true }),
      });

      const data = await res.json() as {
        sessionId?: string;
        error?: string;
        totalOpportunitiesFound?: number;
        results?: Array<{ score?: { totalScore?: number } }>;
      };

      if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
      if (!data.sessionId) throw new Error("No session ID returned.");

      // Feed hints to the overlay
      setHints({
        totalEmails:          emails.length,
        opportunitiesFound:   data.totalOpportunitiesFound ?? 0,
        topScore:             data.results?.[0]?.score?.totalScore ?? 85,
      });
      setSessionId(data.sessionId);
      setApiDone(true);
    } catch (err) {
      setIsAnalyzing(false);
      setApiDone(false);
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // Called by ProcessingOverlay once all steps + API are done
  const handleProcessingComplete = () => {
    if (sessionId) router.push(`/results/${sessionId}`);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Processing overlay — shown while analyzing */}
      {isAnalyzing && (
        <ProcessingOverlay
          apiDone={apiDone}
          hints={hints}
          onComplete={handleProcessingComplete}
        />
      )}
      {/* Top bar */}
      <div className="border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Opportunity Inbox Copilot
          </h1>
          <p className="text-sm text-muted-foreground">
            {emails.length > 0 ? `${emails.length} email${emails.length !== 1 ? "s" : ""} loaded` : "No emails loaded"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          {/* ── LEFT: Email Input ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Tab switcher */}
            <div className="flex gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
              {(["paste", "sample"] as EmailTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setEmailTab(tab); if (tab === "sample") handleLoadSample(); }}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    emailTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "paste" ? (
                    <span className="flex items-center justify-center gap-2">
                      <MailIcon className="size-4" /> Paste Emails
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <SparklesIcon className="size-4" /> Load Sample Emails
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-textarea">
                  {emailTab === "paste" ? "Paste emails below — separate each with ---" : "Sample emails loaded"}
                </Label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <UploadIcon className="size-3.5" />
                  Upload .txt
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.eml"
                    multiple
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <Textarea
                id="email-textarea"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                className="min-h-72 font-mono text-xs"
                placeholder={`Subject: Scholarship Opportunity 2026\nFrom: admissions@university.edu\nApplications are open for a fully funded scholarship...\n---\nSubject: Summer Internship Program\nFrom: careers@company.com\n...`}
              />

              <FieldError msg={errors.emails} />

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleParse} className="gap-1.5">
                  <MailIcon className="size-3.5" /> Parse Emails
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={handleLoadSample} className="gap-1.5">
                  <SparklesIcon className="size-3.5" /> Load 8 Sample Emails
                </Button>
                {emailText && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setEmailText(""); setEmails([]); }} className="gap-1.5 text-muted-foreground">
                    <XIcon className="size-3.5" /> Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Inbox preview */}
            {emails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {emails.length} email{emails.length !== 1 ? "s" : ""} detected
                  </p>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    emails.length >= 5 && emails.length <= 15
                      ? "bg-primary/15 text-primary"
                      : "bg-destructive/15 text-destructive",
                  )}>
                    {emails.length < 5 ? "Need at least 5" : emails.length > 15 ? "Max 15 allowed" : "Ready"}
                  </span>
                </div>
                <InboxSimulator emails={emails.map((e) => ({
                  id: e.id,
                  subject: e.subject,
                  sender: e.sender ?? "",
                  receivedAt: e.receivedDate ?? new Date().toISOString(),
                  body: e.body,
                }))} />
              </div>
            )}
          </div>

          {/* ── RIGHT: Profile Form ───────────────────────────────────────── */}
          <div className="space-y-6 rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">

            {/* Section 1 — Academic Info */}
            <FormSection title="Academic Info">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ayesha Khan"
                    className={cn(errors.name && "border-destructive")}
                  />
                  <FieldError msg={errors.name} />
                </div>

                <div>
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={profile.university}
                    onChange={(e) => set("university", e.target.value)}
                    placeholder="FAST-NUCES Lahore"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <select
                      id="degree"
                      value={profile.degree}
                      onChange={(e) => set("degree", e.target.value as StudentProfileSpec["degree"])}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      {DEGREE_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="program">Program *</Label>
                    <Input
                      id="program"
                      value={profile.program}
                      onChange={(e) => set("program", e.target.value)}
                      placeholder="Computer Science"
                      className={cn(errors.program && "border-destructive")}
                    />
                    <FieldError msg={errors.program} />
                  </div>
                </div>

                {/* Semester slider */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="semester">Semester</Label>
                    <span className="text-sm font-medium text-foreground">
                      Semester {profile.semester} of {profile.degree === "BS" || profile.degree === "BBA" ? 8 : 4}
                    </span>
                  </div>
                  <input
                    id="semester"
                    type="range"
                    min={1}
                    max={profile.degree === "BS" || profile.degree === "BBA" ? 8 : 4}
                    value={profile.semester}
                    onChange={(e) => set("semester", Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>{profile.degree === "BS" || profile.degree === "BBA" ? 8 : 4}</span>
                  </div>
                </div>

                {/* CGPA slider */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cgpa">CGPA</Label>
                    <span className="text-sm font-medium text-foreground">
                      {profile.cgpa.toFixed(2)} / 4.0
                    </span>
                  </div>
                  <input
                    id="cgpa"
                    type="range"
                    min={0}
                    max={4}
                    step={0.05}
                    value={profile.cgpa}
                    onChange={(e) => set("cgpa", Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.0</span>
                    <span>4.0</span>
                  </div>
                  <FieldError msg={errors.cgpa} />
                </div>
              </div>
            </FormSection>

            <div className="h-px bg-border/60" />

            {/* Section 2 — Preferences */}
            <FormSection title="Preferences">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <p className="mb-1.5 text-xs text-muted-foreground">Type a skill and press Enter</p>
                  <TagInput
                    id="skills"
                    tags={profile.skills}
                    onChange={(tags) => set("skills", tags)}
                    placeholder="Python, React, Machine Learning..."
                  />
                </div>

                <div>
                  <Label htmlFor="interests">Interests</Label>
                  <p className="mb-1.5 text-xs text-muted-foreground">Type an interest and press Enter</p>
                  <TagInput
                    id="interests"
                    tags={profile.interests}
                    onChange={(tags) => set("interests", tags)}
                    placeholder="AI, Fintech, Cybersecurity..."
                  />
                </div>

                {/* Opportunity types */}
                <div>
                  <Label>Opportunity Types I Want</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Object.entries(OPPORTUNITY_TYPE_LABELS) as [OpportunityType, string][]).map(([type, label]) => {
                      const active = profile.opportunityTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleOpportunityType(type)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                            active
                              ? "border-primary/40 bg-primary/15 text-primary"
                              : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground",
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location preference */}
                <div>
                  <Label>Location Preference</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LOCATION_OPTIONS.map(({ value, label }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="radio"
                          name="locationPreference"
                          value={value}
                          checked={profile.locationPreference === value}
                          onChange={() => set("locationPreference", value)}
                          className="accent-primary"
                        />
                        <span className="text-sm text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Financial need */}
                <div>
                  <Label>Financial Need</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FINANCIAL_OPTIONS.map(({ value, label }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="radio"
                          name="financialNeed"
                          value={value}
                          checked={profile.financialNeed === value}
                          onChange={() => set("financialNeed", value)}
                          className="accent-primary"
                        />
                        <span className="text-sm text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>

            <div className="h-px bg-border/60" />

            {/* Section 3 — Experience */}
            <FormSection title="Past Experience">
              <ExperienceInput
                items={profile.pastExperience}
                onChange={(items) => set("pastExperience", items)}
              />
            </FormSection>

            {/* API error */}
            {apiError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {apiError}
              </div>
            )}

            {/* Submit */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="h-12 w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
            >
              {isAnalyzing ? (
                <><Loader2Icon className="size-4 animate-spin" /> Analyzing…</>
              ) : (
                <>Analyze My Inbox <ArrowRightIcon className="size-4" /></>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Emails are processed in memory · Sessions expire in 30 min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <AnalyzePageContent />
    </Suspense>
  );
}
