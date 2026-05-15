import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { getPublicSiteUrl } from "@/lib/site-url";

/** Canonical site URL for metadataBase, OG, and JSON-LD. Override with NEXT_PUBLIC_SITE_URL. */
const SITE_URL = getPublicSiteUrl();

/**
 * SF Pro: DreamHomes brand sans, served from subset variable woff2 files.
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DreamHomes. Making dreams come true, one home at a time",
    template: "%s · DreamHomes",
  },
  description:
    "DreamHomes is a transparent, trust-first property platform connecting owners, agents, and applicants. Find, list, and finance your next home across Lagos, Abuja, and beyond.",
  applicationName: "DreamHomes",
  authors: [{ name: "DreamHomes" }],
  creator: "DreamHomes",
  publisher: "DreamHomes",
  keywords: [
    "DreamHomes",
    "real estate Nigeria",
    "Lagos properties",
    "Abuja properties",
    "rent Lagos",
    "buy property Nigeria",
    "verified listings",
    "Moniepoint financing",
    "property platform",
    "estate agents Nigeria",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "en-NG": "/",
      "yo-NG": "/?lang=yo",
      "ig-NG": "/?lang=ig",
      "ha-NG": "/?lang=ha",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    alternateLocale: ["yo_NG", "ig_NG", "ha_NG"],
    url: SITE_URL,
    siteName: "DreamHomes",
    title: "DreamHomes. Making dreams come true, one home at a time",
    description:
      "A transparent, trust-first property platform connecting owners, agents, and applicants across Lagos and Abuja.",
    // `app/opengraph-image.tsx` auto-generates the image at /opengraph-image
    // Next.js picks it up via convention, no need to list it here.
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamHomes. Making dreams come true, one home at a time",
    description:
      "A transparent, trust-first property platform connecting owners, agents, and applicants.",
    creator: "@dreamhomes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "real estate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

/**
 * Viewport / theme color: separate export per Next 14+ conventions (was
 * inside `metadata.viewport` before). `themeColor` powers the mobile
 * browser chrome tint; the white/black pair mirrors our light/dark tokens.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

/**
 * Structured data: Organization + WebSite schemas, inlined as JSON-LD.
 * Search engines pick this up to surface our brand, logo, and a sitelinks
 * search box in results. Keep this minimal and accurate.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DreamHomes",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: [
        // social handles: placeholders until they exist
        "https://twitter.com/dreamhomes",
        "https://instagram.com/dreamhomes",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "DreamHomes",
      description:
        "A transparent, trust-first property platform connecting owners, agents, and applicants.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["en-NG", "yo-NG", "ig-NG", "ha-NG"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" className={`${sfPro.variable} font-sans`}>
      <head>
        {/* JSON-LD structured data: surfaces the brand to search engines.
            Stringified once at build, no runtime cost. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* `suppressHydrationWarning` on body: browser extensions (Grammarly,
          ColorZilla, LastPass, ...) inject attributes like `cz-shortcut-listen`
          or `data-gr-ext-installed` onto <body> after first paint. Without
          this flag React flags a hydration mismatch on every page load for
          any user with those extensions — noise, not a real bug. */}
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
