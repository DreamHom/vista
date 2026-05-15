"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { fetchDreamAiListingCard } from "@/lib/dream-ai/fetch-listing-card";
import type { PublicListing } from "@/lib/seed/public-data";

export function useCompareListings(catalog: PublicListing[], ids: number[]) {
  const catalogById = useMemo(() => {
    const map = new Map<number, PublicListing>();
    for (const listing of catalog) {
      map.set(Number(listing.id), listing);
    }
    return map;
  }, [catalog]);

  const missingIds = useMemo(
    () => ids.filter((id) => !catalogById.has(id)),
    [ids, catalogById],
  );

  const queries = useQueries({
    queries: missingIds.map((id) => ({
      queryKey: ["dream-ai-listing-card", id],
      queryFn: () => fetchDreamAiListingCard(id),
      staleTime: 60_000,
    })),
  });

  const fetchedById = useMemo(() => {
    const map = new Map<number, PublicListing>();
    missingIds.forEach((id, index) => {
      const listing = queries[index]?.data;
      if (listing) map.set(id, listing);
    });
    return map;
  }, [missingIds, queries]);

  const resolved = useMemo(
    () =>
      ids.map((id) => catalogById.get(id) ?? fetchedById.get(id) ?? null),
    [ids, catalogById, fetchedById],
  );

  const loading = queries.some((query) => query.isLoading);

  return { resolved, loading };
}
