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
import { FieldLabel, PrototypeNotice } from "./admin-page-primitives";

export function AdminAdsPage() {
  const [state, setState] = useState(() => readAdminAdsState() ?? DEFAULT_ADMIN_ADS_STATE);

  function updateState(next: typeof state) {
    setState(next);
    saveAdminAdsState(next);
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Ads management"
        description="Approve pending promotion requests, monitor active campaigns, and set pricing across ad products."
      />

      <PrototypeNotice
        title="Ads operations are modelled locally for now"
        body="Haven v1.0.1 doesn’t expose ad billing, approval, or delivery endpoints yet. This surface preserves the approval workflow and pricing controls expected by the product."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Pending ad requests" description="Approve or reject incoming promotion requests.">
          {state.pendingRequests.length === 0 ? (
            <EmptyPanel title="No pending requests" body="New agent profile or listing promotion requests will appear here once the commerce flow is wired." />
          ) : (
            <div className="space-y-3">
              {state.pendingRequests.map((request) => (
                <div key={request.id} className="border border-border bg-white px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{request.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.requester} • {request.durationDays} days • {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(request.cost)}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={() =>
                        updateState({
                          ...state,
                          pendingRequests: state.pendingRequests.filter((item) => item.id !== request.id),
                          activePromotions: [
                            {
                              id: request.id,
                              type: request.type,
                              title: request.title,
                              durationDays: request.durationDays,
                              cost: request.cost,
                              status: "ACTIVE",
                              createdAt: request.createdAt,
                              endsAt: new Date(Date.now() + request.durationDays * 24 * 60 * 60 * 1000).toISOString(),
                              views: 0,
                            },
                            ...state.activePromotions,
                          ],
                        })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateState({
                          ...state,
                          pendingRequests: state.pendingRequests.filter((item) => item.id !== request.id),
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Set pricing" description="Configure featured agent and listing costs by duration.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Featured agent cost per day</FieldLabel>
              <Input
                value={String(state.featuredAgentDailyRate)}
                onChange={(event) =>
                  updateState({
                    ...state,
                    featuredAgentDailyRate: Number(event.target.value || 0),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Featured listing cost per day</FieldLabel>
              <Input
                value={String(state.featuredListingDailyRate)}
                onChange={(event) =>
                  updateState({
                    ...state,
                    featuredListingDailyRate: Number(event.target.value || 0),
                  })
                }
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Active promotions" description="Performance metrics for running campaigns.">
        {state.activePromotions.length === 0 ? (
          <EmptyPanel title="No active promotions" body="Approved campaigns will appear here once the ads pipeline is connected." />
        ) : (
          <div className="space-y-3">
            {state.activePromotions.map((promotion) => (
              <div key={promotion.id} className="border border-border bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{promotion.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {promotion.type} • ends {formatDate(promotion.endsAt)}
                    </p>
                  </div>
                  <StatusBadge label={promotion.status} variant="success" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-eyebrow">Views</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{promotion.views}</p>
                  </div>
                  <div className="border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-eyebrow">Duration</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{promotion.durationDays} days</p>
                  </div>
                  <div className="border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-eyebrow">Cost</p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(promotion.cost)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
