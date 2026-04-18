"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  APP_THEMES,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type AppTheme,
  normalizeTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
  themes: readonly AppTheme[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeToBody(theme: AppTheme) {
  const body = document.body;
  body.classList.remove(...APP_THEMES);
  body.classList.add(theme);
  body.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_THEME;
    }

    try {
      return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    applyThemeToBody(theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write failures in restricted browser modes.
    }
  }, [theme]);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const index = APP_THEMES.indexOf(current);
      const nextIndex = (index + 1) % APP_THEMES.length;
      return APP_THEMES[nextIndex] ?? DEFAULT_THEME;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      cycleTheme,
      themes: APP_THEMES,
    }),
    [theme, setTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}