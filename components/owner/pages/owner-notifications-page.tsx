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

import { FilterPills, ownerNotificationCategory } from "./owner-page-primitives";

export function OwnerNotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const notificationsQuery = useQuery({
    queryKey: ["owner-notifications", user?.id],
    queryFn: () => listNotifications({ size: 100 }),
    enabled: !!user?.id,
  });

  const markOneMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["owner-notifications", user?.id] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: async () => {
      toast.success("Notifications marked as read.");
      await queryClient.invalidateQueries({ queryKey: ["owner-notifications", user?.id] });
    },
  });

  if (notificationsQuery.isLoading) return <LoadingPanel label="Loading notifications..." />;
  if (notificationsQuery.error) {
    return <ErrorPanel body="We couldn't load owner notifications." onRetry={() => notificationsQuery.refetch()} />;
  }

  const notifications = notificationsQuery.data!.items.filter((item) => filter === "all" || ownerNotificationCategory(item.kind) === filter);

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Inbox"
        title="Notifications"
        description="A single owner inbox for inspections, offers, verification events, and agent activity."
        actions={
          <Button variant="outline" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            Mark all as read
          </Button>
        }
      />

      <FilterPills
        value={filter}
        onChange={setFilter}
        options={[
          { label: "All", value: "all" },
          { label: "Inspections", value: "inspections" },
          { label: "Offers", value: "offers" },
          { label: "Agent Activity", value: "agent-activity" },
          { label: "Verification", value: "verification" },
          { label: "General", value: "general" },
        ]}
      />

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card key={notification.id} className="border-border/70 shadow-none">
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={notification.kind.replaceAll("_", " ")} variant="outline" />
                    {!notification.readAt ? <StatusBadge label="Unread" variant="warning" /> : null}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{notification.body}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={getNotificationHref(notification, "OWNER")}>
                    <Button variant="outline">Open detail</Button>
                  </Link>
                  {!notification.readAt ? (
                    <Button variant="outline" onClick={() => markOneMutation.mutate(notification.id)} disabled={markOneMutation.isPending}>
                      Mark as read
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyPanel
            title="No notifications in this view"
            body="You're caught up for the selected category."
          />
        )}
      </div>
    </div>
  );
}

