import type { Config } from "tailwindcss";

/**
 * Tailwind theme for DreamHomes: vista.
 *
 * Tokens are exposed as HSL components in `globals.css` so the same utility
 * classes (`bg-primary`, `text-foreground`, …) work in both light and dark mode
 * without authoring two stylesheets. Toggle dark mode by adding the `dark`
 * class to `<html>` (handled in the theme provider, not by `prefers-color-scheme`,
 * so users can override).
 */
/** After subset SF Pro (`--font-sans`), prefer neutral humanist sans fallbacks. */
const SANS_FALLBACK: [string, ...string[]] = [
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Inter",
  "Roboto",
  "Helvetica Neue",
  "Helvetica",
  "Arial",
  "Noto Sans",
  "sans-serif",
];

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...SANS_FALLBACK],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      /** Small uppercase labels (section eyebrows): slightly tighter than body, never wide-tracked. */
      letterSpacing: {
        eyebrow: "-0.04em",
      },
      /**
       * Subtle looping motion for inline SVG / illustration frames.
       * Always pair with `motion-safe:` in components so `prefers-reduced-motion` disables animation.
       */
      keyframes: {
        "ambient-float": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
        },
        "ambient-float-delayed": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -6px, 0)" },
        },
        "ambient-breathe": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" },
        },
        "ambient-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "33%": { transform: "translate3d(3px, -4px, 0) rotate(0.4deg)" },
          "66%": { transform: "translate3d(-2px, 2px, 0) rotate(-0.35deg)" },
        },
        "ambient-dash": {
          to: { strokeDashoffset: "-48" },
        },
      },
      animation: {
        "ambient-float": "ambient-float 16s ease-in-out infinite",
        "ambient-float-delayed": "ambient-float-delayed 20s ease-in-out 1.5s infinite",
        "ambient-breathe": "ambient-breathe 5.5s ease-in-out infinite",
        "ambient-drift": "ambient-drift 22s ease-in-out infinite",
        "ambient-dash": "ambient-dash 14s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
