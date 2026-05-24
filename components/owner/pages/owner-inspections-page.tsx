"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarPlus,
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
  ownerApproveInspectionRequest,
  ownerDeclineInspectionRequest,
  ownerMarkInspectionNoShow,
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
import { InspectionSlotCreateDialog } from "@/components/inspection/inspection-slot-create-dialog";
import { OwnerInspectionRequestCard } from "@/components/owner/owner-inspection-request-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  inspectionOwnerDeclineErrorMessage,
  inspectionOwnerNoShowErrorMessage,
} from "@/lib/inspection-lifecycle";
import { InspectionTabFilters } from "@/components/inspection/inspection-tab-filters";
import { PrototypeNotice } from "./owner-page-primitives";

export function OwnerInspectionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [tab, setTab] = useState("pending");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [actionNotificationId, setActionNotificationId] = useState<number | null>(null);

  const ownerActionMutation = useMutation({
    mutationFn: async (input: {
      notificationId: number;
      inspectionId: number | null;
      action: "approve" | "decline" | "complete" | "no_show";
    }) => {
      if (!user) throw new Error("Sign in required.");
      const { notificationId, inspectionId, action } = input;
      setActionNotificationId(notificationId);

      if (action === "approve") {
        if (inspectionId) await ownerApproveInspectionRequest(inspectionId);
        saveInspectionStatus(user.id, notificationId, "Approved");
        return;
      }
      if (action === "decline") {
        if (inspectionId) await ownerDeclineInspectionRequest(inspectionId);
        saveInspectionStatus(user.id, notificationId, "Cancelled");
        return;
      }
      if (action === "complete") {
        saveInspectionStatus(user.id, notificationId, "Completed");
        return;
      }
      if (action === "no_show") {
        if (inspectionId) await ownerMarkInspectionNoShow(inspectionId);
        saveInspectionStatus(user.id, notificationId, "No-show");
      }
    },
    onSuccess: async (_, variables) => {
      const messages = {
        approve: "Visit approved on Haven.",
        decline: "Request declined. Slot freed for other applicants.",
        complete: "Marked complete.",
        no_show: "No-show recorded.",
      } as const;
      toast.success(messages[variables.action]);
      await queryClient.invalidateQueries({ queryKey: ["owner-inspections", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["owner-notifications"] });
    },
    onError: (error, variables) => {
      if (variables.action === "decline") {
        toast.error(inspectionOwnerDeclineErrorMessage(error));
        return;
      }
      if (variables.action === "no_show") {
        toast.error(inspectionOwnerNoShowErrorMessage(error));
        return;
      }
      toast.error("Could not update this inspection on the server.");
    },
    onSettled: () => setActionNotificationId(null),
  });

  const inspectionsQuery = useQuery({
    queryKey: ["owner-inspections", user?.id],
    queryFn: () => listOwnerInspectionItems(user!.id),
    enabled: !!user?.id,
  });

  const listingsQuery = useQuery({
    queryKey: ["owner-listings", user?.id],
    queryFn: () => listOwnerListings(100),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user) {
      setNotes(readInspectionNotes(user.id));
    }
  }, [user]);

  const listingOptions = useMemo(
    () =>
      (listingsQuery.data?.items ?? []).map((item) => ({
        id: item.listing.id,
        title: item.listing.title ?? `Listing #${item.listing.id}`,
      })),
    [listingsQuery.data],
  );

  if (inspectionsQuery.isLoading || listingsQuery.isLoading) {
    return <LoadingPanel label="Loading inspection activity..." />;
  }
  if (inspectionsQuery.error || listingsQuery.error) {
    return <ErrorPanel body="We couldn't load owner inspection activity." onRetry={() => void inspectionsQuery.refetch()} />;
  }

  const items = inspectionsQuery.data!.filter((item) => {
    if (tab === "cancelled") {
      return item.localStatus === "cancelled" || item.localStatus === "no_show";
    }
    return item.localStatus === tab;
  });

  return (
    <div className="space-y-6">
      <InspectionSlotCreateDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        listings={listingOptions}
        queryKeysToInvalidate={[["owner-inspections", user?.id], ["owner-listings", user?.id], ["owner-property"]]}
      />

      <DashboardPageIntro
        eyebrow="Inspection operations"
        title="Inspections"
        description="Track incoming requests and keep supply moving by opening fresh slots for serious applicants."
      />

      <PrototypeNotice
        title="Inspection actions"
        body="When Haven includes an inspection id on the request notification, Approve, Decline, and Mark no‑show call the server first, then mirror status here for your notes. Without that id, actions stay on-device until notifications carry the richer payload."
      />

      <SectionCard
        title="Inspection slots"
        description="Publish non-overlapping time windows per listing. Haven enforces this in Postgres; applicants race for a slot is also resolved in the database (first claim wins)."
        action={
          <Button type="button" onClick={() => setSlotDialogOpen(true)} className="shrink-0 gap-2">
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Publish times
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Default to batch mode: pick a date, tap 10:00, 11:00, 14:00, and publish every window in one step. Overlaps
          are blocked in the UI and in Postgres.
        </p>
      </SectionCard>

      <InspectionTabFilters
        value={tab}
        onChange={setTab}
        options={[
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Completed", value: "completed" },
          { label: "Declined / no-show", value: "cancelled" },
        ]}
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <OwnerInspectionRequestCard
              key={item.notification.id}
              item={item}
              note={notes[item.notification.id] ?? ""}
              onNoteChange={(value) => {
                const next = { ...notes, [item.notification.id]: value };
                setNotes(next);
                if (user) saveInspectionNote(user.id, item.notification.id, value);
              }}
              pendingAction={ownerActionMutation.isPending && actionNotificationId === item.notification.id}
              onApprove={() =>
                ownerActionMutation.mutate({
                  notificationId: item.notification.id,
                  inspectionId: item.inspectionId,
                  action: "approve",
                })
              }
              onDecline={() =>
                ownerActionMutation.mutate({
                  notificationId: item.notification.id,
                  inspectionId: item.inspectionId,
                  action: "decline",
                })
              }
              onMarkCompleted={() =>
                ownerActionMutation.mutate({
                  notificationId: item.notification.id,
                  inspectionId: item.inspectionId,
                  action: "complete",
                })
              }
              onMarkNoShow={() =>
                ownerActionMutation.mutate({
                  notificationId: item.notification.id,
                  inspectionId: item.inspectionId,
                  action: "no_show",
                })
              }
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <EmptyPanel
            title="No inspection activity in this tab"
            body="As Haven emits inspection-request notifications, they'll land here together with your locally-tracked owner actions."
          />
          <div className="flex justify-center">
            <Button type="button" onClick={() => setSlotDialogOpen(true)} className="gap-2">
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Create inspection slot
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

