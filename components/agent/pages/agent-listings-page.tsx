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

import { AgentAssignmentInviteCard } from "@/components/assignments/agent-assignment-invite-card";
import { AssignmentStatusBadge } from "@/components/assignments/assignment-status-badge";
import { agentCanRespondToInvite } from "@/lib/assignment-lifecycle";

import { NativeSelect, FilterPills, ListingThumbnail, listingImage } from "./agent-page-primitives";

export function AgentListingsPage() {
  const query = useQuery({
    queryKey: ["agent-managed-listings"],
    queryFn: listAgentManagedListings,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  if (query.isLoading) return <LoadingPanel label="Loading your managed listings..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load the listings assigned to you right now." onRetry={() => void query.refetch()} />;
  }

  const owners = [...new Set(query.data.map((item) => item.ownerProfile?.fullName).filter(Boolean))] as string[];
  const items = query.data.filter((item) => {
    const statusMatch = statusFilter === "all" ? true : item.assignment.status === statusFilter;
    const ownerMatch = ownerFilter === "all" ? true : (item.ownerProfile?.fullName ?? "Unknown owner") === ownerFilter;
    return statusMatch && ownerMatch;
  });

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent workspace"
        title="My listings"
        description="Everything you actively manage, plus owner invites waiting for response."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <FilterPills
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "All", value: "all" },
            { label: "Requested", value: "REQUESTED" },
            { label: "Accepted", value: "ACCEPTED" },
            { label: "Declined", value: "DECLINED" },
            { label: "Revoked", value: "REVOKED" },
          ]}
        />
        <NativeSelect value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
          <option value="all">All owners</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </NativeSelect>
      </div>

      {items.length === 0 ? (
        <EmptyPanel
          title="No listings in this filter"
          body="Switch your owner or status filter to see active assignments and invites."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Card key={item.assignment.id} className="overflow-hidden border-border shadow-none">
              <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="relative h-52 bg-secondary md:h-full">
                  <ListingThumbnail
                    url={listingImage(item.listing?.photos?.[0]?.url)}
                    alt={item.listing?.title ?? "Listing photo"}
                  />
                </div>
                <CardContent className="space-y-5 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <AssignmentStatusBadge status={item.assignment.status} />
                        {item.listing ? <StatusBadge label={item.listing.status} variant="outline" /> : null}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                        {item.listing?.title ?? `Listing #${item.assignment.listingId}`}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.listing?.address ?? "Listing detail currently unavailable."}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Owner: {item.ownerProfile?.fullName ?? item.listing?.owner?.name ?? "Unavailable"}</p>
                    </div>
                    {item.listing ? <p className="text-lg font-semibold text-foreground">{formatNaira(item.listing.priceNgn)}</p> : null}
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                    <div className="border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-eyebrow">Inspections</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{item.inspectionRequestCount}</p>
                    </div>
                    <div className="border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-eyebrow">Offers</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{item.offerActivityCount}</p>
                    </div>
                    <div className="border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-eyebrow">Leads</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{item.leadCount}</p>
                    </div>
                  </div>

                  {agentCanRespondToInvite(item.assignment.status) ? (
                    <AgentAssignmentInviteCard
                      assignmentId={item.assignment.id}
                      listingTitle={item.listing?.title ?? `Listing #${item.assignment.listingId}`}
                      ownerName={item.ownerProfile?.fullName ?? item.listing?.owner?.name}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/agent/listings/${item.assignment.listingId}`}>
                        <Button>View workspace</Button>
                      </Link>
                      {item.assignment.status === "ACCEPTED" ? (
                        <>
                          <Link href="/agent/inspections">
                            <Button variant="outline">Inspections</Button>
                          </Link>
                          <Link href="/agent/leads">
                            <Button variant="outline">Leads</Button>
                          </Link>
                        </>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

