import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Softec AI Starter",
    template: "%s | Softec AI Starter",
  },
  description:
    "Hackathon-ready AI starter with Supabase auth, dashboard widgets, and Grok-ready API wiring.",
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
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
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
