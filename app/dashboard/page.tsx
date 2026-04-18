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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

async function getDashboardStats() {
  try {
    const supabase = await createClient();

    const { data: sessions } = await supabase
      .from("analysis_sessions")
      .select("id, session_id, total_opportunities, student_profile, created_at, results")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!sessions || sessions.length === 0) {
      return { sessions: [], totalEmails: 0, totalOpportunities: 0, urgentCount: 0 };
    }

    const totalEmails = sessions.reduce((sum, s) => {
      const profile = s.student_profile as Record<string, unknown>;
      return sum + (typeof profile?.totalEmails === "number" ? profile.totalEmails : 0);
    }, 0);

    const totalOpportunities = sessions.reduce((sum, s) => sum + (s.total_opportunities ?? 0), 0);

    // Count urgent across all sessions
    let urgentCount = 0;
    for (const session of sessions) {
      const results = session.results as Array<Record<string, unknown>> | null;
      if (Array.isArray(results)) {
        urgentCount += results.filter((r) => {
          const breakdown = r.scoreBreakdown as Record<string, number> | undefined;
          const urgencyDays = r.urgencyDays as number | null;
          return urgencyDays !== null && urgencyDays <= 3 && urgencyDays >= 0;
        }).length;
      }
    }

    return { sessions, totalEmails, totalOpportunities, urgentCount };
  } catch {
    return { sessions: [], totalEmails: 0, totalOpportunities: 0, urgentCount: 0 };
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
  const { sessions, totalEmails, totalOpportunities, urgentCount } = await getDashboardStats();

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
      <Card className="surface-glass border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Command Center</CardTitle>
          <CardDescription>
            Analyze your opportunity emails, rank them by fit and urgency, and get a step-by-step action plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/analyze"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <InboxIcon className="size-4" />
            Analyze New Emails
            <ArrowRightIcon className="size-4" />
          </Link>
        </CardContent>
      </Card>

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

      <Card className="surface-glass border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Recent Analyses</CardTitle>
          <CardDescription>
            Your past sessions — click a session to view results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No analyses yet.{" "}
              <Link href="/analyze" className="text-primary underline underline-offset-2">
                Run your first analysis →
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Opportunities</TableHead>
                  <TableHead>Run</TableHead>
                  <TableHead>Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.session_id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="font-medium">{s.total_opportunities}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtRelative(s.created_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/results/${s.session_id}`}
                        className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        View →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
