"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Settings2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/use-auth";
import { fetchHavenListing, resolveListingViewerContext } from "@/lib/haven-listing";
import { saveListing, unsaveListing } from "@/lib/applicant-dashboard";
import { apiErrorMessage } from "@/lib/api-error-message";
import { cn } from "@/lib/utils";

interface ListingDetailViewerBarProps {
  listingId: string;
  propertyId: string;
  ownerId: string;
  agentId: string | null;
}

/**
 * Authenticated overlay for `/listings/[id]`.
 * Reuses Haven's single GET endpoint with JWT so owner/applicant fields appear
 * without a second fetch pattern.
 */
export function ListingDetailViewerBar({ listingId, propertyId, ownerId, agentId }: ListingDetailViewerBarProps) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const viewerQuery = useQuery({
    queryKey: ["listing-viewer", listingId, user?.id],
    queryFn: () => fetchHavenListing(listingId),
    enabled: hydrated && isAuthenticated,
    staleTime: 30_000,
  });

  const viewer = viewerQuery.data
    ? resolveListingViewerContext(viewerQuery.data, { userId: user?.id, role: user?.role })
    : null;

  const saveMutation = useMutation({
    mutationFn: async (saved: boolean) => {
      const id = Number(listingId);
      if (saved) {
        await unsaveListing(id);
      } else {
        await saveListing(id);
      }
    },
    onSuccess: async (_data, saved) => {
      toast.success(saved ? "Removed from saved listings." : "Listing saved.");
      await viewerQuery.refetch();
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ["applicant-saved-listings", user.id] });
      }
    },
    onError: (error) => toast.error(apiErrorMessage(error, "We couldn't update your saved listings.")),
  });

  if (!hydrated || !isAuthenticated || !user) {
    return null;
  }

  const isOwner =
    viewer?.isOwner ?? (user.role === "OWNER" && String(user.id) === ownerId);
  const isAssignedAgent =
    viewer?.isAssignedAgent ??
    (user.role === "AGENT" && agentId != null && String(user.id) === agentId);
  const isApplicant = user.role === "APPLICANT";
  const savedByMe = viewer?.savedByMe ?? false;
  const pendingOffers = viewer?.pendingOfferCount;

  if (!isOwner && !isAssignedAgent && !isApplicant) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between",
      )}
      aria-live="polite"
    >
      <div className="min-w-0 space-y-1">
        {isOwner ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Your listing</p>
            <p className="text-sm text-foreground">
              You are viewing the public page. Manage pricing, availability, and agents in your workspace.
              {typeof pendingOffers === "number" && pendingOffers > 0
                ? ` ${pendingOffers} pending offer${pendingOffers === 1 ? "" : "s"}.`
                : ""}
            </p>
          </>
        ) : isAssignedAgent ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Agent assignment</p>
            <p className="text-sm text-muted-foreground">
              Management tools unlock after you accept the owner&apos;s invite. If access was revoked, actions on this
              listing will fail until a new assignment is accepted.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Signed in</p>
            <p className="text-sm text-muted-foreground">Save this listing to your shortlist or book a visit below.</p>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <Link
            href={`/owner/properties/${propertyId}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "inline-flex items-center gap-2")}
          >
            <Settings2 className="h-4 w-4" aria-hidden />
            Manage property &amp; listing
          </Link>
        ) : null}

        {isAssignedAgent ? (
          <Link
            href={`/agent/listings/${listingId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex items-center gap-2")}
          >
            Open in agent workspace
          </Link>
        ) : null}

        {isApplicant ? (
          <Button
            type="button"
            variant={savedByMe ? "secondary" : "outline"}
            size="sm"
            className="inline-flex items-center gap-2"
            disabled={saveMutation.isPending || viewerQuery.isFetching}
            onClick={() => saveMutation.mutate(savedByMe)}
          >
            <Heart className={cn("h-4 w-4", savedByMe && "fill-current text-primary")} aria-hidden />
            {saveMutation.isPending ? "Updating..." : savedByMe ? "Saved" : "Save listing"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
