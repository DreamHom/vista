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

export function OwnerAgentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const assignmentsQuery = useQuery({
    queryKey: ["owner-assignments", user?.id],
    queryFn: () => listOwnerAssignments(100),
    enabled: !!user?.id,
  });

  const revokeMutation = useMutation({
    mutationFn: (assignment: AgentListingResponse) => revokeAgentAssignment(assignment.id, "Owner removed this assignment."),
    onSuccess: async () => {
      toast.success("Assignment removed.");
      await queryClient.invalidateQueries({ queryKey: ["owner-assignments", user?.id] });
    },
    onError: () => toast.error("We couldn't remove that assignment."),
  });

  if (assignmentsQuery.isLoading) return <LoadingPanel label="Loading agent assignments..." />;
  if (assignmentsQuery.error) {
    return <ErrorPanel body="We couldn't load agent assignment activity." onRetry={() => assignmentsQuery.refetch()} />;
  }

  const items = assignmentsQuery.data!;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Assignment control"
        title="Agent Management"
        description="See which listings are covered, which invitations are still pending, and when to rotate in a stronger fit."
        actions={
          <Link href="/agents">
            <Button variant="outline">Find a new agent</Button>
          </Link>
        }
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.assignment.id} className="border-border/70 shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{item.listing?.title ?? `Listing #${item.assignment.listingId}`}</p>
                      <StatusBadge label={item.assignment.status} variant={item.assignment.status === "ACCEPTED" ? "success" : "outline"} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.agentProfile?.fullName ?? `Agent #${item.assignment.agentUserId}`} · {item.listing?.location ?? "Listing location"}
                    </p>
                  </div>
                  <StatusBadge label={`Requested ${formatDateTime(item.assignment.requestedAt)}`} variant="outline" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-secondary/40 p-4">
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Assignment state</p>
                    <p className="mt-2 text-sm text-foreground">
                      {item.assignment.decisionReason || "No decision note was attached on this assignment."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-secondary/40 p-4">
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Last activity</p>
                    <p className="mt-2 text-sm text-foreground">
                      {item.assignment.decidedAt ? formatDateTime(item.assignment.decidedAt) : "Waiting on the agent to respond."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {item.assignment.status === "ACCEPTED" ? (
                    <Button variant="outline" onClick={() => revokeMutation.mutate(item.assignment)} disabled={revokeMutation.isPending}>
                      Remove agent from listing
                    </Button>
                  ) : null}
                  <Link href={`/owner/properties/${item.listing?.id ?? item.assignment.listingId}`}>
                    <Button variant="outline">Open listing management</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No assignments yet"
          body="Invite an agent from a property detail page when you want an operator to handle inspections and day-to-day listing movement."
          ctaLabel="Browse agents"
          ctaHref="/agents"
        />
      )}
    </div>
  );
}

