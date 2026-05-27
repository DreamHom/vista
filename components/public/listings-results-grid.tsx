"use client";

import { ListingDiscoveryCard } from "./widgets/listing-discovery-card";
import { CompareSelectionBar } from "@/components/dream-ai/compare-selection-bar";
import { CompareSelectionProvider } from "@/components/dream-ai/compare-selection-store";
import type { PublicListing } from "@/lib/seed/public-data";

export function ListingsResultsGrid({ listings }: { listings: PublicListing[] }) {
  return (
    <CompareSelectionProvider>
      <div className="grid grid-cols-1 gap-5 pb-24 xl:grid-cols-2">
        {listings.map((listing) => (
          <ListingDiscoveryCard key={listing.id} listing={listing} compareMode />
        ))}
      </div>
      <CompareSelectionBar />
    </CompareSelectionProvider>
  );
}
