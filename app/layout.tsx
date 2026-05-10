import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

/**
 * SF Pro — DreamHomes brand sans, served from subset variable woff2 files.
 *
 * Source TTFs (44 MB combined) were subset with fontTools:
 *   • weight axis trimmed to 300-700 (Light → Bold)
 *   • glyphs pruned to Latin (incl. Vietnamese), Cyrillic, Arabic, Devanagari,
 *     plus standard punctuation, currency, math and symbol blocks
 *   • output as woff2 (≈30× smaller than the source TTF)
 *
 * Resulting bytes shipped: ~1.2 MB regular + 277 KB italic. Covers ≥80% of
 * world web traffic by language. Re-run `scripts/subset-sf-pro.sh` if the
 * source fonts change.
 *
 * Exposed as `--font-sans` so Tailwind's `font-sans` utility picks it up
 * automatically (config maps `font-sans` → `var(--font-sans)`).
 */
const sfPro = localFont({
  src: [
    { path: "./fonts/sf-pro/sf-pro.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/sf-pro/sf-pro-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});

/** Geist Mono kept for code, monospace data, and tabular numerics. */
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DreamHomes — Making dreams come true, one home at a time",
    template: "%s · DreamHomes",
  },
  description:
    "DreamHomes is a transparent, trust-first property platform connecting owners, agents, and applicants. Find, list, and finance your next home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sfPro.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
