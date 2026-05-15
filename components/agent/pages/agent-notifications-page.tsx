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

import { FilterPills } from "./agent-page-primitives";

export function AgentNotificationsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AgentNotificationFilter>("all");
  const notificationsQuery = useQuery({
    queryKey: ["agent-notifications", filter, userId],
    queryFn: () => listAgentNotifications(filter),
    enabled: userId > 0,
  });

  const markOneMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["agent-notifications"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "We couldn't mark that notification as read."),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async (result) => {
      toast.success(`${result.marked} notification${result.marked === 1 ? "" : "s"} marked as read.`);
      await queryClient.invalidateQueries({ queryKey: ["agent-notifications"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "We couldn't mark everything as read."),
  });

  if (notificationsQuery.isLoading) return <LoadingPanel label="Loading notifications..." />;
  if (notificationsQuery.isError || !notificationsQuery.data) {
    return <ErrorPanel body="We couldn’t load your notification inbox right now." onRetry={() => void notificationsQuery.refetch()} />;
  }

  const items = notificationsQuery.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent inbox"
        title="Notifications"
        description="Filter by inspections, offers, owner activity, verification, and general platform updates."
        actions={
          <Button variant="outline" onClick={() => markAllMutation.mutate()}>
            Mark all read
          </Button>
        }
      />

      <FilterPills
        value={filter}
        onChange={(value) => setFilter(value as AgentNotificationFilter)}
        options={[
          { label: "All", value: "all" },
          { label: "Inspection Requests", value: "inspection" },
          { label: "Offers", value: "offer" },
          { label: "Owner Activity", value: "owner" },
          { label: "Verification", value: "verification" },
          { label: "General", value: "general" },
        ]}
      />

      {items.length === 0 ? (
        <EmptyPanel title="No notifications in this filter" body="Try a different filter or wait for the next platform event to land in your inbox." />
      ) : (
        <div className="space-y-3">
          {items.map((notification) => (
            <div key={notification.id} className="border border-border bg-white px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{notification.kind.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.body ?? "A new platform event is available."}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!notification.readAt ? <StatusBadge label="Unread" variant="warning" /> : <StatusBadge label="Read" variant="outline" />}
                  {!notification.readAt ? (
                    <Button variant="outline" size="sm" onClick={() => markOneMutation.mutate(notification.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-eyebrow text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

