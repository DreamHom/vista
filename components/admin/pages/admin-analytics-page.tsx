"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, ShieldAlert } from "lucide-react";
import {
  approveListing,
  approveVerification,
  clearAdminCommentFlag,
  DEFAULT_ADMIN_ADS_STATE,
  DEFAULT_ADMIN_PLATFORM_SETTINGS,
  deleteComment,
  dismissListingReport,
  getAdminAnalyticsWorkspace,
  getAdminDashboardOverview,
  listAdminAuditLogs,
  listAdminListings,
  listAdminModerationComments,
  listAdminReports,
  listAdminUsers,
  listAdminVerifications,
  readAdminAdsState,
  readAdminPlatformSettings,
  reactivateUser,
  rejectVerification,
  resolveListingReport,
  saveAdminAdsState,
  saveAdminPlatformSettings,
  suspendUser,
  takeDownListing,
  type VerificationQueueType,
} from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel, MetricCard, SectionCard, SettingsToggle, StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatDate, formatDateTime } from "@/components/dashboard/utils";
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
export function AdminAnalyticsPage() {
  const query = useQuery({
    queryKey: ["admin-analytics-workspace"],
    queryFn: getAdminAnalyticsWorkspace,
  });

  if (query.isLoading) return <LoadingPanel label="Loading analytics..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load analytics right now." onRetry={() => void query.refetch()} />;
  }

  const { summary, agentPerformance, hotspots, priceTrends } = query.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Analytics"
        description="Platform growth, supply activity, agent performance, and location-level inventory signals."
      />

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="User growth baseline" value={String(summary.totalUsers)} hint="Current registered user count." />
        <MetricCard label="Listing volume" value={String(summary.openListings)} hint="Live public inventory." />
        <MetricCard label="Inspection volume" value={String(summary.pendingOffers + summary.pendingVerifications)} hint="Current operations proxy until dedicated inspection metrics land." />
        <MetricCard label="Deal close rate" value={`${Math.round((summary.closedListings / Math.max(1, summary.openListings + summary.closedListings)) * 100)}%`} hint="Closed listings as a share of current+closed supply." />
        <MetricCard label="Pending offers" value={String(summary.pendingOffers)} hint="Negotiations waiting for response." />
        <MetricCard label="Suspended users" value={String(summary.suspendedUsers)} hint="Users currently blocked by admin action." tone="accent" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Agent performance" description="Ranked by deals closed, response quality, and public rating.">
          <div className="space-y-3">
            {agentPerformance.length === 0 ? (
              <EmptyPanel title="No agent performance rows yet" body="Agents will appear here once user and review data are available." />
            ) : (
              agentPerformance.map((agent) => (
                <div key={agent.id} className="grid gap-3 border border-border bg-white px-4 py-4 sm:grid-cols-[minmax(0,1fr)_120px_120px_100px]">
                  <div>
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{agent.reviewCount} reviews</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Deals</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{agent.dealsClosed}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Response rate</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{Math.round(agent.responseRate)}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Rating</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{agent.rating.toFixed(1)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Property hotspots" description="Most active locations, prepared for a future map layer.">
          <div className="grid gap-3 sm:grid-cols-2">
            {hotspots.map((spot) => (
              <div key={spot.location} className="border border-border bg-white px-4 py-4">
                <p className="text-sm font-medium text-foreground">{spot.location}</p>
                <p className="mt-1 text-sm text-muted-foreground">{spot.listings} active listings</p>
                <p className="mt-3 text-base font-semibold text-foreground">Avg. {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(spot.averagePrice)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Price trends per location" description="Location-level supply averages from the live listing feed.">
        <div className="space-y-3">
          {priceTrends.map((trend) => (
            <div key={trend.location} className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_140px] sm:items-center">
              <p className="text-sm font-medium text-foreground">{trend.location}</p>
              <div className="h-3 bg-secondary">
                <div className="h-3 bg-primary" style={{ width: `${Math.max(8, trend.averagePrice / 250000)}px` }} />
              </div>
              <p className="text-sm text-muted-foreground">
                {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(trend.averagePrice)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
