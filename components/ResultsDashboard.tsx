"use client";

import { useState } from "react";
import { SparklesIcon, TrophyIcon, ClockIcon, BarChart3Icon } from "lucide-react";

import { OpportunityCard } from "@/components/OpportunityCard";
import { PriorityBadge, getPriorityLevel } from "@/components/PriorityBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalyzeOpportunitiesResponse } from "@/lib/opportunity-inbox/types";

type FilterLevel = "ALL" | "URGENT" | "HIGH" | "MEDIUM" | "LOW";

type Props = {
  data: AnalyzeOpportunitiesResponse;
};

export function ResultsDashboard({ data }: Props) {
  const [filter, setFilter] = useState<FilterLevel>("ALL");

  const { opportunities, summary, provider, generatedAt } = data;

  const filtered = filter === "ALL"
    ? opportunities
    : opportunities.filter(
        (o) => getPriorityLevel(o.scoreBreakdown.total, o.urgencyDays) === filter,
      );

  const urgentCount = opportunities.filter(
    (o) => getPriorityLevel(o.scoreBreakdown.total, o.urgencyDays) === "URGENT",
  ).length;

  const FILTERS: FilterLevel[] = ["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Opportunities",
            value: summary?.totalOpportunities ?? opportunities.length,
            icon: BarChart3Icon,
          },
          {
            label: "Top Score",
            value: `${summary?.topScore ?? 0}/100`,
            icon: TrophyIcon,
          },
          {
            label: "Avg Score",
            value: `${summary?.avgScore ?? 0}/100`,
            icon: SparklesIcon,
          },
          {
            label: "Urgent",
            value: urgentCount,
            icon: ClockIcon,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="surface-glass border-border/70">
            <CardHeader className="pb-1 pt-4">
              <CardDescription className="text-xs uppercase tracking-[0.12em]">{label}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between pb-4">
              <span className="font-heading text-2xl font-bold">{value}</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="size-4" />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Provider + timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Provider:{" "}
          <span className="font-medium text-foreground">
            {provider === "grok" ? "Grok AI" : "Heuristic fallback"}
          </span>
          {" · "}Generated {new Date(generatedAt).toLocaleString("en-PK")}
        </span>
        <span>{summary?.totalEmails ?? 0} emails processed</span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((level) => {
          const count =
            level === "ALL"
              ? opportunities.length
              : opportunities.filter(
                  (o) => getPriorityLevel(o.scoreBreakdown.total, o.urgencyDays) === level,
                ).length;

          return (
            <Button
              key={level}
              type="button"
              variant={filter === level ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(level)}
              className="gap-1.5"
            >
              {level}
              <span className="rounded-full bg-background/20 px-1.5 py-0.5 text-[10px] font-bold">
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="surface-glass border-border/70">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No opportunities match this filter.
            </CardContent>
          </Card>
        ) : (
          filtered.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              defaultExpanded={index === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
