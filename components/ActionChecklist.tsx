import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { useState } from "react";

import type { ActionChecklistItem } from "@/lib/opportunity-inbox/types";
import { cn } from "@/lib/utils";

type Props = {
  items: ActionChecklistItem[];
};

export function ActionChecklist({ items }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const done = checked.has(item.id);

        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                done
                  ? "border-primary/20 bg-primary/5 opacity-60"
                  : "border-border/70 bg-background/60 hover:bg-secondary/40",
              )}
            >
              {done ? (
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <CircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", done && "line-through")}>{item.task}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.evidence}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
