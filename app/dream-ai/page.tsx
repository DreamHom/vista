import type { Metadata } from "next";
import { DreamAiPageShell } from "@/components/dream-ai/dream-ai-page-shell";
import { PublicHeader } from "@/components/layout/public-header";
import { getDreamAiInventory } from "@/lib/seed/public-data";

/**
 * Dream AI: conversational property search.
 *
 * Full-viewport shell (header + chat only — no marketing footer; the footer
 * broke flex height and clipped the thread). Chat expands after the first
 * message while the navbar stays visible.
 */

export const metadata: Metadata = {
  title: "Dream AI: Find your home in plain English",
  description:
    "Describe the home you want in your own words. DreamHomes' AI matches your brief against verified Lagos and Abuja listings.",
  alternates: { canonical: "/dream-ai" },
  openGraph: {
    title: "DreamHomes · Dream AI",
    description:
      "Describe the home you want in your own words. We match against verified Lagos and Abuja listings.",
    url: "/dream-ai",
    type: "website",
  },
};

export default async function DreamAiPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const listings = await getDreamAiInventory();
  const { prompt } = await searchParams;
  const initialPrompt = typeof prompt === "string" ? prompt : undefined;

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden font-sans">
      <PublicHeader />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <DreamAiPageShell
          listings={listings}
          initialPrompt={initialPrompt}
        />
      </main>
    </div>
  );
}
