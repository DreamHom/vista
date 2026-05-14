import type { Metadata } from "next";
import { ListingsExplorer } from "@/components/public/listings-explorer";
import type { ListingSearchInput } from "@/lib/seed/public-data";

export const metadata: Metadata = {
  title: "Browse Listings",
  description:
    "Search verified homes, serviced apartments, villas, and commercial spaces across Lagos and Abuja.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchInput>;
}) {
  return <ListingsExplorer mode="browse" searchParams={await searchParams} />;
}
