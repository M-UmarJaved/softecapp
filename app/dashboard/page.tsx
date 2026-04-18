import Link from "next/link";
import {
  ArrowRightIcon,
  Clock3Icon,
  InboxIcon,
  MailOpenIcon,
  TrophyIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

async function getDashboardStats() {
  try {
    const supabase = await createClient();

    const { data: sessions, error } = await supabase
      .from("analysis_sessions")
      .select("id, session_id, total_opportunities, created_at, results, student_profile")
      .order("created_at", { ascending: false })
      .limit(20);

    // Table doesn't exist yet — return empty state gracefully
    if (error) return { sessions: [], totalOpportunities: 0, urgentCount: 0, dbReady: false };
    if (!sessions || sessions.length === 0) {
      return { sessions: [], totalOpportunities: 0, urgentCount: 0, dbReady: true };
    }

    const totalOpportunities = sessions.reduce(
      (sum, s) => sum + (s.total_opportunities ?? 0), 0,
    );

    let urgentCount = 0;
    for (const session of sessions) {
      const raw = session.results as Record<string, unknown> | null;
      const opps = Array.isArray(raw?.opportunities)
        ? (raw.opportunities as Array<Record<string, unknown>>)
        : Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
      urgentCount += opps.filter((r) => {
        const d = r.urgencyDays as number | null | undefined;
        return d !== null && d !== undefined && d <= 3 && d >= 0;
      }).length;
    }

    return { sessions, totalOpportunities, urgentCount, dbReady: true };
  } catch {
    return { sessions: [], totalOpportunities: 0, urgentCount: 0, dbReady: false };
  }
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function DashboardPage() {
  const { sessions, totalOpportunities, urgentCount, dbReady } = await getDashboardStats();

  const statCards = [
    {
      title: "Analyses Run",
      value: String(sessions.length),
      detail: "Total sessions this account",
      icon: MailOpenIcon,
    },
    {
      title: "Opportunities Found",
      value: String(totalOpportunities),
      detail: "Across all analyses",
      icon: TrophyIcon,
    },
    {
      title: "Urgent Deadlines",
      value: String(urgentCount),
      detail: "Deadlines within 3 days",
      icon: Clock3Icon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* DB not set up yet — show setup banner */}
      {!dbReady && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 px-5 py-4">
          <p className="text-sm font-semibold text-yellow-400">⚠ Database tables not set up yet</p>
          <p className="mt-1 text-xs text-yellow-400/70">
            Run the SQL in <code className="font-mono">supabase/migrations/005_complete_setup.sql</code> in your{" "}
            <a href={`https://supabase.com/dashboard/project/cpmbgrjxkzctriyjizzc/sql/new`}
              target="_blank" rel="noreferrer" className="underline">
              Supabase SQL Editor
            </a>{" "}
            to enable data persistence.
          </p>
        </div>
      )}
      {/* Hero CTA card */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/6 to-transparent p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Analyze your opportunity emails
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste 5–15 emails, fill your profile, and get a ranked priority list in under 30 seconds.
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40 hover:brightness-110"
          >
            <InboxIcon className="size-4" />
            Analyze New Emails
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="surface-glass border-border/70">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-[0.14em]">
                  {card.title}
                </CardDescription>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-heading text-3xl leading-none">
                    {card.value}
                  </CardTitle>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon className="size-4" />
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Recent sessions */}
      <Card className="surface-glass border-border/70">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-xl">Recent Analyses</CardTitle>
              <CardDescription>Your past sessions — click to view results.</CardDescription>
            </div>
            <Link href="/analyze"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
              <InboxIcon className="size-3.5" />
              New Analysis
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <InboxIcon className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">No analyses yet.</p>
              <Link href="/analyze"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Run your first analysis →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s, index) => {
                const profile = s.student_profile as Record<string, unknown> | null;
                const studentName = typeof profile?.name === "string" && profile.name
                  ? profile.name
                  : typeof profile?.full_name === "string" && profile.full_name
                  ? profile.full_name
                  : null;

                const raw = s.results as Record<string, unknown> | null;
                const opps = Array.isArray(raw?.opportunities)
                  ? (raw.opportunities as Array<Record<string, unknown>>)
                  : [];
                const topOpp = opps[0];
                const topTitle = typeof topOpp?.title === "string" ? topOpp.title : null;
                const topScore = typeof topOpp?.scoreBreakdown === "object" && topOpp.scoreBreakdown !== null
                  ? (topOpp.scoreBreakdown as Record<string, number>).total
                  : null;

                const urgentInSession = opps.filter((r) => {
                  const d = r.urgencyDays as number | null | undefined;
                  return d !== null && d !== undefined && d <= 3 && d >= 0;
                }).length;

                return (
                  <Link
                    key={s.id}
                    href={`/results/${s.session_id}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/50 px-4 py-3.5 transition-all hover:border-primary/30 hover:bg-primary/3"
                  >
                    {/* Left: index + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {studentName
                            ? `${studentName}'s Analysis`
                            : `Analysis #${index + 1}`}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {topTitle
                            ? `Top: ${topTitle}`
                            : `${s.total_opportunities} opportunit${s.total_opportunities === 1 ? "y" : "ies"} found`}
                        </p>
                      </div>
                    </div>

                    {/* Middle: stats */}
                    <div className="hidden items-center gap-4 sm:flex shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{s.total_opportunities}</p>
                        <p className="text-[10px] text-muted-foreground">found</p>
                      </div>
                      {topScore !== null && (
                        <div className="text-center">
                          <p className="text-sm font-bold text-primary">{topScore}/100</p>
                          <p className="text-[10px] text-muted-foreground">top score</p>
                        </div>
                      )}
                      {urgentInSession > 0 && (
                        <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                          {urgentInSession} urgent
                        </span>
                      )}
                    </div>

                    {/* Right: time + arrow */}
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      <span>{fmtRelative(s.created_at)}</span>
                      <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}