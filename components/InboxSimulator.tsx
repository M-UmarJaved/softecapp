"use client";

import { MailIcon, ClockIcon } from "lucide-react";

import type { RawOpportunityEmail } from "@/lib/opportunity-inbox/types";
import { cn } from "@/lib/utils";

type Props = {
  emails: RawOpportunityEmail[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export function InboxSimulator({ emails, selectedId, onSelect }: Props) {
  if (emails.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-background/50 p-6 text-center text-sm text-muted-foreground">
        No emails loaded yet. Paste or upload emails to see them here.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card/70">
      {emails.map((email, index) => {
        const isSelected = email.id === selectedId;
        const preview = email.body.slice(0, 100).trim();

        return (
          <button
            key={email.id}
            type="button"
            onClick={() => onSelect?.(email.id)}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40",
              isSelected && "bg-primary/8 border-l-2 border-l-primary",
            )}
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MailIcon className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {email.subject || `Email ${index + 1}`}
                </p>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <ClockIcon className="size-3" />
                  {email.receivedAt
                    ? new Date(email.receivedAt).toLocaleDateString("en-PK", { month: "short", day: "numeric" })
                    : "—"}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{email.sender}</p>
              {preview ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground/70">{preview}</p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
