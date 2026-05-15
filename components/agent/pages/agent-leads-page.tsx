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

import { NativeSelect, PrototypeNotice } from "./agent-page-primitives";

export function AgentLeadsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const leadsQuery = useQuery({
    queryKey: ["agent-leads", userId],
    queryFn: () => listAgentLeads(userId),
    enabled: userId > 0,
  });
  const [view, setView] = useState<"list" | "kanban">("kanban");

  const leadMutation = useMutation({
    mutationFn: async ({
      leadKey,
      stage,
      shortlisted,
      suspicious,
    }: {
      leadKey: string;
      stage: PipelineStage;
      shortlisted: boolean;
      suspicious: boolean;
    }) => {
      saveAgentLeadState(userId, leadKey, { stage, shortlisted, suspicious });
    },
    onSuccess: async () => {
      toast.success("Lead state updated.");
      await queryClient.invalidateQueries({ queryKey: ["agent-leads", userId] });
    },
    onError: () => toast.error("We couldn't update that lead right now."),
  });

  if (leadsQuery.isLoading) return <LoadingPanel label="Loading your pipeline..." />;
  if (leadsQuery.isError || !leadsQuery.data) {
    return <ErrorPanel body="We couldn’t load the lead pipeline right now." onRetry={() => void leadsQuery.refetch()} />;
  }

  const items = leadsQuery.data;
  const stages: PipelineStage[] = ["COLD", "WARM", "HOT", "OFFER_SUBMITTED", "DEAL_CLOSED"];

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent workspace"
        title="Leads & pipeline"
        description="Monitor every buyer or renter signal across your assigned inventory, then decide what gets surfaced to owners."
        actions={
          <Button variant="outline" onClick={() => setView((current) => (current === "kanban" ? "list" : "kanban"))}>
            {view === "kanban" ? "List view" : "Kanban view"}
          </Button>
        }
      />

      <PrototypeNotice
        title="Contact detail access remains intentionally narrow"
        body="Haven keeps applicant contact detail behind secure workflow steps today. This pipeline focuses on lead quality, last action, and owner-ready notes."
      />

      {items.length === 0 ? (
        <EmptyPanel title="No lead activity yet" body="The first inspection request, comment, or offer signal on your managed listings will appear here." />
      ) : view === "list" ? (
        <div className="space-y-4">
          {items.map((lead) => (
            <Card key={lead.key} className="border-border shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{lead.applicantName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{lead.listing?.title ?? "Managed listing"}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge label={lead.temperature} variant={lead.temperature === "Hot" ? "warning" : "outline"} />
                    <StatusBadge label={lead.stage.replaceAll("_", " ")} variant="secondary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {lead.lastAction} • {formatDateTime(lead.lastActionAt)}
                </p>
                <p className="text-sm text-muted-foreground">{lead.contactDetails}</p>
                <div className="flex flex-wrap gap-3">
                  <NativeSelect
                    defaultValue={lead.stage}
                    onChange={(event) =>
                      leadMutation.mutate({
                        leadKey: lead.key,
                        stage: event.target.value as PipelineStage,
                        shortlisted: lead.shortlisted,
                        suspicious: lead.suspicious,
                      })
                    }
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replaceAll("_", " ")}
                      </option>
                    ))}
                  </NativeSelect>
                  <Button
                    variant={lead.shortlisted ? "primary" : "outline"}
                    onClick={() =>
                      leadMutation.mutate({
                        leadKey: lead.key,
                        stage: lead.stage,
                        shortlisted: !lead.shortlisted,
                        suspicious: lead.suspicious,
                      })
                    }
                  >
                    Shortlist & present
                  </Button>
                  <Button
                    variant={lead.suspicious ? "primary" : "outline"}
                    onClick={() =>
                      leadMutation.mutate({
                        leadKey: lead.key,
                        stage: lead.stage,
                        shortlisted: lead.shortlisted,
                        suspicious: !lead.suspicious,
                      })
                    }
                  >
                    <Flag className="mr-2 h-4 w-4" aria-hidden />
                    Flag suspicious applicant
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-5">
          {stages.map((stage) => (
            <div key={stage} className="space-y-3 border border-border bg-white p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{stage.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs uppercase tracking-eyebrow text-muted-foreground">
                  {items.filter((item) => item.stage === stage).length} leads
                </p>
              </div>
              <div className="space-y-3">
                {items
                  .filter((item) => item.stage === stage)
                  .map((lead) => (
                    <div key={lead.key} className="border border-border bg-secondary/40 px-3 py-3">
                      <p className="text-sm font-medium text-foreground">{lead.applicantName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.listing?.title ?? "Managed listing"}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

