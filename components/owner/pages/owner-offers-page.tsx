"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

import { groupOffersByThread } from "./owner-page-primitives";

export function OwnerOffersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [counterAmounts, setCounterAmounts] = useState<Record<number, string>>({});
  const offersQuery = useQuery({
    queryKey: ["owner-offers", user?.id],
    queryFn: () => listOwnerOffers(user!.id, 100),
    enabled: !!user?.id,
  });

  const respondMutation = useMutation({
    mutationFn: ({ offerId, status }: { offerId: number; status: "ACCEPTED" | "DECLINED" }) =>
      respondToOffer(offerId, status),
    onSuccess: async () => {
      toast.success("Offer updated.");
      await queryClient.invalidateQueries({ queryKey: ["owner-offers", user?.id] });
    },
    onError: () => toast.error("We couldn't update that offer."),
  });

  const counterMutation = useMutation({
    mutationFn: ({ offerId, amount }: { offerId: number; amount: number }) => counterOwnerOffer(offerId, { amount }),
    onSuccess: async () => {
      toast.success("Counter offer sent.");
      await queryClient.invalidateQueries({ queryKey: ["owner-offers", user?.id] });
    },
    onError: () => toast.error("We couldn't send that counter offer."),
  });

  if (offersQuery.isLoading) return <LoadingPanel label="Loading offers..." />;
  if (offersQuery.error) {
    return <ErrorPanel body="We couldn't load owner offer chains from Haven." onRetry={() => offersQuery.refetch()} />;
  }

  const groups = groupOffersByThread(offersQuery.data!);

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Negotiations"
        title="Offers"
        description="See the full back-and-forth on every listing, decide quickly, and counter with clean context."
      />

      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => {
            const current = group.current;
            if (!current) return null;
            const actionable = current.offer.status === "PENDING" && current.offer.proposedByUserId !== user?.id;

            return (
              <Card key={group.id} className="border-border/70 shadow-none">
                <CardContent className="space-y-5 p-5">
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

                  <div className="space-y-3 rounded-3xl bg-secondary/30 p-4">
                    {group.chain.map((item) => (
                      <div key={item.offer.id} className="rounded-2xl border border-border bg-white p-4">
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
                    <div className="space-y-4 rounded-3xl border border-primary/15 bg-primary/5 p-4">
                      <p className="text-sm font-semibold text-foreground">This offer still needs your response.</p>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={() => respondMutation.mutate({ offerId: current.offer.id, status: "ACCEPTED" })} disabled={respondMutation.isPending}>
                          Accept
                        </Button>
                        <Button variant="outline" onClick={() => respondMutation.mutate({ offerId: current.offer.id, status: "DECLINED" })} disabled={respondMutation.isPending}>
                          Reject
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_auto]">
                        <Input
                          value={counterAmounts[current.offer.id] ?? ""}
                          onChange={(event) =>
                            setCounterAmounts((state) => ({ ...state, [current.offer.id]: event.target.value }))
                          }
                          placeholder="Counter amount"
                        />
                        <Button
                          variant="outline"
                          onClick={() => counterMutation.mutate({ offerId: current.offer.id, amount: Number(counterAmounts[current.offer.id] || 0) })}
                          disabled={counterMutation.isPending || !counterAmounts[current.offer.id]}
                        >
                          Send counter
                        </Button>
                      </div>
                    </div>
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

