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

import { NativeSelect, PrototypeNotice, FilterPills } from "./agent-page-primitives";

export function AgentInspectionsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const inspectionsQuery = useQuery({
    queryKey: ["agent-inspections", userId],
    queryFn: () => listAgentInspections(userId),
    enabled: userId > 0,
  });
  const [tab, setTab] = useState<AgentInspectionDecision["status"] | "all">("pending");
  const [calendarView, setCalendarView] = useState(false);

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

  const items = inspectionsQuery.data.filter((item) => (tab === "all" ? true : item.localStatus === tab));
  const groups = items.reduce<Record<string, typeof items>>((accumulator, item) => {
    const key = formatDate(item.requestedAt);
    accumulator[key] = [...(accumulator[key] ?? []), item];
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
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

      <FilterPills
        value={tab}
        onChange={(value) => setTab(value as typeof tab)}
        options={[
          { label: "Pending", value: "pending" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
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
            <Card key={item.key} className="border-border shadow-none">
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.listing?.title ?? "Managed listing"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.applicantName} • {formatDateTime(item.requestedAt)}
                    </p>
                  </div>
                  <StatusBadge label={item.statusLabel} variant={item.localStatus === "confirmed" ? "success" : "secondary"} />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <Textarea
                    rows={3}
                    defaultValue={item.note}
                    placeholder="Add interest level, observations, or a concise visit summary."
                    onBlur={(event) =>
                      decisionMutation.mutate({
                        notificationId: item.notification.id,
                        status: item.localStatus,
                        note: event.target.value,
                        noShow: item.noShow,
                        rescheduleAt: item.rescheduleAt,
                      })
                    }
                  />
                  <div className="space-y-3">
                    <NativeSelect
                      defaultValue={item.localStatus}
                      onChange={(event) =>
                        decisionMutation.mutate({
                          notificationId: item.notification.id,
                          status: event.target.value as AgentInspectionDecision["status"],
                          note: item.note,
                          noShow: item.noShow,
                          rescheduleAt: item.rescheduleAt,
                        })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </NativeSelect>
                    <Input
                      type="datetime-local"
                      defaultValue={item.rescheduleAt}
                      onBlur={(event) =>
                        decisionMutation.mutate({
                          notificationId: item.notification.id,
                          status: item.localStatus,
                          note: item.note,
                          noShow: item.noShow,
                          rescheduleAt: event.target.value,
                        })
                      }
                    />
                    <Button
                    variant={item.noShow ? "primary" : "outline"}
                      className="w-full"
                      onClick={() =>
                        decisionMutation.mutate({
                          notificationId: item.notification.id,
                          status: item.localStatus,
                          note: item.note,
                          noShow: !item.noShow,
                          rescheduleAt: item.rescheduleAt,
                        })
                      }
                    >
                      {item.noShow ? "No-show tracked" : "Track no-show"}
                    </Button>
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

