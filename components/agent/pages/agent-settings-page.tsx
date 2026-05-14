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

import { FieldLabel } from "./agent-page-primitives";

export function AgentSettingsPage() {
  const { user, clear, setUser } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["agent-profile-workspace", userId],
    queryFn: () => getAgentProfileWorkspace(userId),
    enabled: userId > 0,
  });
  const [preferences, setPreferences] = useState(() => readAgentNotificationPreferences(userId) ?? DEFAULT_AGENT_NOTIFICATION_PREFERENCES);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailMutation = useMutation({
    mutationFn: (nextEmail: string) => updateAgentProfile({ email: nextEmail }),
    onSuccess: async (result) => {
      setUser({
        id: result.userId,
        fullName: result.fullName,
        email: result.email,
        role: result.role,
      });
      toast.success("Email updated.");
      await queryClient.invalidateQueries({ queryKey: ["agent-profile-workspace", userId] });
    },
    onError: () => toast.error("We couldn't update your email."),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changeAgentPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated. Sign in again on any other active devices.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: () => toast.error("We couldn't update your password."),
  });

  if (profileQuery.isLoading) return <LoadingPanel label="Loading settings..." />;
  if (profileQuery.isError || !profileQuery.data) {
    return <ErrorPanel body="We couldn’t load your settings right now." onRetry={() => void profileQuery.refetch()} />;
  }

  const liveEmail = email || profileQuery.data.privateProfile.email || "";

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent settings"
        title="Settings"
        description="Update your account email, change your password, and control notification preferences."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Account access" description="Change your sign-in email and password.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Email</FieldLabel>
              <Input value={liveEmail} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Button disabled={emailMutation.isPending} onClick={() => emailMutation.mutate(liveEmail)}>
              {emailMutation.isPending ? "Updating..." : "Change email"}
            </Button>

            <div className="grid gap-4 pt-4">
              <div className="space-y-2">
                <FieldLabel>Current password</FieldLabel>
                <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>New password</FieldLabel>
                <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>Confirm new password</FieldLabel>
                <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </div>
              <Button
                variant="outline"
                disabled={passwordMutation.isPending}
                onClick={() => {
                  if (newPassword !== confirmPassword) {
                    toast.error("New password and confirmation do not match.");
                    return;
                  }
                  passwordMutation.mutate();
                }}
              >
                {passwordMutation.isPending ? "Updating..." : "Change password"}
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notification preferences" description="Stored locally until Haven exposes per-agent notification controls.">
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted/15 px-4 py-1 sm:px-5 sm:py-1.5">
            <SettingsToggle
              title="Inspection requests"
              description="Get nudged when new inspection activity lands on your managed listings."
              checked={preferences.inspectionRequests}
              onCheckedChange={(next) => setPreferences((current) => ({ ...current, inspectionRequests: next }))}
            />
            <SettingsToggle
              title="Offer activity"
              description="Receive alerts when offer threads move."
              checked={preferences.offerActivity}
              onCheckedChange={(next) => setPreferences((current) => ({ ...current, offerActivity: next }))}
            />
            <SettingsToggle
              title="Owner activity"
              description="Track assignment handshakes and owner-related workflow updates."
              checked={preferences.ownerActivity}
              onCheckedChange={(next) => setPreferences((current) => ({ ...current, ownerActivity: next }))}
            />
            <SettingsToggle
              title="Verification updates"
              description="Keep credential approval and request outcomes visible."
              checked={preferences.verificationUpdates}
              onCheckedChange={(next) => setPreferences((current) => ({ ...current, verificationUpdates: next }))}
            />
            <SettingsToggle
              title="Email notifications"
              description="Stage email delivery preferences."
              checked={preferences.email}
              onCheckedChange={(next) => setPreferences((current) => ({ ...current, email: next }))}
            />
            <SettingsToggle
              title="In-app notifications"
              description="Keep in-product alerts active."
              checked={preferences.inApp}
              onCheckedChange={(next) => setPreferences((current) => ({ ...current, inApp: next }))}
            />
          </div>
          <div className="mt-3 flex justify-end">
              <Button
                onClick={() => {
                  saveAgentNotificationPreferences(userId, preferences);
                  toast.success("Notification preferences saved locally.");
                }}
              >
                Save preferences
              </Button>
            </div>
        </SectionCard>
      </div>

      <SectionCard title="Delete account" description="This is a destructive action and requires confirmation.">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Delete account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this agent account?</DialogTitle>
              <DialogDescription>
                Account deletion is not exposed in Haven yet. This confirmation keeps the destructive flow visible for the final product.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    toast.error("Delete account is waiting on backend support.");
                    clear();
                  }}
                >
                  Confirm delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SectionCard>
    </div>
  );
}
