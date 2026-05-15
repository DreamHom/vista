"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { NativeSelect, PrototypeNotice, FilterPills, FieldLabel } from "./owner-page-primitives";

export function OwnerInspectionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [tab, setTab] = useState("pending");
  const [listingId, setListingId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});

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

  const slotMutation = useMutation({
    mutationFn: async () => createInspectionSlot(Number(listingId), { startsAt, endsAt }),
    onSuccess: async () => {
      toast.success("Inspection slot added.");
      setSlotDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["owner-inspections"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-property"] });
    },
    onError: () => toast.error("We couldn't create that inspection slot."),
  });

  if (inspectionsQuery.isLoading || listingsQuery.isLoading) {
    return <LoadingPanel label="Loading inspection activity..." />;
  }
  if (inspectionsQuery.error || listingsQuery.error) {
    return <ErrorPanel body="We couldn't load owner inspection activity." onRetry={() => void inspectionsQuery.refetch()} />;
  }

  const items = inspectionsQuery.data!.filter((item) => item.localStatus === tab);
  const listings = listingsQuery.data!.items;
  const slotWindowInvalid =
    Boolean(startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime());

  return (
    <div className="space-y-6">
      <Dialog
        open={slotDialogOpen}
        onOpenChange={(open) => {
          setSlotDialogOpen(open);
          if (!open) {
            setListingId("");
            setStartsAt("");
            setEndsAt("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create inspection slot</DialogTitle>
            <DialogDescription>
              Pick one of your listings and the time window you want open for applicants. The slot appears on the public listing in upload order with your other slots.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <FieldLabel>Listing</FieldLabel>
              <NativeSelect value={listingId} onChange={(event) => setListingId(event.target.value)}>
                <option value="">Select a listing</option>
                {listings.map((item) => (
                  <option key={item.listing.id} value={String(item.listing.id)}>
                    {item.listing.title ?? `Listing #${item.listing.id}`}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <FieldLabel>Starts</FieldLabel>
              <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Ends</FieldLabel>
              <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            </div>
            {slotWindowInvalid ? (
              <p className="text-sm text-destructive">End time must be after the start time.</p>
            ) : null}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setSlotDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => slotMutation.mutate()}
              disabled={
                slotMutation.isPending || !listingId || !startsAt || !endsAt || slotWindowInvalid
              }
            >
              {slotMutation.isPending ? "Creating…" : "Create slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        description="Open bookable windows on your listings so applicants can request a visit without endless back-and-forth."
        action={
          <Button type="button" onClick={() => setSlotDialogOpen(true)} className="shrink-0 gap-2">
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Create slot
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Slots are created on Haven against the listing you choose. Use <span className="font-medium text-foreground">Create slot</span>{" "}
          to open the form in a dialog.
        </p>
      </SectionCard>

      <FilterPills
        value={tab}
        onChange={setTab}
        options={[
          { label: "Pending", value: "pending" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ]}
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.notification.id} className="border-border/70 shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{item.applicantName}</p>
                      <StatusBadge label={item.statusLabel} variant={item.statusLabel === "Confirmed" ? "success" : item.statusLabel === "Completed" ? "success" : item.statusLabel === "Cancelled" ? "outline" : "warning"} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.listing?.title ?? "Listing activity"} · {item.listing?.property.address ?? "Notification-backed inspection request"}
                    </p>
                  </div>
                  <StatusBadge label={formatDateTime(item.requestedAt)} variant="outline" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item.notification.body}</p>
                <Textarea
                  rows={3}
                  value={notes[item.notification.id] ?? ""}
                  onChange={(event) => {
                    const next = { ...notes, [item.notification.id]: event.target.value };
                    setNotes(next);
                    if (user) saveInspectionNote(user.id, item.notification.id, event.target.value);
                  }}
                  placeholder="Add inspection notes or seriousness context"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!user) return;
                      if (item.inspectionId) {
                        try {
                          await ownerApproveInspectionRequest(item.inspectionId);
                          toast.success("Inspection approved on Haven.");
                        } catch {
                          toast.error("Could not approve on the server.");
                          return;
                        }
                      }
                      saveInspectionStatus(user.id, item.notification.id, "Confirmed");
                      void queryClient.invalidateQueries({ queryKey: ["owner-inspections", user.id] });
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!user) return;
                      if (item.inspectionId) {
                        try {
                          await ownerDeclineInspectionRequest(item.inspectionId);
                          toast.success("Inspection declined on Haven.");
                        } catch {
                          toast.error("Could not decline on the server.");
                          return;
                        }
                      }
                      saveInspectionStatus(user.id, item.notification.id, "Cancelled");
                      void queryClient.invalidateQueries({ queryKey: ["owner-inspections", user.id] });
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!user) return;
                      saveInspectionStatus(user.id, item.notification.id, "Completed");
                      void queryClient.invalidateQueries({ queryKey: ["owner-inspections", user.id] });
                    }}
                  >
                    Mark completed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!user) return;
                      if (item.inspectionId) {
                        try {
                          await ownerMarkInspectionNoShow(item.inspectionId);
                          toast.success("Marked as no-show on Haven.");
                        } catch {
                          toast.error("Could not record no-show on the server.");
                          return;
                        }
                      }
                      saveInspectionStatus(user.id, item.notification.id, "Cancelled");
                      void queryClient.invalidateQueries({ queryKey: ["owner-inspections", user.id] });
                    }}
                  >
                    Mark no-show
                  </Button>
                </div>
              </CardContent>
            </Card>
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

