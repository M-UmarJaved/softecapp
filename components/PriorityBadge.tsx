import { cn } from "@/lib/utils";

export type PriorityLevel = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "SKIP";

export function getPriorityLevel(score: number, urgencyDays: number | null): PriorityLevel {
  if (urgencyDays !== null && urgencyDays <= 3 && urgencyDays >= 0) return "URGENT";
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  if (score >= 20) return "LOW";
  return "SKIP";
}

// Exact spec colors via CSS classes defined in globals.css
const STYLES: Record<PriorityLevel, string> = {
  URGENT: "badge-urgent animate-urgent-pulse",
  HIGH:   "badge-high",
  MEDIUM: "badge-medium",
  LOW:    "badge-low",
  SKIP:   "badge-skip",
};

type Props = {
  score: number;
  urgencyDays: number | null;
  className?: string;
};

export function PriorityBadge({ score, urgencyDays, className }: Props) {
  const level = getPriorityLevel(score, urgencyDays);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]",
        STYLES[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
