import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Opportunity Inbox Copilot",
    template: "%s | Opportunity Inbox Copilot",
  },
  description:
    "AI-powered email ranking for Pakistani students — find scholarships, internships, and competitions before deadlines pass.",
};

const themeInitScript = `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const themes = ${JSON.stringify(APP_THEMES)};
  const fallback = "${DEFAULT_THEME}";

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const initialTheme = themes.includes(storedTheme) ? storedTheme : fallback;
    document.body.classList.remove(...themes);
    document.body.classList.add(initialTheme);
    document.body.dataset.theme = initialTheme;
  } catch {
    document.body.classList.remove(...themes);
    document.body.classList.add(fallback);
    document.body.dataset.theme = fallback;
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
