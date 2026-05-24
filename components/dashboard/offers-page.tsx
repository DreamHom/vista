/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, CheckCircle2 } from "lucide-react";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { OfferTurnBanner } from "@/components/offers/offer-turn-banner";
import {
  listOffers,
  respondToOffer,
  type EnrichedOffer,
} from "@/lib/applicant-dashboard";
import { useAuth } from "@/lib/use-auth";
import { toast } from "@/components/ui/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import {
  applicantCanRespondToCounter,
  applicantOfferWaitingHint,
  offerNegotiationErrorMessage,
} from "@/lib/offer-lifecycle";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import { formatDateTime, offerStatusLabel, offerStatusVariant } from "@/components/dashboard/utils";

type OfferCardView = {
  root: EnrichedOffer;
  counterOffer: EnrichedOffer | null;
  displayStatus: "COUNTER_RECEIVED" | "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN" | "COUNTERED";
  canRespondToCounter: boolean;
  waitingHint: string | null;
};

function buildOfferViews(items: EnrichedOffer[], userId: number): OfferCardView[] {
  const childrenByParent = new Map<number, EnrichedOffer[]>();

  for (const item of items) {
    if (item.offer.parentOfferId != null) {
      const children = childrenByParent.get(item.offer.parentOfferId) ?? [];
      children.push(item);
      childrenByParent.set(item.offer.parentOfferId, children);
    }
  }

  return items
    .filter((item) => item.offer.proposedByUserId === userId)
    .map((root) => {
      const childOffers = (childrenByParent.get(root.offer.id) ?? []).sort(
        (left, right) => new Date(right.offer.createdAt).getTime() - new Date(left.offer.createdAt).getTime(),
      );
      const latestCounter = childOffers.find((item) => item.offer.proposedByUserId !== userId) ?? null;
      const latestByViewer = childOffers.find((item) => item.offer.proposedByUserId === userId) ?? null;

      const canRespond =
        latestCounter != null && applicantCanRespondToCounter(latestCounter.offer, userId);

      if (canRespond) {
        return {
          root,
          counterOffer: latestCounter,
          displayStatus: "COUNTER_RECEIVED" as const,
          canRespondToCounter: true,
          waitingHint: null,
        };
      }

      const waitingHint = applicantOfferWaitingHint(
        root.offer.status,
        false,
        latestByViewer != null && latestByViewer.offer.status === "PENDING",
      );

      if (latestCounter?.offer.status) {
        return {
          root,
          counterOffer: latestCounter,
          displayStatus: latestCounter.offer.status,
          canRespondToCounter: false,
          waitingHint,
        };
      }

      return {
        root,
        counterOffer: null,
        displayStatus: root.offer.status,
        canRespondToCounter: false,
        waitingHint,
      };
    })
    .sort((left, right) => new Date(right.root.offer.updatedAt).getTime() - new Date(left.root.offer.updatedAt).getTime());
}

function OfferCard({
  item,
  onAcceptCounter,
  onRejectCounter,
  actionBusy,
}: {
  item: OfferCardView;
  onAcceptCounter: () => void;
  onRejectCounter: () => void;
  actionBusy: boolean;
}) {
  const listing = item.root.listing;
  const fallback = fallbackListingPhoto(
    `${listing?.id ?? item.root.offer.listingId}-${listing?.title ?? "offer-listing"}`,
    { w: 480, ratio: "4:3" },
  );

  return (
    <div className="border border-border bg-card px-5 py-5 shadow-none">
      <div className="grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <div className="overflow-hidden border border-border bg-muted">
          <img
            src={listing?.photos[0]?.url ?? fallback.url}
            alt={listing?.photos[0]?.alt ?? fallback.alt ?? listing?.title ?? `Listing #${item.root.offer.listingId}`}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {listing?.title ?? `Listing #${item.root.offer.listingId}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {listing?.location ?? "Listing details are loading from Haven"}
              </p>
            </div>
            <StatusBadge
              label={offerStatusLabel(item.displayStatus)}
              variant={offerStatusVariant(item.displayStatus)}
            />
          </div>

          {item.canRespondToCounter ? (
            <OfferTurnBanner variant="your_turn">Your turn: accept or reject the owner&apos;s counter.</OfferTurnBanner>
          ) : item.waitingHint ? (
            <OfferTurnBanner>{item.waitingHint}</OfferTurnBanner>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="border border-border px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Your amount</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatNaira(item.root.offer.amount)}</p>
            </div>
            <div className="border border-border px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Intent</p>
              <p className="mt-2 font-medium text-foreground">
                {item.root.offer.intent === "BUY" ? "Buy" : item.root.offer.intent === "RENT" ? "Rent" : "Rent to buy"}
              </p>
            </div>
            <div className="border border-border px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Submitted</p>
              <p className="mt-2 font-medium text-foreground">{formatDateTime(item.root.offer.createdAt)}</p>
            </div>
          </div>

          {item.counterOffer ? (
            <div className="border border-border bg-secondary/40 px-4 py-4">
              <div className="flex items-start gap-3">
                <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Counter from the owner</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatNaira(item.counterOffer.offer.amount)}
                  </p>
                  {item.counterOffer.offer.message ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.counterOffer.offer.message}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : item.root.offer.message ? (
            <div className="border border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">
              {item.root.offer.message}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={listing ? `/listings/${listing.id}` : "/listings"}
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              View listing
            </Link>

            {item.canRespondToCounter && item.counterOffer ? (
              <>
                <Button onClick={onAcceptCounter} disabled={actionBusy}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Accept counter
                </Button>
                <InspectionMoreMenu
                  disabled={actionBusy}
                  menuLabel="Rejecting ends this negotiation on your counter."
                  triggerLabel="More counter actions"
                  items={[
                    {
                      id: "reject-counter",
                      label: "Reject counter",
                      description: "The owner can send another counter or close the thread.",
                      destructive: true,
                      onSelect: onRejectCounter,
                    },
                  ]}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplicantOffersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const offersQuery = useQuery({
    queryKey: ["applicant-offers", user?.id],
    queryFn: () => listOffers(80),
    enabled: Boolean(user?.id),
  });

  const respondMutation = useMutation({
    mutationFn: ({ offerId, status }: { offerId: number; status: "ACCEPTED" | "DECLINED" }) =>
      respondToOffer(offerId, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === "ACCEPTED" ? "Counter accepted." : "Counter rejected.");
      void queryClient.invalidateQueries({ queryKey: ["applicant-offers", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", user?.id] });
    },
    onError: (error) => {
      toast.error(offerNegotiationErrorMessage(error));
    },
  });

  const offerViews = useMemo(
    () => buildOfferViews(offersQuery.data?.items ?? [], user?.id ?? 0),
    [offersQuery.data?.items, user?.id],
  );

  if (offersQuery.isLoading) {
    return <LoadingPanel label="Loading your offers..." />;
  }

  if (offersQuery.isError) {
    return (
      <ErrorPanel
        body={offersQuery.error instanceof Error ? offersQuery.error.message : "We couldn't load your offers."}
        onRetry={() => void offersQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Offers"
        title="My offers"
        description="Negotiations alternate by design: you can only respond to an offer the other party proposed, not your own."
      />

      {offerViews.length === 0 ? (
        <EmptyPanel
          title="You haven't made any offers yet"
          body="When you're ready to make a move on a listing, your submitted offers and counter history will live here."
          ctaLabel="Browse listings"
          ctaHref="/listings"
        />
      ) : (
        <div className="space-y-4">
          {offerViews.map((item) => (
            <OfferCard
              key={item.root.offer.id}
              item={item}
              onAcceptCounter={() =>
                item.counterOffer
                  ? respondMutation.mutate({ offerId: item.counterOffer.offer.id, status: "ACCEPTED" })
                  : undefined
              }
              onRejectCounter={() =>
                item.counterOffer
                  ? respondMutation.mutate({ offerId: item.counterOffer.offer.id, status: "DECLINED" })
                  : undefined
              }
              actionBusy={respondMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
