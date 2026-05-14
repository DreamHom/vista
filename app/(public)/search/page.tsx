import type { Metadata } from "next";
import { ListingsExplorer } from "@/components/public/listings-explorer";
import type { ListingSearchInput } from "@/lib/seed/public-data";

export const metadata: Metadata = {
  title: "Search Results",
  description: "Refine your DreamHomes search and discover homes that fit your budget, area, and timeline.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchInput>;
}) {
  return <ListingsExplorer mode="search" searchParams={await searchParams} />;
}
