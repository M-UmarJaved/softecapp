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
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  InboxIcon,
  Loader2Icon,
  MailIcon,
  PlusIcon,
  SaveIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { InboxSimulator } from "@/components/InboxSimulator";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { GmailImport } from "@/components/GmailImport";
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
      <div className="flex items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">{title}</p>
        <div className="h-px flex-1 bg-white/8" />
      </div>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-400">{msg}</p>;
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

  // Gmail state — check if connected via cookie (server sets it, we detect via query param)
  const [gmailConnected, setGmailConnected] = useState(false);

  // Profile save state
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileSaved,   setProfileSaved]   = useState(false);
  const [profileLoaded,  setProfileLoaded]  = useState(false);

  // Auto-load sample on ?demo=true, detect gmail_connected=1 from callback
  // Also load saved profile on mount
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      const text = getSampleEmailText();
      setEmailText(text);
      setEmails(SAMPLE_EMAILS);
      setEmailTab("sample");
    }
    if (searchParams.get("gmail_connected") === "1") {
      setGmailConnected(true);
    }
    if (searchParams.get("gmail_error")) {
      setApiError(`Gmail connection failed: ${searchParams.get("gmail_error")}`);
    }

    // Load saved profile from server (only if logged in)
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: { profile?: StudentProfileSpec | null }) => {
        if (data.profile) {
          setProfile(data.profile);
          setProfileLoaded(true);
        }
      })
      .catch(() => { /* not logged in or no profile yet — use defaults */ });
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

  const handleGmailImport = (importedEmails: RawEmail[]) => {
    // Replace all current emails with Gmail emails (don't merge with samples)
    setEmails(importedEmails.slice(0, 15));
    setEmailTab("paste"); // switch away from sample tab
    const text = importedEmails
      .slice(0, 15)
      .map((e) => `Subject: ${e.subject}\nFrom: ${e.sender ?? ""}\n${e.body}`)
      .join("\n---\n");
    setEmailText(text);
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

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      }
    } catch { /* silent */ } finally {
      setProfileSaving(false);
    }
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (emails.length < 5)  errs.emails    = `Please provide at least 5 emails for a meaningful analysis. You have ${emails.length} — add ${5 - emails.length} more.`;
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
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-indigo-600/6 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>
      {/* Processing overlay — shown while analyzing */}
      {isAnalyzing && (
        <ProcessingOverlay
          apiDone={apiDone}
          hints={hints}
          onComplete={handleProcessingComplete}
        />
      )}
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/8 bg-[#0A0F1E]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition-all hover:border-white/20 hover:bg-white/8 hover:text-white">
              <ArrowLeftIcon className="size-4" />
              Home
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <InboxIcon className="size-3.5" />
              </span>
              <h1 className="font-bold text-white">Analyze Inbox</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                {emails.length} email{emails.length !== 1 ? "s" : ""} loaded
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-extrabold text-white">
            Analyze your opportunity emails
          </h2>
          <p className="mt-1.5 text-slate-400">
            Paste 5–15 emails, fill your profile, and get a ranked priority list in under 30 seconds.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          {/* ── LEFT: Email Input ─────────────────────────────────────────── */}
          <div className="space-y-4 animate-fade-in-up [animation-delay:100ms]">

            {/* Gmail import */}
            <GmailImport
              isConnected={gmailConnected}
              onConnectedChange={setGmailConnected}
              onEmailsImported={handleGmailImport}
            />

            {/* Tab switcher */}
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/4 p-1">
              {(["paste", "sample"] as EmailTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setEmailTab(tab);
                    // Only auto-load samples if no real emails are loaded yet
                    if (tab === "sample" && emails.length === 0) handleLoadSample();
                  }}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    emailTab === tab
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {tab === "paste" ? (
                    <span className="flex items-center justify-center gap-2">
                      <MailIcon className="size-4" /> Paste Emails
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <SparklesIcon className="size-4 text-blue-400" /> Load Sample Emails
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="email-textarea" className="text-sm font-medium text-slate-300">
                  {emailTab === "paste" ? "Paste emails — separate each with ---" : "Sample emails loaded"}
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
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

              <textarea
                id="email-textarea"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                className="min-h-72 w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 font-mono text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={`Subject: Scholarship Opportunity 2026\nFrom: admissions@university.edu\nApplications are open for a fully funded scholarship...\n---\nSubject: Summer Internship Program\nFrom: careers@company.com\n...`}
              />

              {errors.emails && (
                <p className="text-xs text-red-400">{errors.emails}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleParse}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/8 hover:text-white">
                  <MailIcon className="size-3.5" /> Parse Emails
                </button>
                <button type="button" onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:bg-blue-500/20">
                  <SparklesIcon className="size-3.5" /> Load 8 Sample Emails
                </button>
                {emailText && (
                  <button type="button" onClick={() => { setEmailText(""); setEmails([]); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:text-slate-300">
                    <XIcon className="size-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Inbox preview */}
            {emails.length > 0 && (
              <div className="space-y-2 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {emails.length} email{emails.length !== 1 ? "s" : ""} detected
                  </p>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    emails.length >= 5 && emails.length <= 15
                      ? "border border-green-500/30 bg-green-500/10 text-green-400"
                      : emails.length > 0 && emails.length < 5
                      ? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                      : "border border-red-500/30 bg-red-500/10 text-red-400",
                  )}>
                    {emails.length === 0 ? "No emails" : emails.length < 5 ? `Need ${5 - emails.length} more (min 5)` : emails.length > 15 ? "Max 15 allowed" : "✓ Ready"}
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
          <div className="space-y-7 rounded-2xl border border-white/10 bg-white/3 p-7 backdrop-blur-sm animate-fade-in-up [animation-delay:200ms]">

            {/* Section 1 — Academic Info */}
            <FormSection title="Academic Info">
              <div className="space-y-5">

                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-200">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ayesha Khan"
                    className={cn("h-11 text-sm", errors.name && "border-destructive")}
                  />
                  <FieldError msg={errors.name} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="university" className="block text-sm font-semibold text-slate-200">
                    University
                  </label>
                  <Input
                    id="university"
                    value={profile.university}
                    onChange={(e) => set("university", e.target.value)}
                    placeholder="FAST-NUCES Lahore"
                    className="h-11 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="degree" className="block text-sm font-semibold text-slate-200">
                      Degree
                    </label>
                    <select
                      id="degree"
                      value={profile.degree}
                      onChange={(e) => set("degree", e.target.value as StudentProfileSpec["degree"])}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                    >
                      {DEGREE_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="program" className="block text-sm font-semibold text-slate-200">
                      Program <span className="text-red-400">*</span>
                    </label>
                    <Input
                      id="program"
                      value={profile.program}
                      onChange={(e) => set("program", e.target.value)}
                      placeholder="Computer Science"
                      className={cn("h-11 text-sm", errors.program && "border-destructive")}
                    />
                    <FieldError msg={errors.program} />
                  </div>
                </div>

                {/* Semester slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="semester" className="text-sm font-semibold text-slate-200">
                      Semester
                    </label>
                    <span className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-sm font-bold text-blue-400">
                      {profile.semester} / {profile.degree === "BS" || profile.degree === "BBA" ? 8 : 4}
                    </span>
                  </div>
                  <input
                    id="semester"
                    type="range"
                    min={1}
                    max={profile.degree === "BS" || profile.degree === "BBA" ? 8 : 4}
                    value={profile.semester}
                    onChange={(e) => set("semester", Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1st</span>
                    <span>{profile.degree === "BS" || profile.degree === "BBA" ? "8th" : "4th"}</span>
                  </div>
                </div>

                {/* CGPA slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="cgpa" className="text-sm font-semibold text-slate-200">
                      CGPA
                    </label>
                    <span className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-sm font-bold text-blue-400">
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
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0.0</span>
                    <span>4.0</span>
                  </div>
                  <FieldError msg={errors.cgpa} />
                </div>
              </div>
            </FormSection>

            <div className="h-px bg-white/8" />

            {/* Section 2 — Preferences */}
            <FormSection title="Preferences">
              <div className="space-y-5">

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">Skills</label>
                  <p className="text-xs text-slate-500">Type a skill and press Enter to add</p>
                  <TagInput
                    id="skills"
                    tags={profile.skills}
                    onChange={(tags) => set("skills", tags)}
                    placeholder="Python, React, Machine Learning..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">Interests</label>
                  <p className="text-xs text-slate-500">Type an interest and press Enter to add</p>
                  <TagInput
                    id="interests"
                    tags={profile.interests}
                    onChange={(tags) => set("interests", tags)}
                    placeholder="AI, Fintech, Cybersecurity..."
                  />
                </div>

                {/* Opportunity types */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">
                    Opportunity Types I Want
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(Object.entries(OPPORTUNITY_TYPE_LABELS) as [OpportunityType, string][]).map(([type, label]) => {
                      const active = profile.opportunityTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleOpportunityType(type)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                            active
                              ? "border-blue-500/40 bg-blue-500/15 text-blue-300"
                              : "border-white/10 bg-white/4 text-slate-400 hover:border-white/20 hover:text-white",
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location preference */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">
                    Location Preference
                  </label>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {LOCATION_OPTIONS.map(({ value, label }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="locationPreference"
                          value={value}
                          checked={profile.locationPreference === value}
                          onChange={() => set("locationPreference", value)}
                          className="accent-blue-500 size-3.5"
                        />
                        <span className="text-sm text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Financial need */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">
                    Financial Need
                  </label>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {FINANCIAL_OPTIONS.map(({ value, label }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="financialNeed"
                          value={value}
                          checked={profile.financialNeed === value}
                          onChange={() => set("financialNeed", value)}
                          className="accent-blue-500 size-3.5"
                        />
                        <span className="text-sm text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>

            <div className="h-px bg-white/8" />

            {/* Section 3 — Experience */}
            <FormSection title="Past Experience">
              <ExperienceInput
                items={profile.pastExperience}
                onChange={(items) => set("pastExperience", items)}
              />
            </FormSection>

            {/* Save profile button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all",
                  profileSaved
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/8 hover:text-white",
                )}
              >
                {profileSaving ? (
                  <><Loader2Icon className="size-4 animate-spin" /> Saving…</>
                ) : profileSaved ? (
                  <><CheckCircle2Icon className="size-4" /> Profile Saved!</>
                ) : (
                  <><SaveIcon className="size-4" /> Save Profile</>
                )}
              </button>
              {profileLoaded && (
                <span className="rounded-lg border border-blue-500/20 bg-blue-500/8 px-3 py-2.5 text-xs font-semibold text-blue-400">
                  ✓ Loaded
                </span>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isAnalyzing ? (
                <><Loader2Icon className="size-5 animate-spin" /> Analyzing…</>
              ) : (
                <>Analyze My Inbox <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>

            <p className="text-center text-xs text-slate-600">
              Emails processed in memory · Sessions expire in 30 min
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
