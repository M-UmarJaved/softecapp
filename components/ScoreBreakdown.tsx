import { Progress } from "@/components/ui/progress";
import type { ScoreBreakdown as ScoreBreakdownType } from "@/lib/opportunity-inbox/types";

type Props = {
  breakdown: ScoreBreakdownType;
};

const SEGMENTS = [
  { key: "profileFit"   as const, label: "Profile Fit",   max: 40 },
  { key: "urgency"      as const, label: "Urgency",        max: 30 },
  { key: "completeness" as const, label: "Completeness",   max: 20 },
];

export function ScoreBreakdown({ breakdown }: Props) {
  const prefMatch = Math.max(
    0,
    breakdown.total - breakdown.profileFit - breakdown.urgency - breakdown.completeness,
  );

  const allSegments = [
    ...SEGMENTS,
    { key: "pref" as const, label: "Preferences", max: 10 },
  ];

  const values = { ...breakdown, pref: prefMatch };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Total Score
        </span>
        <span className="font-heading text-2xl font-bold text-foreground">
          {breakdown.total}
          <span className="text-sm font-normal text-muted-foreground">/100</span>
        </span>
      </div>

      <div className="space-y-2">
        {allSegments.map(({ key, label, max }) => {
          const value = values[key] ?? 0;
          const pct = Math.round((value / max) * 100);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span className="tabular-nums">{value}/{max}</span>
              </div>
              {/* Gradient fill bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
                <div
                  className="score-bar-fill animate-bar-fill h-full rounded-full"
                  style={{ "--bar-width": `${pct}%` } as React.CSSProperties}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
