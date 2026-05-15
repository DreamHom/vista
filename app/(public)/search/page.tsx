import type { Metadata } from "next";
import { ListingsExplorer } from "@/components/public/listings-explorer";
import { normalizeListingSearchParams } from "@/lib/query-string";

export const metadata: Metadata = {
  title: "Search Results",
  description: "Refine your DreamHomes search and discover homes that fit your budget, area, and timeline.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search results · DreamHomes",
    description: "Refine your DreamHomes search and discover homes that fit your budget, area, and timeline.",
    url: "/search",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  return <ListingsExplorer mode="search" searchParams={normalizeListingSearchParams(raw)} />;
}
