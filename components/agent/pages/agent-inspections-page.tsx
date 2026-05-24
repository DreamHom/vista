"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, ExternalLink, Flag, Sparkles } from "lucide-react";
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
import { AgentInspectionRequestCard } from "@/components/agent/agent-inspection-request-card";
import { InspectionSlotCreateDialog } from "@/components/inspection/inspection-slot-create-dialog";

import { InspectionTabFilters } from "@/components/inspection/inspection-tab-filters";
import { PrototypeNotice, FilterPills } from "./agent-page-primitives";

export function AgentInspectionsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const inspectionsQuery = useQuery({
    queryKey: ["agent-inspections", userId],
    queryFn: () => listAgentInspections(userId),
    enabled: userId > 0,
  });
  const managedListingsQuery = useQuery({
    queryKey: ["agent-managed-listings"],
    queryFn: listAgentManagedListings,
    enabled: userId > 0,
  });
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [tab, setTab] = useState<AgentInspectionDecision["status"] | "all">("pending");
  const [calendarView, setCalendarView] = useState(false);

  const slotListingOptions = useMemo(
    () =>
      (managedListingsQuery.data ?? [])
        .filter((item) => item.assignment.status === "ACCEPTED" && item.listing)
        .map((item) => ({
          id: item.assignment.listingId,
          title: item.listing?.title ?? `Listing #${item.assignment.listingId}`,
        })),
    [managedListingsQuery.data],
  );

  const decisionMutation = useMutation({
    mutationFn: async ({
      notificationId,
      status,
      note,
      noShow,
      rescheduleAt,
    }: {
      notificationId: number;
      status: AgentInspectionDecision["status"];
      note: string;
      noShow: boolean;
      rescheduleAt: string;
    }) => {
      saveAgentInspectionDecision(userId, notificationId, {
        status,
        note,
        noShow,
        rescheduleAt,
      });
    },
    onSuccess: async () => {
      toast.success("Inspection note saved locally.");
      await queryClient.invalidateQueries({ queryKey: ["agent-inspections", userId] });
    },
    onError: () => toast.error("We couldn't save that inspection update."),
  });

  if (inspectionsQuery.isLoading) return <LoadingPanel label="Loading inspection activity..." />;
  if (inspectionsQuery.isError || !inspectionsQuery.data) {
    return <ErrorPanel body="We couldn’t load your inspection queue right now." onRetry={() => void inspectionsQuery.refetch()} />;
  }

  const items = inspectionsQuery.data.filter((item) => {
    if (tab === "all") return true;
    if (tab === "cancelled") return item.localStatus === "cancelled" || item.noShow;
    return item.localStatus === tab && !item.noShow;
  });
  const groups = items.reduce<Record<string, typeof items>>((accumulator, item) => {
    const key = formatDate(item.requestedAt);
    accumulator[key] = [...(accumulator[key] ?? []), item];
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
      <InspectionSlotCreateDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        listings={slotListingOptions}
        queryKeysToInvalidate={[["agent-managed-listings"], ["agent-inspections", userId]]}
      />

      <DashboardPageIntro
        eyebrow="Inspection workspace"
        title="Inspections"
        description="Track requests across every managed listing, capture notes, and keep a visible daily plan."
        actions={
          <Button variant="outline" onClick={() => setCalendarView((current) => !current)}>
            <CalendarDays className="mr-2 h-4 w-4" aria-hidden />
            {calendarView ? "List view" : "Calendar view"}
          </Button>
        }
      />

      <PrototypeNotice
        title="Agent confirmation and reschedule actions are staged locally"
        body="The backend exposes agent assignment acceptance, but not inspection decision endpoints yet. Use these controls to keep the workflow visible and synced for design review."
      />

      <SectionCard
        title="Inspection slots"
        description="Publish bookable windows on accepted listings. Same batch flow as owners: pick a date, select 10:00, 11:00, 14:00, publish once."
        action={
          <Button
            type="button"
            onClick={() => setSlotDialogOpen(true)}
            className="shrink-0 gap-2"
            disabled={slotListingOptions.length === 0}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Publish times
          </Button>
        }
      >
        {slotListingOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Accept a listing assignment first. Only accepted listings can receive new inspection slots on Haven.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {slotListingOptions.length} listing{slotListingOptions.length === 1 ? "" : "s"} ready for new times.
          </p>
        )}
      </SectionCard>

      <InspectionTabFilters
        value={tab}
        onChange={(value) => setTab(value as typeof tab)}
        options={[
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Completed", value: "completed" },
          { label: "Declined / no-show", value: "cancelled" },
          { label: "All", value: "all" },
        ]}
      />

      {items.length === 0 ? (
        <EmptyPanel
          title="No inspections in this tab"
          body="Switch tabs or wait for applicants to request inspections on your managed listings."
        />
      ) : calendarView ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(groups).map(([date, group]) => (
            <SectionCard key={date} title={date} description={`${group.length} inspection item${group.length === 1 ? "" : "s"}.`}>
              <div className="space-y-3">
                {group.map((item) => (
                  <div key={item.key} className="border border-border bg-secondary/40 px-4 py-4">
                    <p className="text-sm font-medium text-foreground">{item.listing?.title ?? "Managed listing"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.applicantName}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <AgentInspectionRequestCard
              key={item.key}
              item={item}
              pending={decisionMutation.isPending}
              onSave={(decision) =>
                decisionMutation.mutate({
                  notificationId: item.notification.id,
                  status: decision.status,
                  note: decision.note,
                  noShow: decision.noShow,
                  rescheduleAt: decision.rescheduleAt,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

