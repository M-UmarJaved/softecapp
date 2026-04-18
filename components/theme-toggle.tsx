"use client";

import { PaletteIcon } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { THEME_LABELS } from "@/lib/theme";

const SHOW_THEME_TOGGLE =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  if (!SHOW_THEME_TOGGLE) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60]">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="pointer-events-auto gap-2 rounded-full border border-border/70 bg-card/90 shadow-lg backdrop-blur"
        onClick={cycleTheme}
      >
        <PaletteIcon className="size-4" />
        Theme: {THEME_LABELS[theme]}
      </Button>
    </div>
  );
}