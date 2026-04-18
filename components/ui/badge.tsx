import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary/15 text-primary",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-border/80 bg-background text-foreground",
        className,
      )}
      {...props}
    />
  );
}
