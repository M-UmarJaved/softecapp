"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Step definitions ─────────────────────────────────────────────────────────

export type ProcessingStep = {
  id: string;
  label: string;
  /** Minimum ms before this step can complete (simulated pacing) */
  minDuration: number;
};

export const ANALYSIS_STEPS: ProcessingStep[] = [
  { id: "read",     label: "Reading your emails…",                minDuration: 600  },
  { id: "classify", label: "Identifying real opportunities…",     minDuration: 1200 },
  { id: "extract",  label: "Extracting deadlines and requirements…", minDuration: 1800 },
  { id: "score",    label: "Scoring against your profile…",       minDuration: 1200 },
  { id: "rank",     label: "Building your priority list…",        minDuration: 800  },
];

type StepStatus = "waiting" | "active" | "done";

type StepState = {
  status: StepStatus;
  detail?: string;
};

export type ProcessingHints = {
  opportunitiesFound?: number;
  totalEmails?: number;
  extractProgress?: number; // 0–100
  topScore?: number;
};

type Props = {
  /** Whether the real API call has finished */
  apiDone: boolean;
  hints?: ProcessingHints;
  /** Called once all steps are done AND apiDone is true */
  onComplete: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ProcessingOverlay({ apiDone, hints, onComplete }: Props) {
  const [steps, setSteps] = useState<StepState[]>(
    ANALYSIS_STEPS.map((_, i) => ({ status: i === 0 ? "active" : "waiting" })),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const [progressBar, setProgressBar] = useState(0);
  const completedRef = useRef(false);
  const stepStartRef = useRef(Date.now());

  // Advance steps on a timer, but never outrun the real API
  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length) return;

    const step = ANALYSIS_STEPS[currentStep]!;
    const elapsed = Date.now() - stepStartRef.current;
    const remaining = Math.max(0, step.minDuration - elapsed);

    // Last step waits for API
    const isLastStep = currentStep === ANALYSIS_STEPS.length - 1;
    const canAdvance = !isLastStep || apiDone;

    const timer = setTimeout(() => {
      if (!canAdvance) return; // will re-run when apiDone flips

      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === currentStep) return { ...s, status: "done" };
          if (i === currentStep + 1) return { ...s, status: "active" };
          return s;
        }),
      );

      stepStartRef.current = Date.now();
      setCurrentStep((c) => c + 1);
    }, remaining);

    return () => clearTimeout(timer);
  }, [currentStep, apiDone]);

  // Re-check last step when apiDone flips
  useEffect(() => {
    if (!apiDone) return;
    if (currentStep === ANALYSIS_STEPS.length - 1) {
      const elapsed = Date.now() - stepStartRef.current;
      const step = ANALYSIS_STEPS[currentStep]!;
      const remaining = Math.max(0, step.minDuration - elapsed);

      const timer = setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) => (i === currentStep ? { ...s, status: "done" } : s)),
        );
        setCurrentStep(ANALYSIS_STEPS.length);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [apiDone, currentStep]);

  // Fire onComplete once all steps done
  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length && !completedRef.current) {
      completedRef.current = true;
      // Small delay so user sees the final checkmark
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
  }, [currentStep, onComplete]);

  // Animate progress bar on step 3 (extract)
  useEffect(() => {
    if (steps[2]?.status !== "active") return;
    const target = hints?.extractProgress ?? 100;
    const interval = setInterval(() => {
      setProgressBar((p) => {
        const next = p + 4;
        if (next >= target) { clearInterval(interval); return target; }
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [steps, hints?.extractProgress]);

  // Animate score counter on step 4 (score)
  useEffect(() => {
    if (steps[3]?.status !== "active") return;
    const target = hints?.topScore ?? 85;
    const interval = setInterval(() => {
      setScoreCount((s) => {
        const next = s + 3;
        if (next >= target) { clearInterval(interval); return target; }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [steps, hints?.topScore]);

  // Build per-step detail strings
  const getDetail = (index: number, status: StepStatus): string | undefined => {
    if (status === "waiting") return undefined;

    switch (index) {
      case 1: {
        const found = hints?.opportunitiesFound;
        const total = hints?.totalEmails;
        if (found !== undefined && total !== undefined) {
          return `Found ${found} of ${total} emails are opportunities`;
        }
        return status === "done" ? "Classification complete" : "Scanning email content…";
      }
      case 2:
        return status === "done"
          ? "All fields extracted"
          : `Extracting… ${Math.min(progressBar, 100)}%`;
      case 3:
        return status === "done"
          ? `Top score: ${hints?.topScore ?? scoreCount}/100`
          : `Scoring… top score so far: ${scoreCount}`;
      case 4:
        return status === "done" ? "Priority list ready" : "Ranking by fit and urgency…";
      default:
        return undefined;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8 px-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Loader2Icon className="size-7 animate-spin" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Analyzing your inbox
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This takes about 10–20 seconds
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((step, index) => {
            const { status } = steps[index]!;
            const detail = getDetail(index, status);

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
                  status === "done"    && "border-primary/20 bg-primary/5",
                  status === "active"  && "border-primary/40 bg-primary/10 shadow-sm shadow-primary/10",
                  status === "waiting" && "border-border/40 bg-muted/30 opacity-40",
                )}
              >
                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {status === "done" ? (
                    <CheckCircle2Icon className="size-5 text-primary" />
                  ) : status === "active" ? (
                    <Loader2Icon className="size-5 animate-spin text-primary" />
                  ) : (
                    <div className="size-5 rounded-full border-2 border-border/60" />
                  )}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    status === "waiting" ? "text-muted-foreground" : "text-foreground",
                  )}>
                    {step.label}
                  </p>

                  {detail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
                  )}

                  {/* Progress bar for extract step */}
                  {index === 2 && status === "active" && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-100"
                        style={{ width: `${Math.min(progressBar, 100)}%` }}
                      />
                    </div>
                  )}

                  {/* Score counter for score step */}
                  {index === 3 && status === "active" && (
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-heading text-2xl font-bold tabular-nums text-primary">
                        {scoreCount}
                      </span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  )}

                  {/* Checkmarks for rank step */}
                  {index === 4 && status === "active" && (
                    <div className="mt-2 flex gap-1.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <CheckmarkDot key={i} delay={i * 180} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          Powered by Grok AI · Deterministic scoring engine
        </p>
      </div>
    </div>
  );
}

// ─── Animated checkmark dot ───────────────────────────────────────────────────

function CheckmarkDot({ delay }: { delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={cn(
      "flex size-5 items-center justify-center rounded-full border-2 transition-all duration-300",
      visible
        ? "border-primary bg-primary/20 text-primary"
        : "border-border/50 bg-transparent",
    )}>
      {visible && <CheckCircle2Icon className="size-3" />}
    </div>
  );
}
