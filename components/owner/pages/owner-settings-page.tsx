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

import { FieldLabel } from "./owner-page-primitives";

export function OwnerSettingsPage() {
  const { user, clear } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preferences, setPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);

  const profileQuery = useQuery({
    queryKey: ["owner-profile", user?.id],
    queryFn: () => getOwnerProfileData(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setEmail(profileQuery.data.privateProfile.email ?? "");
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (user) {
      setPreferences(readOwnerNotificationPreferences(user.id));
    }
  }, [user]);

  const emailMutation = useMutation({
    mutationFn: () => updateMyProfileBasics({ email }),
    onSuccess: () => toast.success("Email updated."),
    onError: () => toast.error("We couldn't update your email."),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changeMyPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated. Sign in again on any other devices.");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: () => toast.error("We couldn't change your password."),
  });

  if (profileQuery.isLoading) return <LoadingPanel label="Loading owner settings..." />;
  if (profileQuery.error) {
    return <ErrorPanel body="We couldn't load your settings." onRetry={() => profileQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Account controls"
        title="Settings"
        description="Security, notifications, and the controls you reach for when your owner workspace needs a reset."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard title="Account" description="Update the email address attached to this owner account.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Email</FieldLabel>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Button onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending}>
              {emailMutation.isPending ? "Saving..." : "Save email"}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Change password" description="Use your current password once, then set the new one you want Haven to enforce.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Current password</FieldLabel>
              <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </div>
            <div className="space-y-2">
              <FieldLabel>New password</FieldLabel>
              <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </div>
            <Button onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending || !currentPassword || !newPassword}>
              {passwordMutation.isPending ? "Updating..." : "Change password"}
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Notification preferences" description="These preferences are stored locally until Haven exposes a dedicated owner settings API.">
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted/15 px-4 py-1 sm:px-5 sm:py-1.5">
          <SettingsToggle
            title="Inspection updates"
            description="Important inspection activity and slot movement."
            checked={preferences.inspectionUpdates}
            onCheckedChange={(next) => {
              const updated = { ...preferences, inspectionUpdates: next };
              setPreferences(updated);
              if (user) saveOwnerNotificationPreferences(user.id, updated);
            }}
          />
          <SettingsToggle
            title="Offer updates"
            description="Offer submissions, responses, and counters."
            checked={preferences.offerUpdates}
            onCheckedChange={(next) => {
              const updated = { ...preferences, offerUpdates: next };
              setPreferences(updated);
              if (user) saveOwnerNotificationPreferences(user.id, updated);
            }}
          />
          <SettingsToggle
            title="Platform announcements"
            description="Product and trust-program updates from DreamHomes."
            checked={preferences.platformAnnouncements}
            onCheckedChange={(next) => {
              const updated = { ...preferences, platformAnnouncements: next };
              setPreferences(updated);
              if (user) saveOwnerNotificationPreferences(user.id, updated);
            }}
          />
          <SettingsToggle
            title="Email notifications"
            description="Keep important events mirrored to email once Haven wires owner notification channels."
            checked={preferences.email}
            onCheckedChange={(next) => {
              const updated = { ...preferences, email: next };
              setPreferences(updated);
              if (user) saveOwnerNotificationPreferences(user.id, updated);
            }}
          />
        </div>
      </SectionCard>

      <SectionCard title="Delete account" description="This remains a guarded prototype until Haven ships an explicit owner account deletion endpoint.">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Delete account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                Haven v1.0.1 does not yet expose an owner delete-account endpoint. We can sign you out locally, but not remove the account server-side yet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  clear();
                  toast.message("Signed out locally. Server-side account deletion still needs backend support.");
                }}
              >
                Sign out instead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SectionCard>
    </div>
  );
}
