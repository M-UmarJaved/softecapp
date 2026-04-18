"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, AlertTriangleIcon } from "lucide-react";

import { ActionChecklist } from "@/components/ActionChecklist";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RankedOpportunity } from "@/lib/opportunity-inbox/types";
import { cn } from "@/lib/utils";

type Props = {
  opportunity: RankedOpportunity;
  defaultExpanded?: boolean;
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function OpportunityCard({ opportunity, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn("surface-glass border-border/70 transition-shadow", expanded && "shadow-lg")}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {opportunity.rank}
              </span>
              <CardTitle className="font-heading text-lg leading-tight">
                {opportunity.title}
              </CardTitle>
            </div>
            <CardDescription>
              {opportunity.organization} · {capitalize(opportunity.opportunityType)} · {capitalize(opportunity.location)}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge score={opportunity.scoreBreakdown.total} urgencyDays={opportunity.urgencyDays} />
            <Badge variant={opportunity.rank <= 3 ? "default" : "secondary"}>
              {opportunity.scoreBreakdown.total}/100
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.summary}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {opportunity.applicationLink ? (
            <a
              href={opportunity.applicationLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary transition-colors"
            >
              <ExternalLinkIcon className="size-3" />
              Apply
            </a>
          ) : null}

          {opportunity.urgencyDays !== null && opportunity.urgencyDays <= 7 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs text-destructive">
              <AlertTriangleIcon className="size-3" />
              {opportunity.urgencyDays <= 0 ? "Deadline passed" : `${opportunity.urgencyDays}d left`}
            </span>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto gap-1 text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <><ChevronUpIcon className="size-3.5" />Less</>
            ) : (
              <><ChevronDownIcon className="size-3.5" />Details</>
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="space-y-5 border-t border-border/60 pt-4">
          <ScoreBreakdown breakdown={opportunity.scoreBreakdown} />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Evidence
            </p>
            <ul className="space-y-1">
              {opportunity.reasons.slice(0, 6).map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Action Checklist
            </p>
            <ActionChecklist items={opportunity.actionChecklist} />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
