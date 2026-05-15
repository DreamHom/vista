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

export function AgentReviewsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const query = useQuery({
    queryKey: ["agent-profile-workspace", userId],
    queryFn: () => getAgentProfileWorkspace(userId),
    enabled: userId > 0,
  });

  if (query.isLoading) return <LoadingPanel label="Loading your ratings and reviews..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load your review history right now." onRetry={() => void query.refetch()} />;
  }

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: query.data.reviews.filter((review) => review.rating === rating).length,
  }));

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent workspace"
        title="Ratings & reviews"
        description="Trust signals from owners and applicants, plus a clear view of how your public reputation is trending."
      />

      <SectionCard title="Overall breakdown" description="Five-star distribution from your public review profile.">
        <div className="space-y-3">
          {ratingCounts.map((item) => (
            <div key={item.rating} className="grid items-center gap-3 sm:grid-cols-[80px_minmax(0,1fr)_40px]">
              <p className="text-sm font-medium text-foreground">{item.rating} star</p>
              <div className="h-3 bg-secondary">
                <div className="h-3 bg-primary" style={{ width: `${Math.max(6, item.count * 18)}px` }} />
              </div>
              <p className="text-sm text-muted-foreground">{item.count}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {query.data.reviews.length === 0 ? (
        <EmptyPanel title="No reviews yet" body="Reviews from owners and applicants will appear here as they come in." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {query.data.reviews.map((review) => (
            <Card key={review.id} className="border-border shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{review.reviewerName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.reviewerRole} • Listing #{review.listingId}
                    </p>
                  </div>
                  <StatusBadge label={`${review.rating}/5`} variant={review.rating >= 4 ? "success" : "secondary"} />
                </div>
                <p className="text-sm leading-7 text-foreground">{review.body}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{formatDate(review.date)}</p>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Review flag recorded for moderation follow-up.")}>
                    Flag inappropriate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

