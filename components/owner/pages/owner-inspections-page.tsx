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

import { NativeSelect, PrototypeNotice, FilterPills } from "./owner-page-primitives";

export function OwnerInspectionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
      setStartsAt("");
      setEndsAt("");
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

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Inspection operations"
        title="Inspections"
        description="Track incoming requests and keep supply moving by opening fresh slots for serious applicants."
      />

      <PrototypeNotice
        title="Owner-side inspection response actions are still prototype-only."
        body="Haven v1.0.1 exposes slot creation and inspection-request notifications, but not dedicated owner approve/decline or no-show endpoints yet. Status changes and notes on this page are stored locally for now."
      />

      <SectionCard title="Set available slots" description="Create new windows applicants can claim on a live listing.">
        <div className="grid gap-4 md:grid-cols-4">
          <NativeSelect value={listingId} onChange={(event) => setListingId(event.target.value)}>
            <option value="">Select listing</option>
            {listings.map((item) => (
              <option key={item.listing.id} value={item.listing.id}>
                {item.listing.title ?? `Listing #${item.listing.id}`}
              </option>
            ))}
          </NativeSelect>
          <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
          <Button onClick={() => slotMutation.mutate()} disabled={slotMutation.isPending || !listingId || !startsAt || !endsAt}>
            {slotMutation.isPending ? "Saving..." : "Create slot"}
          </Button>
        </div>
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
                    onClick={() => {
                      if (!user) return;
                      saveInspectionStatus(user.id, item.notification.id, "Confirmed");
                      void queryClient.invalidateQueries({ queryKey: ["owner-inspections", user.id] });
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!user) return;
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
                    onClick={() => {
                      if (!user) return;
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
        <EmptyPanel
          title="No inspection activity in this tab"
          body="As Haven emits inspection-request notifications, they'll land here together with your locally-tracked owner actions."
          ctaLabel="Create a slot"
          ctaHref="/owner/inspections"
        />
      )}
    </div>
  );
}

