"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, Flag, Sparkles } from "lucide-react";
import {
  appendAgentOwnerMessage,
  acceptAgentAssignment,
  changeAgentPassword,
  declineAgentAssignment,
  DEFAULT_AGENT_NOTIFICATION_PREFERENCES,
  DEFAULT_AGENT_PROFILE_DRAFT,
  getAgentDashboardOverview,
  getAgentListingWorkspace,
  getAgentProfileWorkspace,
  listAgentInspections,
  listAgentLeads,
  listAgentManagedListings,
  listAgentNotifications,
  listAgentOffers,
  listAgentOwnerRelationships,
  readAgentNotificationPreferences,
  readAgentProfileDraft,
  readAgentPromotions,
  saveAgentInspectionDecision,
  saveAgentLeadState,
  saveAgentNotificationPreferences,
  saveAgentOfferState,
  saveAgentProfileDraft,
  saveAgentPromotions,
  updateAgentProfile,
  type AgentInspectionDecision,
  type AgentNotificationFilter,
  type AgentPromotionRecord,
  type PipelineStage,
} from "@/lib/agent-dashboard";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/applicant-dashboard";
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
import { firstName, formatDate, formatDateTime, getGreeting } from "@/components/dashboard/utils";
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

import { FieldLabel, PrototypeNotice } from "./agent-page-primitives";

export function AgentOffersPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const offersQuery = useQuery({
    queryKey: ["agent-offers", userId],
    queryFn: () => listAgentOffers(userId),
    enabled: userId > 0,
  });

  const offerMutation = useMutation({
    mutationFn: async ({
      offerKey,
      presented,
      recommendation,
      counterDraft,
    }: {
      offerKey: string;
      presented: boolean;
      recommendation: string;
      counterDraft: string;
    }) => {
      saveAgentOfferState(userId, offerKey, { presented, recommendation, counterDraft });
    },
    onSuccess: async () => {
      toast.success("Offer workspace updated.");
      await queryClient.invalidateQueries({ queryKey: ["agent-offers", userId] });
    },
    onError: () => toast.error("We couldn't save that offer state."),
  });

  if (offersQuery.isLoading) return <LoadingPanel label="Loading offer activity..." />;
  if (offersQuery.isError || !offersQuery.data) {
    return <ErrorPanel body="We couldn’t load your managed offer activity right now." onRetry={() => void offersQuery.refetch()} />;
  }

  const items = offersQuery.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent workspace"
        title="Offers"
        description="Offer threads across your assigned listings, plus owner-ready recommendations and handoff notes."
      />

      <PrototypeNotice
        title="Countering on the owner's behalf is staged for design review"
        body="Current Haven offer mutations are owner and applicant scoped. This page captures the agent’s recommendation flow and presentation state while deeper agent-side negotiation remains a roadmap item."
      />

      {items.length === 0 ? (
        <EmptyPanel title="No offer activity yet" body="Offer submissions and counters tied to your managed listings will show here." />
      ) : (
        <div className="space-y-4">
          {items.map((offer) => (
            <Card key={offer.key} className="border-border shadow-none">
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{offer.listing?.title ?? "Managed listing"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {offer.applicantName} • {formatDateTime(offer.occurredAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge label={offer.status} variant={offer.status === "ACCEPTED" ? "success" : "secondary"} />
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {offer.amount ? formatNaira(offer.amount) : "Amount unavailable"}
                    </p>
                  </div>
                </div>

                <div className="border border-border bg-secondary/40 px-4 py-4 text-sm text-muted-foreground">{offer.summary}</div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>Recommendation note</FieldLabel>
                    <Textarea
                      rows={4}
                      defaultValue={offer.recommendation}
                      onBlur={(event) =>
                        offerMutation.mutate({
                          offerKey: offer.key,
                          presented: offer.presented,
                          recommendation: event.target.value,
                          counterDraft: offer.counterDraft,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Counter offer draft</FieldLabel>
                    <Textarea
                      rows={4}
                      defaultValue={offer.counterDraft}
                      onBlur={(event) =>
                        offerMutation.mutate({
                          offerKey: offer.key,
                          presented: offer.presented,
                          recommendation: offer.recommendation,
                          counterDraft: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={offer.presented ? "primary" : "outline"}
                    onClick={() =>
                      offerMutation.mutate({
                        offerKey: offer.key,
                        presented: !offer.presented,
                        recommendation: offer.recommendation,
                        counterDraft: offer.counterDraft,
                      })
                    }
                  >
                    {offer.presented ? "Presented to owner" : "Present to owner"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.success("Counter offer draft saved for owner coordination.")}
                  >
                    Counter on behalf
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

