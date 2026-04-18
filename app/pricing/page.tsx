import Link from "next/link";
import {
  ArrowRightIcon, CheckIcon, InboxIcon, SparklesIcon, ZapIcon, BuildingIcon,
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

const PLANS = [
  {
    name: "Free",
    icon: SparklesIcon,
    price: "PKR 0",
    period: "forever",
    desc: "Perfect for trying out the tool and occasional use.",
    gradient: "from-slate-700 to-slate-600",
    border: "border-white/10",
    cta: "Get started free",
    ctaHref: "/analyze",
    ctaStyle: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    features: [
      "5 email analyses per day",
      "Up to 10 emails per analysis",
      "AI extraction with Grok",
      "Deterministic scoring",
      "Spam detection",
      "Action checklists",
      "WhatsApp sharing",
      "Results expire in 30 minutes",
    ],
    missing: ["Save results to account", "Calendar ICS download", "PDF export", "History dashboard"],
  },
  {
    name: "Student",
    icon: ZapIcon,
    price: "PKR 299",
    period: "per month",
    desc: "For serious students who want to track every opportunity.",
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-500/40",
    badge: "Most Popular",
    cta: "Join waitlist",
    ctaHref: "/waitlist",
    ctaStyle: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 hover:brightness-110",
    features: [
      "Unlimited analyses",
      "Up to 15 emails per analysis",
      "AI extraction with Grok",
      "Deterministic scoring",
      "Spam detection",
      "Action checklists",
      "WhatsApp sharing",
      "Save results forever",
      "Calendar ICS download",
      "PDF export",
      "History dashboard",
      "AI Coach chatbot",
    ],
    missing: [],
  },
  {
    name: "University",
    icon: BuildingIcon,
    price: "Custom",
    period: "per institution",
    desc: "For career centers and student affairs offices.",
    gradient: "from-purple-500 to-violet-600",
    border: "border-purple-500/30",
    cta: "Contact us",
    ctaHref: "mailto:contact@inboxcopilot.pk",
    ctaStyle: "border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20",
    features: [
      "Everything in Student",
      "Bulk student onboarding",
      "Admin dashboard",
      "Analytics & reporting",
      "Custom opportunity database",
      "Dedicated support",
      "API access",
      "White-label option",
    ],
    missing: [],
  },
];

const FAQ = [
  { q: "Is the free plan really free?", a: "Yes. No credit card required. You can analyze up to 5 batches of emails per day, with up to 10 emails each, completely free." },
  { q: "Do I need to create an account?", a: "No account needed for the free plan. Just go to /analyze, paste your emails, and get results. An account lets you save results and access history." },
  { q: "What AI model powers the extraction?", a: "We use Grok AI (by xAI) for email extraction and classification, and a deterministic scoring engine (no AI) for ranking. This gives you transparent, reproducible scores." },
  { q: "Is my email data private?", a: "Yes. Emails are processed in memory and never stored without your consent. Free plan results expire in 30 minutes. Paid plans store results in your private account." },
  { q: "When will the Student plan launch?", a: "We're currently in beta. Join the waitlist to get early access and a discounted launch price." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-36 text-center sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        </div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Pricing</p>
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight text-white sm:text-6xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
          Start free. Upgrade when you need more. No hidden fees, no surprises.
        </p>
      </section>

      {/* Plans */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.name}
                className={`relative rounded-2xl border ${plan.border} bg-white/3 p-7 transition-all hover:-translate-y-1`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                    {plan.badge}
                  </span>
                )}

                <div className={`mb-5 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} shadow-lg`}>
                  <Icon className="size-5 text-white" />
                </div>

                <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{plan.desc}</p>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="ml-2 text-sm text-slate-500">/{plan.period}</span>
                </div>

                <Link href={plan.ctaHref}
                  className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-bold transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>

                <div className="mt-7 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-green-400" />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-35">
                      <span className="mt-0.5 size-4 shrink-0 text-center text-xs text-slate-500">✕</span>
                      <span className="text-sm text-slate-500">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/6 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">FAQ</p>
            <h2 className="text-3xl font-extrabold text-white">Common questions</h2>
          </div>
          <div className="space-y-5">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/6 bg-white/3 p-6">
                <h3 className="mb-2 font-bold text-white">{item.q}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/6 px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white">Start for free today</h2>
        <p className="mx-auto mt-4 max-w-md text-slate-400">No credit card. No account. Just paste your emails.</p>
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
