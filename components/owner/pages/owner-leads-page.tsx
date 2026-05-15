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
  revealOwnerListingLead,
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

import { FieldLabel, NativeSelect, listingTitle, listingLocation, PrototypeNotice } from "./owner-page-primitives";

export function OwnerLeadsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [listingFilter, setListingFilter] = useState("all");
  const [temperatureFilter, setTemperatureFilter] = useState("all");
  const leadsQuery = useQuery({
    queryKey: ["owner-leads", user?.id],
    queryFn: () => listOwnerLeads(user!.id),
    enabled: !!user?.id,
  });

  const revealMutation = useMutation({
    mutationFn: async ({ listingId, leadId }: { listingId: number; leadId: number }) =>
      revealOwnerListingLead(listingId, leadId),
    onSuccess: async () => {
      toast.success("Contact details unlocked.");
      await queryClient.invalidateQueries({ queryKey: ["owner-leads", user?.id] });
    },
    onError: () => toast.error("Could not reveal contact details."),
  });

  const toggleShortlistMutation = useMutation({
    mutationFn: async (leadKey: string) => {
      toggleLeadShortlist(user!.id, leadKey);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["owner-leads", user?.id] });
    },
  });

  if (leadsQuery.isLoading) return <LoadingPanel label="Loading incoming demand..." />;
  if (leadsQuery.error) {
    return <ErrorPanel body="We couldn't pull lead activity right now." onRetry={() => leadsQuery.refetch()} />;
  }

  const leads = leadsQuery.data!;
  const listingOptions = ["all", ...new Set(leads.map((lead) => String(lead.listingId)))];
  const filtered = leads.filter((lead) => {
    if (listingFilter !== "all" && String(lead.listingId) !== listingFilter) return false;
    if (temperatureFilter !== "all" && lead.temperature !== temperatureFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Lead intelligence"
        title="Leads"
        description="A trust-first view of who has shown intent on your listings so you can focus on serious conversations."
      />

      <PrototypeNotice
        title="How leads are built"
        body="This view merges offers and public comments with formal listing leads returned by Haven for each of your listings. When a row comes from Haven, Reveal contact calls the server to unlock phone and email after you confirm you want the PII."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Filter by listing</FieldLabel>
          <NativeSelect value={listingFilter} onChange={(event) => setListingFilter(event.target.value)}>
            <option value="all">All listings</option>
            {listingOptions.filter((value) => value !== "all").map((value) => (
              <option key={value} value={value}>
                Listing #{value}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <FieldLabel>Filter by temperature</FieldLabel>
          <NativeSelect value={temperatureFilter} onChange={(event) => setTemperatureFilter(event.target.value)}>
            <option value="all">All temperatures</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </NativeSelect>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((lead) => (
            <Card key={lead.key} className="border-border/70 shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{lead.applicantName}</p>
                      <StatusBadge
                        label={lead.temperature}
                        variant={lead.temperature === "Hot" ? "success" : lead.temperature === "Warm" ? "warning" : "outline"}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lead.listingTitle} · {lead.listingLocation}
                    </p>
                  </div>
                  <StatusBadge label={`Last activity ${formatDateTime(lead.lastActivityAt)}`} variant="outline" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{lead.sourceSummary}</p>
                {lead.leadMessage?.trim() ? (
                  <p className="rounded-md border border-border bg-muted/20 p-3 text-sm text-foreground">
                    <span className="font-medium text-muted-foreground">Their message · </span>
                    {lead.leadMessage.trim()}
                  </p>
                ) : null}
                {lead.contactRevealed && (lead.contactPhone || lead.contactEmail) ? (
                  <div className="space-y-1 rounded-md border border-border bg-secondary/15 p-3 text-sm">
                    {lead.contactPhone ? (
                      <p>
                        <span className="font-medium text-muted-foreground">Phone · </span>
                        {lead.contactPhone}
                      </p>
                    ) : null}
                    {lead.contactEmail ? (
                      <p>
                        <span className="font-medium text-muted-foreground">Email · </span>
                        {lead.contactEmail}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    disabled={!lead.havenLeadId || lead.contactRevealed || revealMutation.isPending}
                    onClick={() => {
                      if (!lead.havenLeadId) return;
                      revealMutation.mutate({ listingId: lead.listingId, leadId: lead.havenLeadId });
                    }}
                  >
                    {lead.contactRevealed ? "Contact revealed" : "Reveal contact"}
                  </Button>
                  <Button variant="outline" onClick={() => toggleShortlistMutation.mutate(lead.key)}>
                    {lead.shortlist ? "Remove from shortlist" : "Shortlist lead"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No leads match this filter yet"
          body="As comments and offers come in, they'll be grouped here so you can spot momentum and prioritise the right conversations."
          ctaLabel="Review offers"
          ctaHref="/owner/offers"
        />
      )}
    </div>
  );
}

