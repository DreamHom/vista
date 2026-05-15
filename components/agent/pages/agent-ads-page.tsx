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

import { FieldLabel, NativeSelect, PrototypeNotice, PromotionCard } from "./agent-page-primitives";

export function AgentAdsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const listingsQuery = useQuery({
    queryKey: ["agent-managed-listings"],
    queryFn: listAgentManagedListings,
  });
  const [profileDuration, setProfileDuration] = useState("7");
  const [listingDuration, setListingDuration] = useState("14");
  const [listingId, setListingId] = useState("");
  const [promotions, setPromotions] = useState(() => readAgentPromotions(userId));

  const profileCost = Number(profileDuration) * 28000;
  const listingCost = Number(listingDuration) * 36000;

  function addPromotion(next: Omit<AgentPromotionRecord, "id" | "viewsGenerated" | "status" | "startedAt" | "endsAt">) {
    const now = new Date();
    const record: AgentPromotionRecord = {
      ...next,
      id: `${next.type}-${Date.now()}`,
      status: "PENDING",
      startedAt: now.toISOString(),
      endsAt: new Date(now.getTime() + next.durationDays * 24 * 60 * 60 * 1000).toISOString(),
      viewsGenerated: 0,
    };
    const updated = [record, ...promotions];
    setPromotions(updated);
    saveAgentPromotions(userId, updated);
    toast.success("Promotion request queued locally.");
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent workspace"
        title="Ads"
        description="Stage featured placement requests for your profile and the listings you manage."
      />

      <PrototypeNotice
        title="Promotions are currently a frontend workflow preview"
        body="Haven v1.0.1 doesn’t expose ad purchase or approval endpoints yet. This page models the agent-side flow, pricing, and performance surfaces expected in the final product."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Promote my profile" description="Featured agent placement for a fixed duration.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Duration</FieldLabel>
              <NativeSelect value={profileDuration} onChange={(event) => setProfileDuration(event.target.value)}>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </NativeSelect>
            </div>
            <div className="border border-border bg-secondary/40 px-4 py-4">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Cost display</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{formatNaira(profileCost)}</p>
            </div>
            <Button
              onClick={() =>
                addPromotion({
                  type: "PROFILE",
                  title: `${user?.fullName ?? "Agent profile"} featured placement`,
                  durationDays: Number(profileDuration),
                  cost: profileCost,
                })
              }
            >
              Request featured agent placement
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Promote a listing" description="Choose one of your managed listings and stage a campaign.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Listing</FieldLabel>
              <NativeSelect value={listingId} onChange={(event) => setListingId(event.target.value)}>
                <option value="">Select listing</option>
                {(listingsQuery.data ?? []).map((item) => (
                  <option key={item.assignment.id} value={item.assignment.listingId}>
                    {item.listing?.title ?? `Listing #${item.assignment.listingId}`}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <FieldLabel>Duration</FieldLabel>
              <NativeSelect value={listingDuration} onChange={(event) => setListingDuration(event.target.value)}>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </NativeSelect>
            </div>
            <div className="border border-border bg-secondary/40 px-4 py-4">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Cost display</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{formatNaira(listingCost)}</p>
            </div>
            <Button
              disabled={!listingId}
              onClick={() =>
                addPromotion({
                  type: "LISTING",
                  listingId: Number(listingId),
                  title:
                    (listingsQuery.data ?? []).find((item) => item.assignment.listingId === Number(listingId))?.listing?.title ??
                    `Listing #${listingId}`,
                  durationDays: Number(listingDuration),
                  cost: listingCost,
                })
              }
            >
              Promote listing
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Active promotions" description="Performance metrics for currently active placements.">
        {promotions.filter((promotion) => promotion.status === "ACTIVE").length === 0 ? (
          <EmptyPanel title="No active promotions" body="Approved campaigns will appear here with views generated and end dates." />
        ) : (
          <div className="space-y-3">
            {promotions.filter((promotion) => promotion.status === "ACTIVE").map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Promotion history" description="Pending requests and ended campaigns.">
        {promotions.length === 0 ? (
          <EmptyPanel title="No promotion history yet" body="The first staged campaign will show up here for review." />
        ) : (
          <div className="space-y-3">
            {promotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

