import type { Metadata } from "next";
import { ListingsExplorer } from "@/components/public/listings-explorer";
import { normalizeListingSearchParams } from "@/lib/query-string";

export const metadata: Metadata = {
  title: "Browse Listings",
  description:
    "Search verified homes, serviced apartments, villas, and commercial spaces across Lagos and Abuja.",
  alternates: { canonical: "/listings" },
  openGraph: {
    title: "Browse listings · DreamHomes",
    description:
      "Search verified homes, serviced apartments, villas, and commercial spaces across Lagos and Abuja.",
    url: "/listings",
  },
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  return <ListingsExplorer mode="browse" searchParams={normalizeListingSearchParams(raw)} />;
}
