import Link from "next/link";
import {
  ArrowRightIcon, InboxIcon, GraduationCapIcon, HeartIcon,
  CodeIcon, ZapIcon, UsersIcon, TargetIcon,
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

const TEAM = [
  {
    name: "Muhammad Umar Javed",
    role: "Full-Stack Developer & AI Engineer",
    university: "FAST-NUCES Lahore",
    bio: "Built the complete AI pipeline, scoring engine, and frontend. Passionate about making AI accessible to Pakistani students.",
    gradient: "from-blue-500 to-indigo-600",
    initials: "MU",
  },
];

const VALUES = [
  { icon: GraduationCapIcon, title: "Student-First", desc: "Every decision is made with Pakistani university students in mind — their constraints, their opportunities, their deadlines." },
  { icon: HeartIcon, title: "Genuinely Helpful", desc: "We don't just show you data. We tell you what to do, in what order, with what documents. Actionable, not informational." },
  { icon: CodeIcon, title: "Transparent AI", desc: "Our scoring engine is deterministic — no black box. You can see exactly why each opportunity ranked where it did." },
  { icon: ZapIcon, title: "Speed Matters", desc: "Deadlines don't wait. Our pipeline processes 15 emails in under 30 seconds. Every second saved is a second closer to submitting." },
];

const STATS = [
  { value: "6 hrs", label: "to build v1 at SOFTEC 2026" },
  { value: "8", label: "sample emails with spam detection" },
  { value: "100pts", label: "max opportunity score" },
  { value: "30s", label: "average analysis time" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-36 text-center sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">About us</p>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight text-white sm:text-6xl">
          Built in 6 hours.<br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Built for a lifetime of opportunities.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Opportunity Inbox Copilot was built at SOFTEC 2026 — the annual hackathon at FAST-NUCES Lahore.
          The problem was real: students miss scholarships and internships because their inboxes are overwhelming.
        </p>
      </section>

      {/* Stats */}
      <section className="border-y border-white/6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">The story</p>
          <h2 className="mb-8 text-3xl font-extrabold text-white">Why we built this</h2>
          <div className="space-y-5 text-base leading-relaxed text-slate-400">
            <p>
              Every semester, Pakistani university students receive dozens of emails about scholarships,
              internships, competitions, and fellowships. Most of these emails go unread — buried under
              promotional content, spam, and the general chaos of a student inbox.
            </p>
            <p>
              The ones that do get read are often acted on too late. A student realizes a scholarship
              deadline was yesterday. An internship application window closed last week. A competition
              registration ended this morning.
            </p>
            <p>
              <span className="text-white font-semibold">Opportunity Inbox Copilot</span> solves this.
              Paste your emails, fill in your profile, and get a ranked priority list in under 30 seconds.
              Every opportunity is scored against your specific CGPA, skills, and preferences.
              Spam is filtered automatically. Deadlines are tracked in real time.
            </p>
            <p>
              Built at SOFTEC 2026 in 6 hours. Powered by Grok AI and a deterministic scoring engine
              that gives you transparent, evidence-backed rankings — not a black box.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-white/6 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Our values</p>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">What we stand for</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-2xl border border-white/6 bg-white/3 p-6">
                  <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mb-2 font-bold text-white">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-white/6 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">The team</p>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Built by students, for students</h2>
          </div>
          <div className="flex justify-center">
            {TEAM.map((member) => (
              <div key={member.name} className="max-w-sm rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
                <div className={`mx-auto mb-5 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${member.gradient} text-2xl font-black text-white shadow-xl`}>
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-blue-400">{member.role}</p>
                <p className="mt-1 text-xs text-slate-500">{member.university}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-white/6 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Tech stack</p>
          <h2 className="mb-8 text-2xl font-extrabold text-white">Built with modern tools</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Supabase", "Grok AI", "OpenAI SDK", "Recharts"].map((tech) => (
              <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/6 px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white">Try it yourself</h2>
        <p className="mx-auto mt-4 max-w-md text-slate-400">No account required. Paste your emails and see results in 30 seconds.</p>
        <Link href="/analyze"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 hover:brightness-110">
          Analyze My Inbox <ArrowRightIcon className="size-5" />
        </Link>
      </section>

      <footer className="border-t border-white/6 px-4 py-8 text-center text-xs text-slate-600 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Opportunity Inbox Copilot · Built for SOFTEC &apos;26 · FAST-NUCES Lahore</p>
      </footer>
    </div>
  );
}
