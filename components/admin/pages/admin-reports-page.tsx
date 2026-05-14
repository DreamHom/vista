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
import { FilterPills } from "./admin-page-primitives";

export function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "RESOLVED" | "DISMISSED">("PENDING");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const query = useQuery({
    queryKey: ["admin-reports", statusFilter],
    queryFn: () => listAdminReports({ status: statusFilter === "all" ? undefined : statusFilter }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, note }: { reportId: number; note: string }) => resolveListingReport(reportId, note),
    onSuccess: async () => {
      toast.success("Report resolved.");
      await queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: () => toast.error("We couldn't resolve that report."),
  });

  const dismissMutation = useMutation({
    mutationFn: ({ reportId, note }: { reportId: number; note: string }) => dismissListingReport(reportId, note),
    onSuccess: async () => {
      toast.success("Report dismissed.");
      await queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: () => toast.error("We couldn't dismiss that report."),
  });

  const takedownMutation = useMutation({
    mutationFn: ({ listingId, reason }: { listingId: number; reason: string }) => takeDownListing(listingId, reason),
    onSuccess: async () => {
      toast.success("Listing taken down.");
      await queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
    },
    onError: () => toast.error("We couldn't take down that listing."),
  });

  if (query.isLoading) return <LoadingPanel label="Loading reported listings..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load listing reports right now." onRetry={() => void query.refetch()} />;
  }

  const groupedHistory = query.data.items.reduce<Record<number, number>>((accumulator, report) => {
    accumulator[report.listingId] = (accumulator[report.listingId] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Reported listings"
        description="Review the user-filed report queue, take action, and close the loop with clean notes."
      />

      <FilterPills
        value={statusFilter}
        onChange={(value) => setStatusFilter(value as typeof statusFilter)}
        options={[
          { label: "Pending", value: "PENDING" },
          { label: "Resolved", value: "RESOLVED" },
          { label: "Dismissed", value: "DISMISSED" },
          { label: "All", value: "all" },
        ]}
      />

      {query.data.items.length === 0 ? (
        <EmptyPanel title="No reports in this filter" body="Try a different status filter to inspect report history." />
      ) : (
        <div className="space-y-4">
          {query.data.items.map((report) => (
            <Card key={report.id} className="border-border shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">Listing #{report.listingId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reporter #{report.reporterUserId} • {report.reason.replaceAll("_", " ").toLowerCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge label={report.status} variant={report.status === "PENDING" ? "warning" : "outline"} />
                    <StatusBadge label={`${groupedHistory[report.listingId]} reports`} variant="secondary" />
                  </div>
                </div>
                <p className="text-sm leading-7 text-foreground">{report.details || "No additional description supplied."}</p>
                <Textarea
                  rows={3}
                  value={notes[report.id] ?? report.resolutionNote ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({
                      ...current,
                      [report.id]: event.target.value,
                    }))
                  }
                  placeholder="Resolution note"
                />
                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Take down listing</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Take down listing #{report.listingId}?</DialogTitle>
                        <DialogDescription>The listing will be removed from discovery and this action will be audited.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={() =>
                              takedownMutation.mutate({
                                listingId: report.listingId,
                                reason: notes[report.id] || "Taken down while resolving a report.",
                              })
                            }
                          >
                            Confirm takedown
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() =>
                      dismissMutation.mutate({
                        reportId: report.id,
                        note: notes[report.id] || "Dismissed after admin review.",
                      })
                    }
                  >
                    Dismiss report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      resolveMutation.mutate({
                        reportId: report.id,
                        note: notes[report.id] || "Escalated for further review.",
                      })
                    }
                  >
                    Request review
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
