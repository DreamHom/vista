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

import { FieldLabel, FieldHint } from "./agent-page-primitives";

export function AgentProfilePage() {
  const { user, setUser } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["agent-profile-workspace", userId],
    queryFn: () => getAgentProfileWorkspace(userId),
    enabled: userId > 0,
  });
  const [draft, setDraft] = useState(() => readAgentProfileDraft(userId) ?? DEFAULT_AGENT_PROFILE_DRAFT);

  const updateMutation = useMutation({
    mutationFn: (payload: {
      fullName?: string;
      email?: string;
      phone?: string;
      displayName?: string;
      licenseNumber?: string;
      agency?: string;
    }) => updateAgentProfile(payload),
    onSuccess: async (result) => {
      setUser({
        id: result.userId,
        fullName: result.fullName,
        email: result.email,
        role: result.role,
      });
      toast.success("Agent profile basics updated.");
      await queryClient.invalidateQueries({ queryKey: ["agent-profile-workspace", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "We couldn't update your profile."),
  });

  if (profileQuery.isLoading) return <LoadingPanel label="Loading your public profile workspace..." />;
  if (profileQuery.isError || !profileQuery.data) {
    return <ErrorPanel body="We couldn’t load your agent profile right now." onRetry={() => void profileQuery.refetch()} />;
  }

  const { privateProfile, publicProfile, latestCredentialVerification } = profileQuery.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent profile"
        title="Public profile"
        description="Preview how your trust signals appear to owners and applicants, then update the fields that are already wired in Haven."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Public preview" description="Exactly the trust-first summary that prospects see before engaging.">
          <div className="space-y-4 border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground">{publicProfile.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{publicProfile.displayName ?? "No display name set"} • Agent</p>
              </div>
              <div className="space-y-2 text-right">
                <StatusBadge label={publicProfile.agentCredentialVerifiedAt ? "Credentials approved" : "Credentials pending"} variant={publicProfile.agentCredentialVerifiedAt ? "success" : "warning"} />
                <p className="text-sm text-muted-foreground">
                  {publicProfile.averageRating ? `${publicProfile.averageRating.toFixed(1)} average rating` : "No rating yet"}
                </p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="border border-border bg-secondary/40 px-4 py-3">
                <p className="text-xs uppercase tracking-eyebrow">Reviews</p>
                <p className="mt-2 text-base font-semibold text-foreground">{publicProfile.reviewCount}</p>
              </div>
              <div className="border border-border bg-secondary/40 px-4 py-3">
                <p className="text-xs uppercase tracking-eyebrow">Deals</p>
                <p className="mt-2 text-base font-semibold text-foreground">{publicProfile.closedDealCount ?? 0}</p>
              </div>
              <div className="border border-border bg-secondary/40 px-4 py-3">
                <p className="text-xs uppercase tracking-eyebrow">Median response</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {publicProfile.medianResponseMinutes ? `${publicProfile.medianResponseMinutes} min` : "N/A"}
                </p>
              </div>
            </div>
            <div className="border border-dashed border-border px-4 py-4">
              <p className="text-sm font-medium text-foreground">Publicly visible draft-only fields</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bio, specializations, locations, fee structure, and languages are currently held as local prototype fields while Haven only exposes core agent profile settings.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Bio</p>
                  <p className="mt-2 text-sm text-foreground">{draft.bio || "No bio drafted yet."}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Locations</p>
                  <p className="mt-2 text-sm text-foreground">{draft.locations || "No locations drafted yet."}</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Edit profile" description="Core account fields are live; richer marketing copy is staged locally.">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Full name</FieldLabel>
                <Input defaultValue={privateProfile.fullName} id="agent-full-name" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Display name</FieldLabel>
                <Input defaultValue={privateProfile.displayName ?? ""} id="agent-display-name" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Email</FieldLabel>
                <Input defaultValue={privateProfile.email ?? ""} id="agent-email" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Phone</FieldLabel>
                <Input defaultValue={privateProfile.phone ?? ""} id="agent-phone" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>License number</FieldLabel>
                <Input defaultValue={privateProfile.licenseNumber ?? ""} id="agent-license" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Agency</FieldLabel>
                <Input defaultValue={privateProfile.agency ?? ""} id="agent-agency" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Public bio</FieldLabel>
                <Textarea
                  rows={4}
                  value={draft.bio}
                  onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Specializations</FieldLabel>
                <Textarea
                  rows={4}
                  value={draft.specializations}
                  onChange={(event) => setDraft((current) => ({ ...current, specializations: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel>Locations</FieldLabel>
                <Input value={draft.locations} onChange={(event) => setDraft((current) => ({ ...current, locations: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <FieldLabel>Fee structure</FieldLabel>
                <Input value={draft.feeStructure} onChange={(event) => setDraft((current) => ({ ...current, feeStructure: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <FieldLabel>Languages</FieldLabel>
                <Input value={draft.languages} onChange={(event) => setDraft((current) => ({ ...current, languages: event.target.value }))} />
              </div>
            </div>
            <FieldHint>Fields marked as draft-only are stored locally until Haven exposes public marketing attributes for agents.</FieldHint>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={updateMutation.isPending}
                onClick={() => {
                  const readValue = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value ?? "";
                  updateMutation.mutate({
                    fullName: readValue("agent-full-name"),
                    displayName: readValue("agent-display-name"),
                    email: readValue("agent-email"),
                    phone: readValue("agent-phone"),
                    licenseNumber: readValue("agent-license"),
                    agency: readValue("agent-agency"),
                  });
                }}
              >
                {updateMutation.isPending ? "Saving..." : "Update live profile fields"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  saveAgentProfileDraft(userId, draft);
                  toast.success("Draft-only profile fields saved locally.");
                }}
              >
                Save draft-only fields
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Verification status" description="Credential review and trust-state visibility for your public profile.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-border bg-white p-4">
            <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Credentials</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {latestCredentialVerification?.status ?? "Not submitted"}
            </p>
          </div>
          <div className="border border-border bg-white p-4">
            <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Submitted</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {latestCredentialVerification?.submittedAt ? formatDate(latestCredentialVerification.submittedAt) : "No submission"}
            </p>
          </div>
          <div className="border border-border bg-white p-4">
            <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Approved badge</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {publicProfile.agentCredentialVerifiedAt ? "Visible on public profile" : "Pending review"}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

