import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      data-slot="progress"
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
