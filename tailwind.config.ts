import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono-custom)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        obsidian: "#080C14",
        surface: {
          1: "#0D1117",
          2: "#111827",
          3: "#1C2534",
          4: "#243044",
        },
        brand: {
          accent:  "#38BDF8",
          urgent:  "#F87171",
          high:    "#FB923C",
          medium:  "#FBBF24",
          success: "#34D399",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input:  "hsl(var(--input) / <alpha-value>)",
        ring:   "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT:    "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT:    "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
      },
      boxShadow: {
        "glow-accent": "0 0 0 1px rgba(56,189,248,0.25), 0 8px 32px rgba(56,189,248,0.15)",
        "glow-urgent": "0 0 0 1px rgba(248,113,113,0.30), 0 4px 16px rgba(248,113,113,0.15)",
        "card":        "0 4px 16px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)",
        "card-hover":  "0 8px 32px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)",
        "inner-glow":  "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
        sm:  "calc(var(--radius) - 4px)",
        md:  "calc(var(--radius) - 2px)",
        lg:  "var(--radius)",
        xl:  "calc(var(--radius) + 4px)",
      },
      animation: {
        "fade-in-up":   "fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":      "fadeIn 0.25s ease-out both",
        "scale-in":     "scaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both",
        "pulse-urgent": "pulse-urgent 2s ease-in-out infinite",
        "shimmer":      "shimmer 1.5s linear infinite",
        "float":        "float 3s ease-in-out infinite",
        "spin-slow":    "spin-slow 3s linear infinite",
        "slide-right":  "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) both",
        "ticker":       "ticker 20s linear infinite",
      },
      backdropBlur: { xs: "4px" },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      backgroundImage: {
        "landing-gradient":
          "radial-gradient(130% 120% at 0% 0%, hsl(var(--primary) / 0.3) 0%, transparent 45%), radial-gradient(120% 100% at 100% 0%, hsl(var(--accent) / 0.24) 0%, transparent 44%), linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.58) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
