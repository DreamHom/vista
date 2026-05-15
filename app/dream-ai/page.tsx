import type { Metadata } from "next";
import { DreamAiPageShell } from "@/components/dream-ai/dream-ai-page-shell";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { getDreamAiInventory } from "@/lib/seed/public-data";

/**
 * Dream AI: conversational property search.
 *
 * Uses the public header/footer; the chat shell expands into the viewport
 * after the first message while keeping the navbar visible. Standalone
 * route outside the generic marketing layout.
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

export default async function DreamAiPage() {
  const listings = await getDreamAiInventory();

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden font-sans">
      <PublicHeader />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <DreamAiPageShell listings={listings} />
      </main>
      <div className="max-h-[min(40vh,320px)] shrink-0 overflow-y-auto border-t border-border">
        <PublicFooter />
      </div>
    </div>
  );
}
