import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  InboxIcon,
  LockIcon,
  MailOpenIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { value: "15 emails", label: "analyzed in 8 seconds" },
  { value: "Real-time", label: "priority ranking" },
  { value: "100% private", label: "nothing stored without you" },
];

const STEPS = [
  {
    icon: MailOpenIcon,
    step: "01",
    title: "Paste Your Emails",
    description:
      "Copy-paste 5–15 opportunity emails you've received — scholarships, internships, competitions, anything.",
  },
  {
    icon: SparklesIcon,
    step: "02",
    title: "AI Analyzes Everything",
    description:
      "Grok extracts deadlines, eligibility, required documents, and benefits from every email in seconds.",
  },
  {
    icon: ZapIcon,
    step: "03",
    title: "Get Your Priority List",
    description:
      "A deterministic scoring engine ranks each opportunity by fit, urgency, and completeness — with evidence.",
  },
];

const SAMPLE_CARD = {
  rank: 1,
  title: "Fully Funded MS Scholarship — Germany 2026",
  org: "Global Scholarships Foundation",
  type: "Scholarship",
  score: 87,
  priority: "URGENT",
  deadline: "30 May 2026",
  daysLeft: 12,
  reasons: [
    "CGPA 3.4 meets the minimum requirement of 3.0",
    "Computer Science matches listed eligible majors",
    "Deadline in 12 days — immediate action required",
  ],
  checklist: ["Prepare CV", "Get transcript", "Write statement of purpose"],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0F172A]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-blue-500 text-white">
            <InboxIcon className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-wide text-white">
            Opportunity Inbox
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard/opportunities"
            className="rounded-lg bg-blue-500 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-400"
          >
            Try it free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-32 text-center sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -left-32 top-1/3 h-64 w-64 rounded-full bg-blue-600/8 blur-3xl" />
        <div className="absolute -right-32 top-1/2 h-64 w-64 rounded-full bg-indigo-500/8 blur-3xl" />
      </div>

      {/* Badge */}
      <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
        <SparklesIcon className="size-3.5" />
        AI-Powered · Grok + Deterministic Scoring
      </div>

      {/* Headline */}
      <h1 className="relative max-w-4xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
        Your inbox has{" "}
        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          opportunities
        </span>{" "}
        you&apos;re missing.
      </h1>

      {/* Sub */}
      <p className="relative mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
        Opportunity Inbox Copilot scans your emails, finds what matters, and
        tells you exactly what to do first — ranked by fit, urgency, and
        completeness.
      </p>

      {/* CTAs */}
      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-blue-400/30"
        >
          Try it now
          <ArrowRightIcon className="size-4" />
        </Link>

        <Link
          href="/analyze?demo=true"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/25 hover:bg-white/10"
        >
          See a demo
        </Link>
      </div>

      {/* Stats row */}
      <div className="relative mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 text-sm">
            <CheckCircle2Icon className="size-4 shrink-0 text-blue-400" />
            <span className="font-semibold text-white">{stat.value}</span>
            <span className="text-slate-400">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            How it works
          </p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            From inbox chaos to clear priorities
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Three steps. Under 30 seconds. No account required to try.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-6 transition-colors hover:border-blue-500/30 hover:bg-white/6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SampleOutputSection() {
  return (
    <section className="border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Sample output
          </p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            This is what you get
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Every opportunity gets a score, a priority badge, evidence-backed
            reasons, and a step-by-step action checklist.
          </p>
        </div>

        {/* Sample card */}
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/4 shadow-2xl shadow-black/40">
          {/* Card header */}
          <div className="border-b border-white/8 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  {SAMPLE_CARD.rank}
                </span>
                <div>
                  <p className="font-heading text-base font-semibold text-white">
                    {SAMPLE_CARD.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {SAMPLE_CARD.org} · {SAMPLE_CARD.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-red-400">
                  {SAMPLE_CARD.priority}
                </span>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-300">
                  {SAMPLE_CARD.score}/100
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
              <ClockIcon className="size-3.5" />
              Deadline: {SAMPLE_CARD.deadline} · {SAMPLE_CARD.daysLeft} days left
            </div>
          </div>

          {/* Score bars */}
          <div className="border-b border-white/8 p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Score breakdown
            </p>
            {[
              { label: "Profile Fit", value: 34, max: 40 },
              { label: "Urgency",     value: 25, max: 30 },
              { label: "Completeness", value: 20, max: 20 },
              { label: "Preference",  value: 8,  max: 10 },
            ].map((bar) => (
              <div key={bar.label} className="mb-2 flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-slate-400">{bar.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(bar.value / bar.max) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-slate-400">
                  {bar.value}/{bar.max}
                </span>
              </div>
            ))}
          </div>

          {/* Reasons */}
          <div className="border-b border-white/8 p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Evidence
            </p>
            <ul className="space-y-1.5">
              {SAMPLE_CARD.reasons.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-400" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Checklist */}
          <div className="p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Action checklist
            </p>
            <ul className="space-y-2">
              {SAMPLE_CARD.checklist.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-slate-300"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-slate-500">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyStrip() {
  return (
    <section className="border-t border-white/8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
          <LockIcon className="size-5" />
        </span>
        <h3 className="font-heading text-xl font-semibold text-white">
          100% private by design
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-slate-400">
          Your emails are processed in memory and never stored without your
          consent. Sessions expire in 30 minutes. No email content is used for
          training.
        </p>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-indigo-500/8 to-transparent p-10 text-center shadow-2xl shadow-blue-500/10">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-transparent" />
        <h2 className="relative font-heading text-3xl font-bold text-white sm:text-4xl">
          Stop missing deadlines.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-slate-400">
          Paste your emails and get a ranked priority list in under 30 seconds.
          No sign-up required.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-400"
          >
            Analyze my emails
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3 text-sm font-semibold text-white transition-all hover:border-white/25 hover:bg-white/5"
          >
            Sign in to save results
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center text-xs text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded bg-blue-500/20 text-blue-400">
            <InboxIcon className="size-3" />
          </span>
          <span className="font-heading font-semibold text-slate-400">Opportunity Inbox Copilot</span>
        </div>
        <p>Built for SOFTEC &apos;26 · FAST-NUCES Lahore</p>
        <p>© {new Date().getFullYear()} · All rights reserved</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <NavBar />
      <HeroSection />
      <HowItWorksSection />
      <SampleOutputSection />
      <PrivacyStrip />
      <CtaBanner />
      <Footer />
    </div>
  );
}
