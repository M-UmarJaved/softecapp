"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardCopyIcon,
  ClockIcon,
  DownloadIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  ShareIcon,
  XCircleIcon,
} from "lucide-react";

import { getPriorityLevel, PriorityBadge } from "@/components/PriorityBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApplied } from "@/lib/use-applied";
import { downloadICS } from "@/lib/ics";
import type { AnalyzeOpportunitiesResponse, RankedOpportunity } from "@/lib/opportunity-inbox/types";
import type { SessionData } from "@/lib/session-store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((d.getTime() - Date.now()) / 86_400_000);
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="grid grid-cols-[120px_1fr_48px] items-center gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-border/50">
        <div
          className="score-bar-fill animate-bar-fill h-full rounded-full"
          style={{ "--bar-width": `${pct}%` } as React.CSSProperties}
        />
      </div>
      <span className="text-right tabular-nums text-foreground">
        {value}/{max}
      </span>
    </div>
  );
}

// ─── Checklist item ───────────────────────────────────────────────────────────

function ChecklistItem({
  step,
  task,
  evidence,
}: {
  step: number;
  task: string;
  evidence?: string;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setChecked((v) => !v)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        checked
          ? "border-primary/20 bg-primary/5 opacity-60"
          : "border-border/60 bg-background/60 hover:bg-secondary/30",
      )}
    >
      <span className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border/70 text-muted-foreground",
      )}>
        {checked ? "✓" : step}
      </span>
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", checked && "line-through text-muted-foreground")}>
          {task}
        </p>
        {evidence && (
          <p className="mt-0.5 text-xs text-muted-foreground">{evidence}</p>
        )}
      </div>
    </button>
  );
}

// ─── Full opportunity card ────────────────────────────────────────────────────

function FullOpportunityCard({
  opp,
  isApplied,
  onMarkApplied,
  onUnmark,
}: {
  opp: RankedOpportunity & { aiExplanation?: string };
  isApplied: boolean;
  onMarkApplied: () => void;
  onUnmark: () => void;
}) {
  const days = opp.urgencyDays ?? daysLeft(opp.deadlineIso);
  const dateLabel = fmtDate(opp.deadlineIso);
  const isUrgentDeadline = days !== null && days <= 7 && days >= 0;
  const isPast = days !== null && days < 0;
  const priority = getPriorityLevel(opp.scoreBreakdown.total, opp.urgencyDays);

  const copyChecklist = () => {
    const text = opp.actionChecklist
      .map((item, i) => `${i + 1}. ${item.task}`)
      .join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div
      id={`opp-${opp.id}`}
      className="oic-card scroll-mt-20 overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-border/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-lg font-bold text-primary">
              #{opp.rank}
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold leading-tight text-foreground">
                {opp.title}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {opp.organization}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge score={opp.scoreBreakdown.total} urgencyDays={opp.urgencyDays} />
            <span className="rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {cap(opp.opportunityType)}
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {opp.scoreBreakdown.total}/100
            </span>
          </div>
        </div>

        {/* AI explanation */}
        {opp.aiExplanation && (
          <p className="mt-3 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm leading-relaxed text-foreground">
            {opp.aiExplanation}
          </p>
        )}
      </div>

      {/* Score breakdown */}
      <div className="border-b border-border/60 p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Score Breakdown
        </p>
        <div className="space-y-2">
          <ScoreBar label="Profile Fit"   value={opp.scoreBreakdown.profileFit}   max={40} />
          <ScoreBar label="Urgency"       value={opp.scoreBreakdown.urgency}       max={30} />
          <ScoreBar label="Completeness"  value={opp.scoreBreakdown.completeness}  max={20} />
          <ScoreBar label="Preferences"   value={Math.max(0, opp.scoreBreakdown.total - opp.scoreBreakdown.profileFit - opp.scoreBreakdown.urgency - opp.scoreBreakdown.completeness)} max={10} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
          <span className="text-sm font-semibold text-foreground">TOTAL SCORE</span>
          <span className="font-heading text-2xl font-bold text-primary">
            {opp.scoreBreakdown.total}
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="border-b border-border/60 p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Extracted Details
        </p>
        <dl className="grid gap-2 sm:grid-cols-2">
          {dateLabel && (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-base">📅</span>
              <div>
                <dt className="text-xs text-muted-foreground">Deadline</dt>
                <dd className={cn(
                  "text-sm font-medium",
                  isPast ? "text-muted-foreground line-through" :
                  isUrgentDeadline ? "text-destructive" : "text-foreground",
                )}>
                  {dateLabel}
                  {days !== null && !isPast && (
                    <span className={cn(
                      "ml-1.5 text-xs",
                      isUrgentDeadline ? "text-destructive" : "text-muted-foreground",
                    )}>
                      ({days === 0 ? "today!" : `${days}d left`})
                    </span>
                  )}
                  {isPast && <span className="ml-1.5 text-xs text-muted-foreground">(passed)</span>}
                </dd>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-base">🏢</span>
            <div>
              <dt className="text-xs text-muted-foreground">Organization</dt>
              <dd className="text-sm font-medium text-foreground">{opp.organization}</dd>
            </div>
          </div>

          {opp.eligibleMajors.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-base">🎓</span>
              <div>
                <dt className="text-xs text-muted-foreground">Eligibility</dt>
                <dd className="text-sm font-medium text-foreground">
                  {opp.eligibleMajors.join(", ")}
                  {opp.minCgpa !== null && ` · CGPA ≥ ${opp.minCgpa.toFixed(1)}`}
                </dd>
              </div>
            </div>
          )}

          {opp.requiredDocuments.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-base">📋</span>
              <div>
                <dt className="text-xs text-muted-foreground">Required Documents</dt>
                <dd className="text-sm font-medium text-foreground">
                  {opp.requiredDocuments.join(", ")}
                </dd>
              </div>
            </div>
          )}

          {opp.benefits.length > 0 && (
            <div className="flex items-start gap-2 sm:col-span-2">
              <span className="mt-0.5 text-base">💰</span>
              <div>
                <dt className="text-xs text-muted-foreground">Benefits</dt>
                <dd className="text-sm font-medium text-foreground">
                  {Array.isArray(opp.benefits) ? opp.benefits.join(", ") : String(opp.benefits)}
                </dd>
              </div>
            </div>
          )}
        </dl>

        {opp.applicationLink && (
          <a
            href={opp.applicationLink}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-3 gap-1.5",
            )}
          >
            <ExternalLinkIcon className="size-3.5" />
            Apply Now
          </a>
        )}
        {opp.deadlineIso && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 gap-1.5 text-xs text-muted-foreground"
            onClick={() => downloadICS({
              title: opp.title,
              deadline: opp.deadlineIso!,
              organization: opp.organization,
            })}
          >
            <CalendarIcon className="size-3.5" />
            Add to Calendar
          </Button>
        )}
      </div>

      {/* Matched / missing skills */}
      {(opp.requiredSkills.length > 0) && (
        <div className="border-b border-border/60 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Skills Match
          </p>
          <div className="flex flex-wrap gap-2">
            {opp.requiredSkills.map((skill) => {
              // We don't have matched/missing split here — show all as neutral
              return (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  <CheckCircle2Icon className="size-3" />
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence reasons */}
      {opp.reasons.length > 0 && (
        <div className="border-b border-border/60 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Why This Rank
          </p>
          <ul className="space-y-1.5">
            {opp.reasons.slice(0, 6).map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action checklist */}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Action Checklist
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyChecklist}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <ClipboardCopyIcon className="size-3.5" />
            Copy
          </Button>
        </div>

        <div className="space-y-2">
          {opp.actionChecklist.map((item, i) => (
            <ChecklistItem
              key={item.id}
              step={i + 1}
              task={item.task}
              evidence={item.evidence || undefined}
            />
          ))}
        </div>

        {/* Mark as applied */}
        <div className="mt-4">
          {isApplied ? (
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2Icon className="size-4" />
                Marked as Applied
              </span>
              <button
                type="button"
                onClick={onUnmark}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Undo
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={onMarkApplied}
            >
              <CheckCircle2Icon className="size-4" />
              Mark as Applied
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skipped emails section ───────────────────────────────────────────────────

type SkippedEmail = { id: string; subject: string; reason: string; confidence: number };

function SkippedSection({ skipped }: { skipped: SkippedEmail[] }) {
  const [open, setOpen] = useState(false);
  if (skipped.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30"
      >
        <div className="flex items-center gap-2">
          <XCircleIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {skipped.length} email{skipped.length !== 1 ? "s" : ""} filtered as spam / non-opportunity
          </span>
        </div>
        {open ? <ChevronUpIcon className="size-4 text-muted-foreground" /> : <ChevronDownIcon className="size-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="divide-y divide-border/50 border-t border-border/60">
          {skipped.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.subject || "No subject"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.reason}</p>
              </div>
              <span className="shrink-0 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                {Math.round(item.confidence * 100)}% spam
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Export helpers ───────────────────────────────────────────────────────────

function buildWhatsAppSummary(opps: RankedOpportunity[], sessionId: string): string {
  const top3 = opps.slice(0, 3);
  const lines = [
    `📬 *My Opportunity Inbox Copilot Summary*`,
    `Generated: ${new Date().toLocaleDateString("en-PK")}`,
    ``,
    `🔥 *TOP PRIORITIES:*`,
    ...top3.map((o, i) => {
      const deadline = o.deadlineIso ? fmtDate(o.deadlineIso) : "No deadline";
      const days = o.urgencyDays !== null ? ` (${o.urgencyDays}d left)` : "";
      return `${i + 1}. *${o.title}* (${o.organization})\n   📅 ${deadline}${days}\n   ⚡ ${getPriorityLevel(o.scoreBreakdown.total, o.urgencyDays)} · ${o.scoreBreakdown.total}/100`;
    }),
    ``,
    `✅ Total: ${opps.length} opportunities found`,
    `🚀 _Generated by Opportunity Inbox Copilot_`,
    `🔗 ${typeof window !== "undefined" ? window.location.href : ""}`,
  ];
  return lines.join("\n");
}

function printReport(opps: RankedOpportunity[], sessionId: string) {
  const rows = opps
    .map(
      (o) => `
      <tr>
        <td>#${o.rank}</td>
        <td><strong>${o.title}</strong><br/><small>${o.organization}</small></td>
        <td>${cap(o.opportunityType)}</td>
        <td>${o.scoreBreakdown.total}/100</td>
        <td>${fmtDate(o.deadlineIso) ?? "—"}</td>
        <td>${o.urgencyDays !== null ? `${o.urgencyDays}d` : "—"}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><title>Opportunity Report</title>
  <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}
  th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}
  h1{font-size:20px}p{color:#555}</style></head><body>
  <h1>Opportunity Inbox Report</h1>
  <p>Session: ${sessionId} · Generated: ${new Date().toLocaleString("en-PK")}</p>
  <table><thead><tr><th>#</th><th>Opportunity</th><th>Type</th><th>Score</th><th>Deadline</th><th>Days Left</th></tr></thead>
  <tbody>${rows}</tbody></table></body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.print();
}

// ─── Main view ────────────────────────────────────────────────────────────────

type Props = {
  data: SessionData;
  sessionId: string;
};

export function ResultsView({ data, sessionId }: Props) {
  const { opportunities, summary } = data;
  const { applied, markApplied, unmarkApplied } = useApplied();
  const [activeId, setActiveId] = useState<string | null>(opportunities[0]?.id ?? null);
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Live countdown to top opportunity deadline ──
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const topDeadline = opportunities[0]?.deadlineIso;
    if (!topDeadline) return;

    const update = () => {
      const diff = new Date(topDeadline).getTime() - Date.now();
      if (diff <= 0) { setCountdown("⏰ Deadline passed"); return; }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      setCountdown(`⏰ ${days}d ${hours}h left on top opportunity`);
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [opportunities]);

  const urgentCount = opportunities.filter(
    (o) => getPriorityLevel(o.scoreBreakdown.total, o.urgencyDays) === "URGENT",
  ).length;
  const highCount = opportunities.filter(
    (o) => getPriorityLevel(o.scoreBreakdown.total, o.urgencyDays) === "HIGH",
  ).length;
  const mediumCount = opportunities.filter(
    (o) => getPriorityLevel(o.scoreBreakdown.total, o.urgencyDays) === "MEDIUM",
  ).length;

  const scrollTo = useCallback((id: string) => {
    setActiveId(id);
    document.getElementById(`opp-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const copyWhatsApp = () => {
    const text = buildWhatsAppSummary(opportunities, sessionId);
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top summary bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Link
                href="/analyze"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-muted-foreground")}
              >
                <ArrowLeftIcon className="size-4" />
                New Analysis
              </Link>
              <div className="h-5 w-px bg-border/60" />
              <p className="font-heading text-sm font-semibold text-foreground">
                Found{" "}
                <span className="text-primary">{opportunities.length} opportunities</span>
                {" "}in{" "}
                <span className="text-primary">{summary?.totalEmails ?? "?"} emails</span>
                {" "}— here&apos;s what you need to do
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {urgentCount > 0 && (
                <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 font-semibold text-destructive">
                  {urgentCount} URGENT
                </span>
              )}
              {highCount > 0 && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                  {highCount} HIGH
                </span>
              )}
              {mediumCount > 0 && (
                <span className="rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 font-semibold text-secondary-foreground">
                  {mediumCount} MEDIUM
                </span>
              )}

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => printReport(opportunities, sessionId)}
                  className="gap-1.5"
                >
                  <DownloadIcon className="size-3.5" />
                  PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyWhatsApp}
                  className="gap-1.5"
                >
                  <MessageCircleIcon className="size-3.5" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">

          {/* ── Left sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-1 overflow-y-auto rounded-2xl border border-border/70 bg-card/60 p-2 backdrop-blur-sm" style={{ maxHeight: "calc(100vh - 7rem)" }}>
              <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Ranked Opportunities
              </p>
              {opportunities.map((opp) => {
                const days = opp.urgencyDays;
                const isActive = activeId === opp.id;
                const priority = getPriorityLevel(opp.scoreBreakdown.total, opp.urgencyDays);

                return (
                  <button
                    key={opp.id}
                    type="button"
                    onClick={() => scrollTo(opp.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <span className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}>
                      {opp.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{opp.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{opp.organization}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <PriorityBadge
                          score={opp.scoreBreakdown.total}
                          urgencyDays={opp.urgencyDays}
                          className="text-[9px] px-1.5 py-0"
                        />
                        {days !== null && days >= 0 && (
                          <span className={cn(
                            "flex items-center gap-0.5 text-[10px]",
                            days <= 7 ? "text-destructive" : "text-muted-foreground",
                          )}>
                            <ClockIcon className="size-2.5" />
                            {days}d
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <main ref={mainRef} className="min-w-0 flex-1 space-y-6">
          {/* Live countdown */}
            {countdown && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive animate-pulse">
                {countdown}
              </div>
            )}

            {opportunities.map((opp, index) => (
              <div
                key={opp.id}
                className={`animate-slide-up stagger-${Math.min(index, 7)}`}
              >
                <FullOpportunityCard
                  opp={opp as RankedOpportunity & { aiExplanation?: string }}
                  isApplied={applied.has(opp.id)}
                  onMarkApplied={() => markApplied(opp.id)}
                  onUnmark={() => unmarkApplied(opp.id)}
                />
              </div>
            ))}

            <SkippedSection skipped={data.skippedEmails ?? []} />

            {/* Session info */}
            <p className="pb-8 text-center text-xs text-muted-foreground">
              Session <span className="font-mono">{sessionId.slice(0, 8)}…</span>
              {" · "}Provider: {data.provider === "grok" ? "Grok AI" : "Heuristic fallback"}
              {" · "}Generated {new Date(data.generatedAt).toLocaleString("en-PK")}
              {" · "}Results expire in 30 min
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
