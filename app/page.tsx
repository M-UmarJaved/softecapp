import Link from "next/link";
import {
  ArrowRightIcon, CheckCircle2Icon, ClockIcon, InboxIcon,
  LockIcon, MailOpenIcon, SparklesIcon, ZapIcon, StarIcon,
  TrendingUpIcon, ShieldCheckIcon, UsersIcon, AwardIcon, BrainIcon,
} from "lucide-react";

// ─── Nav ──────────────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0A0F1E]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <InboxIcon className="size-4" />
          </span>
          <span className="font-bold tracking-tight text-white">
            Opportunity<span className="text-blue-400">Inbox</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {[
            { href: "/",         label: "Home" },
            { href: "/features", label: "Features" },
            { href: "/about",    label: "About" },
            { href: "/pricing",  label: "Pricing" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 transition-colors hover:text-white">
            Sign in
          </Link>
          <Link href="/analyze"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110">
            Try for free →
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-32 text-center">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-600/12 blur-[140px]" />
        <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-cyan-500/8 blur-[100px]" />
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      {/* Badge */}
      <div className="animate-fade-in-up relative mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
        <span className="size-1.5 animate-pulse rounded-full bg-blue-400" />
        AI-Powered · Built for Pakistani Students · SOFTEC 2026
      </div>

      {/* Headline — each word fades in with stagger */}
      <h1 className="relative max-w-5xl text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
        <span className="inline-block animate-fade-in-up [animation-delay:80ms]">Never</span>{" "}
        <span className="inline-block animate-fade-in-up [animation-delay:160ms]">miss</span>{" "}
        <span className="inline-block animate-fade-in-up [animation-delay:240ms]">an</span>{" "}
        <span className="relative inline-block animate-fade-in-up [animation-delay:320ms]">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            opportunity
          </span>
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0" />
        </span>{" "}
        <span className="inline-block animate-fade-in-up [animation-delay:400ms]">again.</span>
      </h1>

      {/* Sub — fades in as a block */}
      <p className="animate-fade-in-up relative mt-7 max-w-2xl text-lg leading-relaxed text-slate-400 [animation-delay:520ms]">
        Paste your inbox emails. Our AI extracts deadlines, eligibility, and requirements —
        then ranks every opportunity by how well it fits <em className="text-slate-300 not-italic">you</em>.
        Get a personalized action plan in under 30 seconds.
      </p>

      {/* CTAs */}
      <div className="animate-fade-in-up relative mt-10 flex flex-wrap items-center justify-center gap-4 [animation-delay:300ms]">
        <Link href="/analyze"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/50">
          Analyze My Inbox
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/analyze?demo=true"
          className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/20 hover:bg-white/8">
          <SparklesIcon className="size-4 text-blue-400" />
          See live demo
        </Link>
      </div>

      {/* Social proof */}
      <div className="animate-fade-in-up relative mt-14 flex flex-wrap items-center justify-center gap-8 [animation-delay:400ms]">
        {[
          { icon: CheckCircle2Icon, value: "15 emails", label: "analyzed in 8 seconds" },
          { icon: TrendingUpIcon,   value: "100/100",   label: "max opportunity score" },
          { icon: LockIcon,         value: "Private",   label: "data never stored" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <Icon className="size-4 shrink-0 text-blue-400" />
            <span className="font-bold text-white">{value}</span>
            <span className="text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Floating cards */}
      <div className="animate-fade-in-up relative mt-20 w-full max-w-4xl [animation-delay:500ms]">
        <div className="relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117]/80 shadow-2xl shadow-black/60 backdrop-blur-sm">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/8 bg-white/3 px-4 py-3">
            <span className="size-3 rounded-full bg-red-500/70" />
            <span className="size-3 rounded-full bg-yellow-500/70" />
            <span className="size-3 rounded-full bg-green-500/70" />
            <span className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-center text-xs text-slate-500">
              inboxcopilot.vercel.app/results/demo
            </span>
          </div>
          {/* Mock result */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">#1</span>
                <div>
                  <p className="font-semibold text-white">HEC Need-Based Scholarship 2026</p>
                  <p className="text-xs text-slate-400">Higher Education Commission · Scholarship</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-400 animate-pulse">URGENT</span>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-300">90/100</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { label: "Profile Fit", v: 35, max: 40, color: "from-blue-500 to-indigo-500" },
                { label: "Urgency",     v: 25, max: 30, color: "from-red-500 to-orange-500" },
                { label: "Completeness",v: 20, max: 20, color: "from-green-500 to-emerald-500" },
                { label: "Preference",  v: 10, max: 10, color: "from-purple-500 to-violet-500" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-slate-400">{b.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                    <div className={`h-full rounded-full bg-gradient-to-r ${b.color} animate-bar-fill`}
                      style={{ "--bar-width": `${(b.v / b.max) * 100}%` } as React.CSSProperties} />
                  </div>
                  <span className="w-8 text-right tabular-nums text-slate-400">{b.v}/{b.max}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ticker ─────────────────────────────────────────────────────────────

function StatsTicker() {
  const items = [
    "⚡ 6-hour hackathon build",
    "📧 Up to 15 emails analyzed",
    "🎯 Personalized ranking",
    "🔒 Data stays private",
    "🤖 AI-powered extraction",
    "✅ Spam auto-filtered",
    "📅 Deadline tracking",
    "🏆 Evidence-backed scores",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="border-y border-white/6 bg-white/2 py-4 overflow-hidden">
      <div className="flex animate-ticker gap-12 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-medium text-slate-400">{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BrainIcon,
    title: "AI-Powered Extraction",
    desc: "Grok AI reads every email and extracts deadlines, CGPA requirements, required documents, benefits, and application links — even from messy formats.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: TrendingUpIcon,
    title: "Deterministic Scoring",
    desc: "Our scoring engine (not AI) ranks opportunities by Profile Fit (40pts), Urgency (30pts), Completeness (20pts), and Preference Match (10pts).",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: ClockIcon,
    title: "Deadline Intelligence",
    desc: "Live countdown timers, urgency badges, and calendar ICS downloads. Never miss a deadline again — get reminded 3 days before.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: ShieldCheckIcon,
    title: "Spam Detection",
    desc: "Two-layer spam filter (heuristic + AI) automatically removes prize scams and promotional emails before they waste your time.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: UsersIcon,
    title: "Student Profile Matching",
    desc: "Fill in your degree, CGPA, skills, and interests once. Every opportunity is scored against your specific profile — not a generic student.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: AwardIcon,
    title: "Action Checklists",
    desc: "Each opportunity comes with a step-by-step checklist: prepare documents, visit portal, set reminders. Check items off as you go.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

function FeaturesSection() {
  return (
    <section className="border-t border-white/6 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Features</p>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Everything you need to act fast
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Built specifically for Pakistani university students navigating scholarships,
            internships, and competitions.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title}
                className={`group rounded-2xl border border-white/6 bg-white/3 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/12 hover:bg-white/5 hover:shadow-xl hover:shadow-black/30 animate-fade-in-up stagger-${Math.min(i, 7)}`}>
                <span className={`mb-4 flex size-11 items-center justify-center rounded-xl ${f.bg} ${f.color} ring-1 ring-white/8`}>
                  <Icon className="size-5" />
                </span>
                <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      n: "01", icon: MailOpenIcon, color: "from-blue-500 to-cyan-500",
      title: "Paste your emails",
      desc: "Copy-paste 5–15 opportunity emails — scholarships, internships, competitions, fellowships. Or load our 8 sample emails instantly.",
    },
    {
      n: "02", icon: SparklesIcon, color: "from-indigo-500 to-purple-500",
      title: "AI analyzes everything",
      desc: "Grok AI classifies each email, extracts all structured data, and our spam filter removes junk before it wastes your time.",
    },
    {
      n: "03", icon: ZapIcon, color: "from-orange-500 to-red-500",
      title: "Get your priority list",
      desc: "A ranked list with scores, evidence, deadlines, and action checklists — personalized to your profile. Ready in under 30 seconds.",
    },
  ];

  return (
    <section className="border-t border-white/6 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">How it works</p>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            From inbox chaos to clear action
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
            Three steps. Under 30 seconds. No account required.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className={`relative text-center animate-fade-in-up stagger-${i}`}>
                <div className="relative mx-auto mb-6 flex size-24 items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-15 blur-xl`} />
                  <div className={`relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-2xl`}>
                    <Icon className="size-8 text-white" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[#0A0F1E] text-xs font-black text-slate-400 ring-1 ring-white/10">
                    {step.n}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Ayesha Khan",
    role: "BS CS, FAST-NUCES Lahore",
    text: "I had 12 emails sitting unread. This tool found 3 urgent scholarships I was about to miss. Got my HEC application in on time!",
    stars: 5,
  },
  {
    name: "Ali Raza",
    role: "MS Data Science, NUST",
    text: "The scoring engine is incredibly accurate. It matched my Python and React skills to the right internships and filtered out all the spam.",
    stars: 5,
  },
  {
    name: "Fatima Malik",
    role: "BBA, IBA Karachi",
    text: "The action checklist feature is a game changer. It told me exactly what documents to prepare and when to submit. Saved me hours.",
    stars: 5,
  },
];

function TestimonialsSection() {
  return (
    <section className="border-t border-white/6 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Student stories</p>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Trusted by students across Pakistan
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name}
              className={`rounded-2xl border border-white/8 bg-white/3 p-6 animate-fade-in-up stagger-${i}`}>
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <StarIcon key={j} className="size-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-slate-300">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="border-t border-white/6 px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/12 via-indigo-600/8 to-transparent p-12 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
        </div>
        <div className="relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Get started free</p>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Your next opportunity<br />is already in your inbox.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-slate-400">
            Don&apos;t let it expire unread. Paste your emails and get a ranked priority list in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/analyze"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/50">
              Analyze My Inbox Now
              <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            100% free · No signup required · Results in under 30 seconds
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <InboxIcon className="size-4" />
              </span>
              <span className="font-bold text-white">
                Opportunity<span className="text-blue-400">Inbox</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              AI-powered opportunity ranking for Pakistani university students.
              Find what matters. Act before deadlines.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Product</p>
            <ul className="space-y-2.5">
              {[
                { href: "/features", label: "Features" },
                { href: "/analyze",  label: "Try it free" },
                { href: "/pricing",  label: "Pricing" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Company</p>
            <ul className="space-y-2.5">
              {[
                { href: "/about",   label: "About" },
                { href: "/login",   label: "Sign in" },
                { href: "/waitlist",label: "Join waitlist" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Opportunity Inbox Copilot · Built for SOFTEC &apos;26 · FAST-NUCES Lahore
          </p>
          <p className="text-xs text-slate-600">
            Powered by Grok AI · Next.js 16 · Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <NavBar />
      <HeroSection />
      <StatsTicker />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
