"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartOff } from "lucide-react";
import { ListingDiscoveryCard } from "@/components/public/public-components";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  SectionCard,
} from "@/components/dashboard/applicant-ui";
import { listSavedListings, unsaveListing } from "@/lib/applicant-dashboard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { toast } from "@/components/ui/toast";

type SavedSort = "recent" | "price" | "location";

export function ApplicantSavedListingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<SavedSort>("recent");

  const savedQuery = useQuery({
    queryKey: ["applicant-saved-listings", user?.id],
    queryFn: () => listSavedListings(60),
    enabled: Boolean(user?.id),
  });

  const unsaveMutation = useMutation({
    mutationFn: (listingId: number) => unsaveListing(listingId),
    onSuccess: () => {
      toast.success("Listing removed from your saved homes.");
      void queryClient.invalidateQueries({ queryKey: ["applicant-saved-listings", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", user?.id] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't unsave that listing.");
    },
  });

  const sortedItems = useMemo(() => {
    const items = [...(savedQuery.data?.items ?? [])].filter((item) => item.listing);

    switch (sort) {
      case "price":
        return items.sort((left, right) => (left.listing?.priceNgn ?? 0) - (right.listing?.priceNgn ?? 0));
      case "location":
        return items.sort((left, right) =>
          (left.listing?.location ?? "").localeCompare(right.listing?.location ?? "", "en"),
        );
      case "recent":
      default:
        return items.sort(
          (left, right) => new Date(right.save.savedAt).getTime() - new Date(left.save.savedAt).getTime(),
        );
    }
  }, [savedQuery.data?.items, sort]);

  if (savedQuery.isLoading) {
    return <LoadingPanel label="Loading your saved listings..." />;
  }

  if (savedQuery.isError) {
    return (
      <ErrorPanel
        body={savedQuery.error instanceof Error ? savedQuery.error.message : "We couldn't load your saved listings."}
        onRetry={() => void savedQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Saved listings"
        title="Your shortlist"
        description="Review the homes you’ve favourited, compare them again, and remove anything that no longer fits."
        actions={
          <label className="flex items-center gap-3 rounded-full border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
            Sort by
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SavedSort)}
              className="bg-transparent pr-8 text-sm font-medium text-foreground focus:outline-none"
            >
              <option value="recent">Recently saved</option>
              <option value="price">Price</option>
              <option value="location">Location</option>
            </select>
          </label>
        }
      />

      {sortedItems.length === 0 ? (
        <EmptyPanel
          title="You haven't saved any listings yet"
          body="Start building a shortlist by saving any listing you want to revisit, compare, or inspect later."
          ctaLabel="Browse Listings"
          ctaHref="/listings"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {sortedItems.map((item) =>
            item.listing ? (
              <div key={item.save.listingId} className="space-y-3">
                <ListingDiscoveryCard listing={item.listing} />
                <SectionCard title="Saved action" className="rounded-3xl">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Saved for easy comparison and inspection planning.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => unsaveMutation.mutate(item.save.listingId)}
                      disabled={unsaveMutation.isPending}
                    >
                      <HeartOff className="h-4 w-4" aria-hidden />
                      Unsave
                    </Button>
                  </div>
                </SectionCard>
              </div>
            ) : null,
          )}
        </div>
      )}

      <div className="rounded-3xl border border-border bg-white px-6 py-5 text-sm text-muted-foreground">
        Need a wider search again? <Link href="/compare" className="font-medium text-primary hover:text-primary/80">Compare saved homes</Link> or jump back into{" "}
        <Link href="/dream-ai" className="font-medium text-primary hover:text-primary/80">Dream AI</Link> for a refined shortlist.
      </div>
    </div>
  );
}
