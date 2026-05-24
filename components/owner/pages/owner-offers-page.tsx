"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileUp,
  ImagePlus,
  MapPin,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  changeMyPassword,
  getNotificationHref,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  respondToOffer,
  updateMyProfileBasics,
} from "@/lib/applicant-dashboard";
import {
  counterOwnerOffer,
  createInspectionSlot,
  createOwnerListing,
  createOwnerProperty,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_OWNER_PROFILE_DRAFT,
  DEFAULT_PROPERTY_DRAFT,
  getOwnerDashboardOverview,
  getOwnerProfileData,
  getOwnerPropertyManagement,
  inviteAgentToListing,
  listOwnerAssignments,
  listOwnerComments,
  listOwnerInspectionItems,
  listOwnerLeads,
  listOwnerListings,
  listOwnerOffers,
  listOwnerProperties,
  readInspectionNotes,
  readOwnerNotificationPreferences,
  readOwnerProfileDraft,
  readOwnerPropertyDraft,
  removeListingComment,
  replyToListingComment,
  revokeAgentAssignment,
  saveInspectionNote,
  saveInspectionStatus,
  saveOwnerNotificationPreferences,
  saveOwnerProfileDraft,
  saveOwnerPropertyDraft,
  searchAssignableAgents,
  submitOwnerIdentityVerification,
  submitPropertyDocumentsVerification,
  toggleLeadShortlist,
  updateOwnerListing,
  uploadOwnerListingPhoto,
  type AgentListingResponse,
  type CommentResponse,
  type OwnerManagedProperty,
  type OwnerProfileDraft,
  type OwnerPropertyFormDraft,
} from "@/lib/owner-dashboard";
import { useAuth } from "@/lib/use-auth";
import { formatNaira } from "@/lib/format";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  SectionCard,
  SettingsToggle,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import {
  firstName,
  formatDate,
  formatDateTime,
  getGreeting,
  offerStatusLabel,
  offerStatusVariant,
} from "@/components/dashboard/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { OfferTurnBanner } from "@/components/offers/offer-turn-banner";
import {
  findAcceptedOfferOnListing,
  offersOnListing,
  offerNegotiationErrorMessage,
  ownerCanRespondToOffer,
  ownerOfferWaitingHint,
} from "@/lib/offer-lifecycle";
import { AcceptOfferDialog } from "@/components/owner/accept-offer-dialog";

import { groupOffersByThread } from "./owner-page-primitives";

export function OwnerOffersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [counterAmounts, setCounterAmounts] = useState<Record<number, string>>({});
  const [acceptTarget, setAcceptTarget] = useState<{
    offerId: number;
    amount: number;
    listingTitle: string;
    applicantLabel: string;
  } | null>(null);
  const offersQuery = useQuery({
    queryKey: ["owner-offers", user?.id],
    queryFn: () => listOwnerOffers(user!.id, 100),
    enabled: !!user?.id,
  });

  const respondMutation = useMutation({
    mutationFn: ({ offerId, status }: { offerId: number; status: "ACCEPTED" | "DECLINED" }) =>
      respondToOffer(offerId, status),
    onSuccess: async (_data, variables) => {
      setAcceptTarget(null);
      if (variables.status === "ACCEPTED") {
        toast.success(
          "Offer accepted. The listing is closed, and other pending offers on it were declined automatically.",
        );
      } else {
        toast.success("Offer declined.");
      }
      await queryClient.invalidateQueries({ queryKey: ["owner-offers", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-property"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard-overview"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-notifications"] });
    },
    onError: (error) => toast.error(offerNegotiationErrorMessage(error)),
  });

  const counterMutation = useMutation({
    mutationFn: ({ offerId, amount }: { offerId: number; amount: number }) => counterOwnerOffer(offerId, { amount }),
    onSuccess: async () => {
      toast.success("Counter sent. The applicant must respond before you can act on this thread again.");
      await queryClient.invalidateQueries({ queryKey: ["owner-offers", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["owner-notifications"] });
    },
    onError: (error) => toast.error(offerNegotiationErrorMessage(error)),
  });

  if (offersQuery.isLoading) return <LoadingPanel label="Loading offers..." />;
  if (offersQuery.error) {
    return <ErrorPanel body="We couldn't load owner offer chains from Haven." onRetry={() => offersQuery.refetch()} />;
  }

  const allOffers = offersQuery.data!;
  const groups = useMemo(() => groupOffersByThread(allOffers), [allOffers]);

  return (
    <div className="space-y-6">
      <AcceptOfferDialog
        open={acceptTarget != null}
        onOpenChange={(open) => {
          if (!open) setAcceptTarget(null);
        }}
        amount={acceptTarget?.amount ?? 0}
        listingTitle={acceptTarget?.listingTitle ?? "this listing"}
        applicantLabel={acceptTarget?.applicantLabel ?? "this applicant"}
        pending={respondMutation.isPending}
        onConfirm={() => {
          if (!acceptTarget) return;
          respondMutation.mutate({ offerId: acceptTarget.offerId, status: "ACCEPTED" });
        }}
      />
      <DashboardPageIntro
        eyebrow="Negotiations"
        title="Offers"
        description="Each thread is one applicant on one listing. You can only accept, reject, or counter an offer the applicant proposed, not your own. Accepting closes the listing and declines other pending offers on it."
      />

      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => {
            const current = group.current;
            if (!current) return null;
            const listingOffers = offersOnListing(allOffers, current.offer.listingId);
            const acceptedWinner = findAcceptedOfferOnListing(allOffers, current.offer.listingId);
            const actionable =
              user?.id != null && ownerCanRespondToOffer(current, user.id, listingOffers);
            const waitingHint =
              user?.id != null ? ownerOfferWaitingHint(current, user.id, listingOffers) : null;

            return (
              <Card key={group.id} className="border-border/70 shadow-none">
                <CardContent className="space-y-5 p-5">
                  {acceptedWinner ? (
                    <div className="border border-border bg-secondary/30 p-4 text-sm text-foreground">
                      <p className="font-semibold">Listing closed</p>
                      <p className="mt-1 text-muted-foreground">
                        Accepted offer from applicant #{acceptedWinner.offer.applicantId} at{" "}
                        {formatNaira(acceptedWinner.offer.amount)} on{" "}
                        {formatDateTime(acceptedWinner.offer.updatedAt)}. That row is the permanent record of who
                        rented or bought.
                      </p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">{current.listing?.title ?? `Listing #${current.offer.listingId}`}</p>
                        <StatusBadge label={offerStatusLabel(current.offer.status)} variant={offerStatusVariant(current.offer.status)} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {current.listing?.location ?? "Listing location"} · applicant #{current.offer.applicantId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Current amount</p>
                      <p className="text-lg font-semibold text-foreground">{formatNaira(current.offer.amount)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border border-border bg-secondary/30 p-4">
                    {group.chain.map((item) => (
                      <div key={item.offer.id} className="border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">
                            {item.offer.proposedByUserId === user?.id ? "You" : "Applicant"} proposed {formatNaira(item.offer.amount)}
                          </p>
                          <StatusBadge label={offerStatusLabel(item.offer.status)} variant={offerStatusVariant(item.offer.status)} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.offer.message || "No note attached to this step of the negotiation."}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.offer.createdAt)}</p>
                      </div>
                    ))}
                  </div>

                  {actionable ? (
                    <div className="space-y-4 border border-primary/20 bg-primary/5 p-4">
                      <OfferTurnBanner variant="your_turn">
                        Your turn: the applicant proposed {formatNaira(current.offer.amount)}. Accept, reject, or send a
                        counter.
                      </OfferTurnBanner>
                      <p className="text-sm text-muted-foreground">
                        Accepting closes the listing and declines other pending offers on it. You can only accept one
                        applicant per listing.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          onClick={() =>
                            setAcceptTarget({
                              offerId: current.offer.id,
                              amount: current.offer.amount,
                              listingTitle: current.listing?.title ?? `Listing #${current.offer.listingId}`,
                              applicantLabel: `applicant #${current.offer.applicantId}`,
                            })
                          }
                          disabled={respondMutation.isPending}
                        >
                          Accept
                        </Button>
                        <InspectionMoreMenu
                          disabled={respondMutation.isPending}
                          menuLabel="Reject only if you will not negotiate further on this applicant."
                          triggerLabel="More offer actions"
                          items={[
                            {
                              id: "reject",
                              label: "Reject offer",
                              description: "Declines this applicant's current offer on the thread.",
                              destructive: true,
                              onSelect: () =>
                                respondMutation.mutate({ offerId: current.offer.id, status: "DECLINED" }),
                            },
                          ]}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_auto]">
                        <div className="relative">
                          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground tabular-nums">₦</span>
                          <Input
                            inputMode="numeric"
                            className="pl-7 tabular-nums"
                            value={counterAmounts[current.offer.id] ?? ""}
                            onChange={(event) =>
                              setCounterAmounts((state) => ({ ...state, [current.offer.id]: event.target.value }))
                            }
                            placeholder="Counter amount"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => counterMutation.mutate({ offerId: current.offer.id, amount: Number(counterAmounts[current.offer.id] || 0) })}
                          disabled={counterMutation.isPending || !counterAmounts[current.offer.id]}
                        >
                          Send counter
                        </Button>
                      </div>
                    </div>
                  ) : waitingHint ? (
                    <OfferTurnBanner>{waitingHint}</OfferTurnBanner>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyPanel
          title="No offers yet"
          body="When applicants start negotiating on your listings, the full chain will show up here so you can answer with context."
          ctaLabel="Review properties"
          ctaHref="/owner/properties"
        />
      )}
    </div>
  );
}

