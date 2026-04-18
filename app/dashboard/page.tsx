"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  Clock3Icon,
  ListChecksIcon,
  MailOpenIcon,
  UsersIcon,
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
import { cn } from "@/lib/utils";

type StatCard = {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
};

const statCards: StatCard[] = [
  {
    title: "Emails Processed",
    value: "124",
    detail: "Last 7 days",
    icon: MailOpenIcon,
  },
  {
    title: "Deadlines This Week",
    value: "17",
    detail: "Need immediate follow-up",
    icon: Clock3Icon,
  },
  {
    title: "Student Profiles",
    value: "42",
    detail: "With structured preferences",
    icon: UsersIcon,
  },
];

const recentActivity = [
  {
    time: "3m ago",
    action: "Batch analysis completed",
    subject: "8 inbox emails parsed",
    status: "Ranked",
  },
  {
    time: "11m ago",
    action: "Urgency alert generated",
    subject: "Scholarship deadline in 2 days",
    status: "High Priority",
  },
  {
    time: "27m ago",
    action: "Checklist drafted",
    subject: "3 documents still missing",
    status: "Action Needed",
  },
  {
    time: "54m ago",
    action: "Profile updated",
    subject: "Skills and location preferences synced",
    status: "Updated",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="surface-glass border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Command Center</CardTitle>
          <CardDescription>
            Start with Inbox Copilot to parse email batches, rank top opportunities,
            and generate evidence-backed action checklists.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/opportunities"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            Open Inbox Copilot
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/dashboard/analytics"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View Insights
          </Link>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <CardTitle className="font-heading text-xl">Recent Workflow Events</CardTitle>
          <CardDescription>
            Live-friendly timeline for your judge walkthrough.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((row) => (
                <TableRow key={`${row.time}-${row.action}`}>
                  <TableCell>{row.time}</TableCell>
                  <TableCell className="font-medium">{row.action}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-secondary/70 px-2.5 py-1 text-xs text-secondary-foreground">
                      <ListChecksIcon className="size-3" />
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}