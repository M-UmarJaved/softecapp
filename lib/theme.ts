export const APP_THEMES = [
  "theme-health",
  "theme-fintech",
  "theme-agri",
] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const THEME_STORAGE_KEY = "softec-theme";
export const DEFAULT_THEME: AppTheme = "theme-health";

export const THEME_LABELS: Record<AppTheme, string> = {
  "theme-health": "Health",
  "theme-fintech": "Fintech",
  "theme-agri": "Agri",
};

export function isAppTheme(value: string): value is AppTheme {
  return APP_THEMES.includes(value as AppTheme);
}

export function normalizeTheme(value: string | null | undefined): AppTheme {
  if (!value) {
    return DEFAULT_THEME;
  }

  return isAppTheme(value) ? value : DEFAULT_THEME;
}