import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="surface-glass flex h-14 items-center justify-between rounded-full px-3 sm:px-4">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full px-2 py-1"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <ShieldCheckIcon className="size-4" />
            </span>
            <span className="font-heading text-sm tracking-[0.14em] text-foreground sm:text-base">
              FORTRESS AI
            </span>
          </Link>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full border-border/80 bg-background/70 hover:bg-background",
            )}
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}