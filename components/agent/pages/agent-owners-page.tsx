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

export function AgentOwnersPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const ownersQuery = useQuery({
    queryKey: ["agent-owners", userId],
    queryFn: () => listAgentOwnerRelationships(userId),
    enabled: userId > 0,
  });
  const [declineReasons, setDeclineReasons] = useState<Record<number, string>>({});
  const [messages, setMessages] = useState<Record<number, string>>({});

  const acceptMutation = useMutation({
    mutationFn: acceptAgentAssignment,
    onSuccess: async () => {
      toast.success("Assignment accepted.");
      await queryClient.invalidateQueries({ queryKey: ["agent-owners", userId] });
      await queryClient.invalidateQueries({ queryKey: ["agent-managed-listings"] });
    },
    onError: () => toast.error("We couldn't accept that invite."),
  });

  const declineMutation = useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: number; reason: string }) => declineAgentAssignment(assignmentId, reason),
    onSuccess: async () => {
      toast.success("Assignment declined.");
      await queryClient.invalidateQueries({ queryKey: ["agent-owners", userId] });
      await queryClient.invalidateQueries({ queryKey: ["agent-managed-listings"] });
    },
    onError: () => toast.error("We couldn't decline that invite."),
  });

  if (ownersQuery.isLoading) return <LoadingPanel label="Loading owner relationships..." />;
  if (ownersQuery.isError || !ownersQuery.data) {
    return <ErrorPanel body="We couldn’t load your owner relationships right now." onRetry={() => void ownersQuery.refetch()} />;
  }

  const items = ownersQuery.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent workspace"
        title="Owner relationships"
        description="Assignment handshakes, managed inventory, and a clean communication record per owner."
      />

      {items.length === 0 ? (
        <EmptyPanel
          title="No owners in your workspace yet"
          body="Accepted and pending owner assignment requests will be grouped here once they arrive."
        />
      ) : (
        <div className="space-y-4">
          {items.map((owner) => (
            <Card key={owner.ownerId} className="border-border shadow-none">
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-foreground">{owner.ownerProfile?.fullName ?? `Owner #${owner.ownerId}`}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {owner.listingsManaged.length} managed listing{owner.listingsManaged.length === 1 ? "" : "s"} •{" "}
                      {owner.pendingInvites.length} pending invite{owner.pendingInvites.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {owner.ownerProfile?.identityVerifiedAt ? <StatusBadge label="Identity verified" variant="success" /> : <StatusBadge label="Verification pending" variant="warning" />}
                    <StatusBadge label={`${owner.ownerProfile?.reviewCount ?? 0} reviews`} variant="outline" />
                  </div>
                </div>

                {owner.pendingInvites.length > 0 ? (
                  <div className="space-y-3 border border-border bg-secondary/40 p-4">
                    <p className="text-sm font-medium text-foreground">Pending assignment requests</p>
                    {owner.pendingInvites.map((invite) => (
                      <div key={invite.assignment.id} className="border border-border bg-white p-4">
                        <p className="text-sm font-medium text-foreground">{invite.listing?.title ?? `Listing #${invite.assignment.listingId}`}</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                          <Input
                            value={declineReasons[invite.assignment.id] ?? ""}
                            onChange={(event) =>
                              setDeclineReasons((current) => ({
                                ...current,
                                [invite.assignment.id]: event.target.value,
                              }))
                            }
                            placeholder="Optional decline reason"
                          />
                          <Button onClick={() => acceptMutation.mutate(invite.assignment.id)}>Accept</Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              declineMutation.mutate({
                                assignmentId: invite.assignment.id,
                                reason: declineReasons[invite.assignment.id] ?? "Not the right fit at the moment.",
                              })
                            }
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Managed listings</p>
                    {owner.listingsManaged.length === 0 ? (
                      <EmptyPanel title="No active listings yet" body="Once an invite is accepted it will show here." />
                    ) : (
                      owner.listingsManaged.map((listing) => (
                        <div key={listing.assignment.id} className="border border-border bg-white px-4 py-4">
                          <p className="text-sm font-medium text-foreground">{listing.listing?.title ?? `Listing #${listing.assignment.listingId}`}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{listing.listing?.address ?? "Address unavailable"}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Communication log</p>
                    {owner.communicationLog.length === 0 ? (
                      <EmptyPanel title="No owner messages yet" body="Store owner-facing summaries, follow-up drafts, and decision notes here." />
                    ) : (
                      owner.communicationLog.map((entry) => (
                        <div key={entry.id} className="border border-border bg-white px-4 py-4">
                          <p className="text-sm text-foreground">{entry.body}</p>
                          <p className="mt-2 text-xs uppercase tracking-eyebrow text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                        </div>
                      ))
                    )}
                    <Textarea
                      rows={3}
                      value={messages[owner.ownerId] ?? ""}
                      onChange={(event) => setMessages((current) => ({ ...current, [owner.ownerId]: event.target.value }))}
                      placeholder="Message owner directly..."
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={async () => {
                          appendAgentOwnerMessage(userId, {
                            ownerId: owner.ownerId,
                            body: messages[owner.ownerId] ?? "",
                          });
                          setMessages((current) => ({ ...current, [owner.ownerId]: "" }));
                          toast.success("Owner message saved locally.");
                          await queryClient.invalidateQueries({ queryKey: ["agent-owners", userId] });
                        }}
                      >
                        Message owner
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

