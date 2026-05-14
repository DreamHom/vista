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

import { FieldLabel, NativeSelect, propertyImageUrl } from "./owner-page-primitives";

export function OwnerPropertyDetailPage({ propertyId }: { propertyId: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editState, setEditState] = useState({
    title: "",
    headline: "",
    description: "",
    askingPrice: "",
    handoverDate: "",
    status: "LIVE" as "LIVE" | "PAUSED" | "CLOSED" | "TAKEN_DOWN",
  });
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);

  const detailQuery = useQuery({
    queryKey: ["owner-property", user?.id, propertyId],
    queryFn: () => getOwnerPropertyManagement(propertyId, user!.id),
    enabled: !!user?.id,
  });

  const agentSearchQuery = useQuery({
    queryKey: ["owner-agent-search", searchTerm],
    queryFn: () => searchAssignableAgents(searchTerm),
    enabled: searchTerm.trim().length >= 2,
  });

  useEffect(() => {
    const listing = detailQuery.data?.listingBundle?.listing;
    if (!listing) return;
    setEditState({
      title: listing.title ?? "",
      headline: listing.headline ?? "",
      description: listing.description ?? "",
      askingPrice: String(listing.askingPrice ?? ""),
      handoverDate: listing.handoverDate ?? "",
      status: listing.status,
    });
  }, [detailQuery.data?.listingBundle?.listing]);

  const saveListingMutation = useMutation({
    mutationFn: async () => {
      const listing = detailQuery.data?.listingBundle?.listing;
      if (!listing) return;
      await updateOwnerListing(listing.id, {
        title: editState.title,
        headline: editState.headline,
        description: editState.description,
        askingPrice: Number(editState.askingPrice || 0),
        handoverDate: editState.handoverDate || undefined,
        status: editState.status,
      });
    },
    onSuccess: async () => {
      toast.success("Listing details updated.");
      await queryClient.invalidateQueries({ queryKey: ["owner-property", user?.id, propertyId] });
      await queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    },
    onError: () => toast.error("We couldn't save those listing changes."),
  });

  const verificationMutation = useMutation({
    mutationFn: async () => {
      if (verificationFiles.length === 0) return;
      await submitPropertyDocumentsVerification(propertyId, verificationFiles);
    },
    onSuccess: async () => {
      toast.success("Property verification documents submitted.");
      setVerificationFiles([]);
      await queryClient.invalidateQueries({ queryKey: ["owner-property", user?.id, propertyId] });
    },
    onError: () => toast.error("We couldn't submit the property documents just yet."),
  });

  const inviteMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const listing = detailQuery.data?.listingBundle?.listing;
      if (!listing) return;
      await inviteAgentToListing(listing.id, agentId);
    },
    onSuccess: async () => {
      toast.success("Agent invitation sent.");
      setSearchTerm("");
      await queryClient.invalidateQueries({ queryKey: ["owner-property", user?.id, propertyId] });
      await queryClient.invalidateQueries({ queryKey: ["owner-assignments"] });
    },
    onError: () => toast.error("We couldn't send that agent invitation."),
  });

  const revokeMutation = useMutation({
    mutationFn: (assignment: AgentListingResponse) => revokeAgentAssignment(assignment.id, "Owner removed this assignment."),
    onSuccess: async () => {
      toast.success("Agent assignment removed.");
      await queryClient.invalidateQueries({ queryKey: ["owner-property", user?.id, propertyId] });
      await queryClient.invalidateQueries({ queryKey: ["owner-assignments"] });
    },
    onError: () => toast.error("We couldn't remove that assignment."),
  });

  if (detailQuery.isLoading) return <LoadingPanel label="Loading property management view..." />;
  if (detailQuery.error) {
    return <ErrorPanel body="We couldn't load this property workspace." onRetry={() => detailQuery.refetch()} />;
  }

  const data = detailQuery.data!;
  const listing = data.listingBundle?.listing ?? null;
  const detail = data.listingBundle?.detail ?? null;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Property management"
        title={listing?.title ?? data.property.address}
        description="Adjust the live listing, watch trust status, invite the right agent, and keep every next move visible."
        actions={
          <Link href="/owner/properties">
            <Button variant="outline">Back to properties</Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard title="Property snapshot" description="Core facts from the property record and the active listing attached to it.">
          <div className="space-y-5">
            <img
              src={detail?.photos?.[0]?.url ?? propertyImageUrl({ listingDetail: detail })}
              alt={listing?.title ?? data.property.address}
              className="h-64 w-full rounded-3xl object-cover"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-secondary/50 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Address</p>
                <p className="mt-2 text-sm font-medium text-foreground">{data.property.address}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Type</p>
                <p className="mt-2 text-sm font-medium text-foreground">{data.property.type.replaceAll("_", " ")}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Listing status</p>
                <p className="mt-2 text-sm font-medium text-foreground">{listing?.status ?? "No listing yet"}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Verification</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {data.propertyVerification?.status ?? "No property-doc verification yet"}
                </p>
              </div>
            </div>

            {listing ? (
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard label="Views" value={String(listing.viewCount ?? 0)} hint="Live traffic Haven exposes today." />
                <MetricCard label="Offers received" value={String(data.offers.length)} hint="Negotiations tied to this listing." />
                <MetricCard label="Comments" value={String(data.comments.length)} hint="Public Q&A on this listing." />
                <MetricCard
                  label="Inspection slots"
                  value={String(detail?.slots.length ?? 0)}
                  hint="Open or claimed slots visible on the listing."
                />
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Edit listing details" description="Inline owner controls for the active listing. Property basics remain read-only until Haven exposes a property update endpoint.">
          {listing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel>Title</FieldLabel>
                <Input value={editState.title} onChange={(event) => setEditState((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <FieldLabel>Headline</FieldLabel>
                <Input value={editState.headline} onChange={(event) => setEditState((current) => ({ ...current, headline: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <FieldLabel>Description</FieldLabel>
                <Textarea rows={6} value={editState.description} onChange={(event) => setEditState((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Asking price</FieldLabel>
                  <Input value={editState.askingPrice} onChange={(event) => setEditState((current) => ({ ...current, askingPrice: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Availability status</FieldLabel>
                  <NativeSelect value={editState.status} onChange={(event) => setEditState((current) => ({ ...current, status: event.target.value as typeof current.status }))}>
                    <option value="LIVE">Available</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CLOSED">Closed</option>
                    <option value="TAKEN_DOWN">Taken down</option>
                  </NativeSelect>
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>Handover date</FieldLabel>
                <Input type="date" value={editState.handoverDate} onChange={(event) => setEditState((current) => ({ ...current, handoverDate: event.target.value }))} />
              </div>
              <Button onClick={() => saveListingMutation.mutate()} disabled={saveListingMutation.isPending}>
                {saveListingMutation.isPending ? "Saving..." : "Save listing changes"}
              </Button>
            </div>
          ) : (
            <EmptyPanel
              title="This property has no live listing yet"
              body="Create a listing from the properties page or the new-property workflow before you start editing live pricing and visibility."
              ctaLabel="Create listing"
              ctaHref="/owner/properties/new"
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard title="Verification status" description="Property document review and resubmission area.">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                Current status: {data.propertyVerification?.status ?? "Not submitted"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.propertyVerification?.decidedAt
                  ? `Decision recorded ${formatDateTime(data.propertyVerification.decidedAt)}. Upload fresh documents if this property still needs review.`
                  : "Upload ownership documents to trigger DreamHomes property verification."}
              </p>
            </div>
            <div className="space-y-2">
              <FieldLabel>Resubmit property documents</FieldLabel>
              <Input type="file" multiple onChange={(event) => setVerificationFiles(Array.from(event.target.files ?? []))} />
            </div>
            <Button onClick={() => verificationMutation.mutate()} disabled={verificationMutation.isPending || verificationFiles.length === 0}>
              {verificationMutation.isPending ? "Submitting..." : "Submit documents"}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Assign agent" description="Search verified agents, invite them to manage this listing, and revoke assignments when you need a new fit.">
          {listing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel>Search agents</FieldLabel>
                <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name or location" />
              </div>

              {agentSearchQuery.data?.length ? (
                <div className="space-y-3">
                  {agentSearchQuery.data.slice(0, 4).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4">
                      <div>
                        <p className="font-medium text-foreground">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.verified ? "Verified agent" : "Agent profile"} ·
                          {agent.averageRating ? ` ${agent.averageRating.toFixed(1)} rating` : " New on DreamHomes"}
                        </p>
                      </div>
                      <Button onClick={() => inviteMutation.mutate(Number(agent.id))} disabled={inviteMutation.isPending}>
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <p className="text-sm text-muted-foreground">No agents matched that search yet.</p>
              ) : null}

              <div className="space-y-3">
                {data.assignments.length > 0 ? (
                  data.assignments.map((item) => (
                    <div key={item.assignment.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{item.agentProfile?.fullName ?? `Agent #${item.assignment.agentUserId}`}</p>
                          <p className="text-sm text-muted-foreground">
                            Requested {formatDateTime(item.assignment.requestedAt)}
                            {item.assignment.decidedAt ? ` · decided ${formatDateTime(item.assignment.decidedAt)}` : ""}
                          </p>
                        </div>
                        <StatusBadge label={item.assignment.status} variant={item.assignment.status === "ACCEPTED" ? "success" : "outline"} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {item.assignment.status === "ACCEPTED" ? (
                          <Button variant="outline" onClick={() => revokeMutation.mutate(item.assignment)} disabled={revokeMutation.isPending}>
                            Remove agent
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No agent assignment history on this listing yet.</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyPanel
              title="Create a listing before assigning an agent"
              body="Agent invitations are tied to a live listing, not just the underlying property record."
              ctaLabel="Create listing"
              ctaHref="/owner/properties/new"
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

