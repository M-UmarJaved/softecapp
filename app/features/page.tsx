import Link from "next/link";
import {
  ArrowRightIcon, BrainIcon, CheckCircle2Icon, ClockIcon,
  InboxIcon, ShieldCheckIcon, SparklesIcon, TrendingUpIcon,
  UsersIcon, ZapIcon, CalendarIcon, MessageCircleIcon,
  BarChart3Icon, AwardIcon, FileTextIcon, BellIcon,
} from "lucide-react";

function NavBar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0A0F1E]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <InboxIcon className="size-4" />
          </span>
          <span className="font-bold tracking-tight text-white">
            Opportunity<span className="text-blue-400">Inbox</span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {[{ href: "/features", label: "Features" }, { href: "/about", label: "About" }, { href: "/pricing", label: "Pricing" }].map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">{item.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white">Sign in</Link>
          <Link href="/analyze" className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
            Try for free →
          </Link>
        </div>
      </div>
    </nav>
  );
}

const FEATURE_GROUPS = [
  {
    label: "AI Pipeline",
    color: "blue",
    features: [
      { icon: BrainIcon, title: "Grok AI Extraction", desc: "Grok reads every email and extracts deadlines, CGPA requirements, required documents, benefits, and application links — even from messy, unstructured email formats." },
      { icon: ShieldCheckIcon, title: "Two-Layer Spam Filter", desc: "Heuristic keyword detection catches obvious spam instantly. Ambiguous emails go to Grok for classification. Prize scams and promotional emails are removed before scoring." },
      { icon: SparklesIcon, title: "AI Explanations", desc: "The top 3 ranked opportunities get a personalized 3-sentence AI explanation — mentioning your CGPA, skills, and deadline — so you understand exactly why they ranked where they did." },
    ],
  },
  {
    label: "Scoring Engine",
    color: "indigo",
    features: [
      { icon: TrendingUpIcon, title: "Deterministic Scoring", desc: "Our scoring engine (zero AI) ranks opportunities by Profile Fit (40pts), Urgency (30pts), Completeness (20pts), and Preference Match (10pts). Transparent, reproducible, explainable." },
      { icon: BarChart3Icon, title: "Score Breakdown", desc: "Every opportunity shows animated score bars for each dimension. See exactly why an opportunity scored 87/100 — not just a number, but evidence." },
      { icon: UsersIcon, title: "Profile Matching", desc: "Fill in your degree, CGPA, skills, interests, and location preference once. Every opportunity is scored against your specific profile — not a generic student." },
    ],
  },
  {
    label: "Action Tools",
    color: "purple",
    features: [
      { icon: ClockIcon, title: "Live Countdown Timers", desc: "Real-time countdown to the top opportunity's deadline. Deadlines within 7 days shown in red. URGENT badge pulses continuously so you never forget." },
      { icon: CalendarIcon, title: "Calendar ICS Download", desc: "One click adds any deadline to your Google Calendar, Apple Calendar, or Outlook. The ICS file includes the opportunity title, organization, and deadline." },
      { icon: FileTextIcon, title: "Action Checklists", desc: "Step-by-step checklist per opportunity: read email, prepare documents, visit portal, set reminder, submit. Check items off as you complete them." },
    ],
  },
  {
    label: "Export & Share",
    color: "green",
    features: [
      { icon: MessageCircleIcon, title: "WhatsApp Summary", desc: "One click copies a formatted summary of your top 3 opportunities — with deadlines and scores — ready to paste in WhatsApp and share with friends or family." },
      { icon: AwardIcon, title: "PDF Priority Report", desc: "Generate a print-ready PDF report of all ranked opportunities with scores, deadlines, and types. Perfect for sharing with your advisor or keeping offline." },
      { icon: BellIcon, title: "Mark as Applied", desc: "Track which opportunities you've applied to. Applied status is saved locally and persists across sessions. Never apply twice or forget what you submitted." },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue:   "text-blue-400 bg-blue-500/10 ring-blue-500/20",
  indigo: "text-indigo-400 bg-indigo-500/10 ring-indigo-500/20",
  purple: "text-purple-400 bg-purple-500/10 ring-purple-500/20",
  green:  "text-green-400 bg-green-500/10 ring-green-500/20",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-36 text-center sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        </div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Features</p>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight text-white sm:text-6xl">
          Every feature built for{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Pakistani students
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          From AI extraction to calendar downloads — every feature is designed to help you
          act on opportunities before deadlines pass.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 hover:brightness-110">
            Try all features free <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      {/* Feature groups */}
      <div className="mx-auto max-w-7xl space-y-24 px-4 pb-28 sm:px-6 lg:px-8">
        {FEATURE_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="mb-10 flex items-center gap-4">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] ${colorMap[group.color]?.split(" ")[0]} ${colorMap[group.color]?.split(" ")[1]} ring-1 ${colorMap[group.color]?.split(" ")[2]}`}>
                {group.label}
              </span>
              <div className="h-px flex-1 bg-white/6" />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {group.features.map((f) => {
                const Icon = f.icon;
                const cls = colorMap[group.color] ?? "text-blue-400 bg-blue-500/10 ring-blue-500/20";
                return (
                  <div key={f.title}
                    className="rounded-2xl border border-white/6 bg-white/3 p-6 transition-all hover:-translate-y-1 hover:border-white/12 hover:bg-white/5">
                    <span className={`mb-4 flex size-11 items-center justify-center rounded-xl ring-1 ${cls}`}>
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="border-t border-white/6 px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to try every feature?</h2>
        <p className="mx-auto mt-4 max-w-md text-slate-400">No account required. Paste your emails and see results in 30 seconds.</p>
        <Link href="/analyze"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 hover:brightness-110">
          Analyze My Inbox <ArrowRightIcon className="size-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 px-4 py-8 text-center text-xs text-slate-600 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Opportunity Inbox Copilot · Built for SOFTEC &apos;26 · FAST-NUCES Lahore</p>
      </footer>
    </div>
  );
}
