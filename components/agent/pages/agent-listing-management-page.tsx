"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { CommaIntegerInput } from "@/components/ui/comma-number-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { FieldLabel, PrototypeNotice } from "./agent-page-primitives";

export function AgentListingManagementPage({ listingId }: { listingId: number }) {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const workspaceQuery = useQuery({
    queryKey: ["agent-listing-workspace", userId, listingId],
    queryFn: () => getAgentListingWorkspace(listingId, userId),
    enabled: userId > 0,
  });
  const [message, setMessage] = useState("");
  const [localEdit, setLocalEdit] = useState({
    title: "",
    headline: "",
    description: "",
    askingPriceNgn: null as number | null,
  });

  useEffect(() => {
    setLocalEdit({ title: "", headline: "", description: "", askingPriceNgn: null });
  }, [listingId]);

  const messageMutation = useMutation({
    mutationFn: async () => {
      const managed = workspaceQuery.data?.managedListing;
      const ownerId = Number(managed?.listing?.owner?.id ?? managed?.ownerProfile?.id ?? 0);
      if (!ownerId) throw new Error("Owner context is unavailable.");
      appendAgentOwnerMessage(userId, {
        ownerId,
        listingId,
        body: message,
      });
    },
    onSuccess: async () => {
      setMessage("");
      toast.success("Owner message saved locally.");
      await queryClient.invalidateQueries({ queryKey: ["agent-listing-workspace", userId, listingId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "We couldn't save that owner note."),
  });

  if (workspaceQuery.isLoading) return <LoadingPanel label="Loading listing management workspace..." />;
  if (workspaceQuery.isError || !workspaceQuery.data) {
    return <ErrorPanel body="We couldn’t load this listing workspace right now." onRetry={() => void workspaceQuery.refetch()} />;
  }

  const { managedListing, leads, offers, ownerMessages } = workspaceQuery.data;

  if (!managedListing) {
    return (
      <EmptyPanel
        title="Listing not found in your workspace"
        body="This route is reserved for listings that have been assigned to your agent account."
        ctaLabel="Back to my listings"
        ctaHref="/agent/listings"
      />
    );
  }

  const listing = managedListing.listing;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Listing management"
        title={listing?.title ?? `Listing #${listingId}`}
        description={listing?.address ?? "Use this workspace to review supply quality, pipeline activity, and owner comms for this assigned listing."}
      />

      <PrototypeNotice
        title="Agent-side listing edits are still a product prototype"
        body="Haven v1.0.1 still limits PATCH listing mutations to the owner. This page keeps the full edit surface visible, but changes save as an internal working draft for owner coordination."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Listing details" description="Review the public surface and prep owner-approved edits.">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Title</FieldLabel>
                <Input
                  value={localEdit.title || listing?.title || ""}
                  onChange={(event) => setLocalEdit((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Headline</FieldLabel>
                <Input
                  value={localEdit.headline || listing?.headline || ""}
                  onChange={(event) => setLocalEdit((current) => ({ ...current, headline: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                rows={5}
                value={localEdit.description || listing?.description || ""}
                onChange={(event) => setLocalEdit((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Asking price (₦)</FieldLabel>
                <CommaIntegerInput
                  value={localEdit.askingPriceNgn ?? listing?.priceNgn ?? 0}
                  onChange={(n) => setLocalEdit((current) => ({ ...current, askingPriceNgn: n }))}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Status</FieldLabel>
                <Input value={listing?.status ?? managedListing.assignment.status} disabled />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => toast.success("Working draft saved locally for owner follow-up.")}
              >
                Save draft locally
              </Button>
              <Link href={`/listings/${listingId}`} target="_blank">
                <Button variant="outline">
                  View public listing
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Inspection slots management" description="Current availability plus agent coordination notes.">
          <PrototypeNotice
            title="Opening or removing slots still belongs to the owner API surface"
            body="The backend authorises slot creation for owners only today, even for accepted agents. Use this view to plan owner-facing slot changes and track availability already visible on the listing."
          />
          <div className="mt-4 space-y-3">
            {(listing?.slots ?? []).length === 0 ? (
              <EmptyPanel
                title="No public slots currently open"
                body="Coordinate new availability with the owner, then ask them to open the slots from their dashboard."
              />
            ) : (
              (listing?.slots ?? []).map((slot) => (
                <div key={slot.id} className="border border-border bg-secondary/40 px-4 py-4 text-sm text-muted-foreground">
                  {formatDateTime(slot.startsAt)} to {formatDateTime(slot.endsAt)}
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Leads for this listing" description="Applicants and signals already captured on this property.">
          {leads.length === 0 ? (
            <EmptyPanel title="No leads yet" body="Comments, inspections, and offer activity tied to this listing will appear here." />
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.key} className="border border-border bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{lead.applicantName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{lead.lastAction}</p>
                    </div>
                    <StatusBadge label={lead.temperature} variant={lead.temperature === "Hot" ? "warning" : "outline"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Offers for this listing" description="Offer activity and recommendation notes for the owner conversation.">
          {offers.length === 0 ? (
            <EmptyPanel title="No offer activity yet" body="Offer notifications or accessible offer rows will show up here once negotiations begin." />
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.key} className="border border-border bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{offer.applicantName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{offer.summary}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge label={offer.status} variant={offer.status === "ACCEPTED" ? "success" : "secondary"} />
                      <p className="mt-2 text-sm font-medium text-foreground">{offer.amount ? formatNaira(offer.amount) : "Amount unavailable"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Owner communication log" description="Keep a clean thread of listing-specific owner follow-up.">
        <div className="space-y-4">
          {ownerMessages.length === 0 ? (
            <EmptyPanel title="No owner updates recorded" body="Use this log to store message drafts and follow-up notes tied to this listing." />
          ) : (
            <div className="space-y-3">
              {ownerMessages.map((entry) => (
                <div key={entry.id} className="border border-border bg-secondary/40 px-4 py-4">
                  <p className="text-sm leading-6 text-foreground">{entry.body}</p>
                  <p className="mt-2 text-xs uppercase tracking-eyebrow text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3">
            <Textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Add an owner update, negotiation note, or follow-up summary..." />
            <div className="flex justify-end">
              <Button disabled={message.trim().length === 0 || messageMutation.isPending} onClick={() => messageMutation.mutate()}>
                {messageMutation.isPending ? "Saving..." : "Message owner"}
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

