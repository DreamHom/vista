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

export function AgentDashboardPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const overviewQuery = useQuery({
    queryKey: ["agent-dashboard-overview", userId],
    queryFn: () => getAgentDashboardOverview(userId),
    enabled: userId > 0,
  });

  if (overviewQuery.isLoading) {
    return <LoadingPanel label="Loading your agent workspace..." />;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <ErrorPanel
        body="We couldn’t load your listings, inspections, and owner requests right now."
        onRetry={() => void overviewQuery.refetch()}
      />
    );
  }

  const overview = overviewQuery.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent workspace"
        title={`${getGreeting()}, ${firstName(user?.fullName)}.`}
        description={`Here’s your board for ${formatDate(new Date().toISOString())}. Stay on top of managed supply, inspection follow-up, and owner-facing work.`}
        actions={
          <>
            <Link href="/agent/inspections">
              <Button>Open inspections</Button>
            </Link>
            <Link href="/agent/offers">
              <Button variant="outline">View offers</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Active Listings" value={String(overview.activeListings)} hint="Accepted assignments you currently manage." />
        <MetricCard label="Inspections Today" value={String(overview.inspectionsToday)} hint="Requests needing attention today." />
        <MetricCard label="Open Offers" value={String(overview.openOffers)} hint="Offer threads across your managed inventory." />
        <MetricCard label="Deals Closed" value={String(overview.dealsClosedThisMonth)} hint="Accepted activity captured this month." />
        <MetricCard label="Response Rate" value={`${overview.responseRate}%`} hint="Decision rate on owner assignment requests." />
        <MetricCard label="Revenue Tracked" value={formatNaira(overview.totalRevenueTracked)} hint="Offer value surfaced in this workspace." tone="accent" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard
          title="Today's inspections"
          description="Inspection requests and follow-ups that need attention first."
          action={
            <Link href="/agent/inspections">
              <Button variant="outline" size="sm">
                Open queue
              </Button>
            </Link>
          }
        >
          {overview.todaysInspections.length === 0 ? (
            <EmptyPanel
              title="No inspections lined up"
              body="New inspection activity will show here once applicants begin requesting slots on your assigned listings."
              ctaLabel="View listings"
              ctaHref="/agent/listings"
            />
          ) : (
            <div className="space-y-3">
              {overview.todaysInspections.map((inspection) => (
                <div key={inspection.key} className="border border-border bg-secondary/40 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inspection.listing?.title ?? "Managed listing"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{inspection.applicantName}</p>
                    </div>
                    <StatusBadge label={inspection.statusLabel} variant={inspection.localStatus === "confirmed" ? "success" : "secondary"} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{formatDateTime(inspection.requestedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Pending owner requests"
          description="Assignment requests waiting for you to accept or decline."
          action={
            <Link href="/agent/owners">
              <Button variant="outline" size="sm">
                Review requests
              </Button>
            </Link>
          }
        >
          {overview.pendingRequests.length === 0 ? (
            <EmptyPanel
              title="No pending assignment invites"
              body="When owners invite you onto listings, they will appear here for a quick accept or decline."
            />
          ) : (
            <div className="space-y-3">
              {overview.pendingRequests.map((request) => (
                <div key={request.assignment.id} className="border border-border bg-white px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{request.listing?.title ?? "Listing assignment"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{request.ownerProfile?.fullName ?? "Owner"} requested your management support.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/agent/owners">
                      <Button size="sm">Respond</Button>
                    </Link>
                    <Link href={`/agent/listings/${request.assignment.listingId}`}>
                      <Button variant="outline" size="sm">
                        Preview listing
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent leads across listings"
        description="Track warmups from comments, inspection requests, and offer signals."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/agent/leads">
              <Button variant="outline" size="sm">
                Open pipeline
              </Button>
            </Link>
            <Link href="/agent/offers">
              <Button variant="outline" size="sm">
                View all offers
              </Button>
            </Link>
          </div>
        }
      >
        {overview.recentLeads.length === 0 ? (
          <EmptyPanel
            title="No leads yet"
            body="Once applicants engage with your managed listings, the earliest signals will show up here so you can decide what to escalate."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {overview.recentLeads.map((lead) => (
              <div key={lead.key} className="border border-border bg-secondary/40 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.applicantName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{lead.listing?.title ?? "Managed listing"}</p>
                  </div>
                  <StatusBadge label={lead.temperature} variant={lead.temperature === "Hot" ? "warning" : lead.temperature === "Warm" ? "secondary" : "outline"} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {lead.lastAction} • {formatDateTime(lead.lastActionAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

