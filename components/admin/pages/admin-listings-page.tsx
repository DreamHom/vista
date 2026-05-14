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
import { FilterPills, PrototypeNotice } from "./admin-page-primitives";

export function AdminListingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const query = useQuery({
    queryKey: ["admin-listings"],
    queryFn: listAdminListings,
  });

  const takedownMutation = useMutation({
    mutationFn: ({ listingId, reason }: { listingId: number; reason: string }) => takeDownListing(listingId, reason),
    onSuccess: async () => {
      toast.success("Listing taken down.");
      await queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
    },
    onError: () => toast.error("We couldn't take down that listing."),
  });

  const approveMutation = useMutation({
    mutationFn: ({ listingId, reason }: { listingId: number; reason: string }) => approveListing(listingId, reason),
    onSuccess: async () => {
      toast.success("Listing approved.");
      await queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
    },
    onError: () => toast.error("We couldn't approve that listing."),
  });

  if (query.isLoading) return <LoadingPanel label="Loading platform listings..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load platform listings right now." onRetry={() => void query.refetch()} />;
  }

  const items = query.data.filter((item) => (statusFilter === "all" ? true : item.status === statusFilter));

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Listings management"
        description="Review live and moderated inventory, grant verified re-publication, or take down problematic listings."
      />

      <FilterPills
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { label: "All", value: "all" },
          { label: "Live", value: "LIVE" },
          { label: "Pending", value: "PAUSED" },
          { label: "Paused", value: "PAUSED" },
          { label: "Taken down", value: "TAKEN_DOWN" },
        ]}
      />

      <PrototypeNotice
        title="Admin-wide listing index is partially stitched today"
        body="Haven exposes moderation actions and public inventory, but not a dedicated admin listing catalog endpoint yet. This view merges live inventory with audit-derived moderation rows so the admin workflow stays complete."
      />

      {items.length === 0 ? (
        <EmptyPanel title="No listings in this filter" body="Try another status filter to inspect a different slice of supply." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={`${item.source}-${item.listingId}`} className="border-border shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge label={item.status} variant={item.status === "LIVE" ? "success" : item.status === "TAKEN_DOWN" ? "warning" : "outline"} />
                    <StatusBadge label={`${item.reportCount} reports`} variant="secondary" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-eyebrow">Owner</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{item.ownerName}</p>
                  </div>
                  <div className="border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-eyebrow">Agent</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{item.agentName}</p>
                  </div>
                  <div className="border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-eyebrow">Created</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-eyebrow">Source</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{item.source}</p>
                  </div>
                </div>
                <Textarea
                  rows={3}
                  value={reasons[item.listingId] ?? ""}
                  onChange={(event) =>
                    setReasons((current) => ({
                      ...current,
                      [item.listingId]: event.target.value,
                    }))
                  }
                  placeholder="Reason for approval or takedown"
                />
                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Approve listing</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve listing #{item.listingId}?</DialogTitle>
                        <DialogDescription>This restores public visibility and writes an audit record.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={() =>
                              approveMutation.mutate({
                                listingId: item.listingId,
                                reason: reasons[item.listingId] || "Approved after admin review.",
                              })
                            }
                          >
                            Confirm approval
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Take down</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Take down listing #{item.listingId}?</DialogTitle>
                        <DialogDescription>This removes the listing from discovery and notifies the owner.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={() =>
                              takedownMutation.mutate({
                                listingId: item.listingId,
                                reason: reasons[item.listingId] || "Taken down after admin review.",
                              })
                            }
                          >
                            Confirm takedown
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {item.source === "inventory" ? (
                    <Link href={`/listings/${item.listingId}`} target="_blank">
                      <Button variant="outline">
                        View detail
                        <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
