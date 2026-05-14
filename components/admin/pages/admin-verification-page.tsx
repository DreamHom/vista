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

export function AdminVerificationPage() {
  const queryClient = useQueryClient();
  const [queueType, setQueueType] = useState<VerificationQueueType>("OWNER_IDENTITY");
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const query = useQuery({
    queryKey: ["admin-verifications", queueType, status],
    queryFn: () => listAdminVerifications({ type: queueType, status }),
  });

  const approveMutation = useMutation({
    mutationFn: approveVerification,
    onSuccess: async () => {
      toast.success("Verification approved.");
      await queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
    },
    onError: () => toast.error("We couldn't approve that submission."),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectVerification(id, reason),
    onSuccess: async () => {
      toast.success("Verification rejected.");
      await queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
    },
    onError: () => toast.error("We couldn't reject that submission."),
  });

  if (query.isLoading) return <LoadingPanel label="Loading verification queues..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load verification submissions right now." onRetry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Trust operations"
        title="Verification queues"
        description="Process owner identity, property documents, and agent credentials from one workspace."
      />

      <div className="space-y-4">
        <FilterPills
          value={queueType}
          onChange={(value) => setQueueType(value as VerificationQueueType)}
          options={[
            { label: "Owner Identity", value: "OWNER_IDENTITY" },
            { label: "Property Documents", value: "PROPERTY_DOCUMENTS" },
            { label: "Agent Credentials", value: "AGENT_CREDENTIALS" },
            { label: "Applicant Identity", value: "APPLICANT_IDENTITY" },
          ]}
        />
        <FilterPills
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={[
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Rejected", value: "REJECTED" },
          ]}
        />
      </div>

      {query.data.items.length === 0 ? (
        <EmptyPanel title="No submissions in this queue" body="Switch queue or status filters to inspect a different moderation workload." />
      ) : (
        <div className="space-y-4">
          {query.data.items.map((item) => (
            <Card key={item.id} className="border-border shadow-none">
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.type.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submitter #{item.submitterUserId} • {formatDateTime(item.submittedAt)}
                    </p>
                  </div>
                  <StatusBadge label={item.status} variant={item.status === "APPROVED" ? "success" : item.status === "REJECTED" ? "warning" : "secondary"} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                  <div className="space-y-3">
                    <div className="border border-border bg-secondary/40 px-4 py-4">
                      <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Submission detail</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">{item.documentRefs || "Document metadata is not attached in this payload."}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="border border-border bg-white px-4 py-4">
                        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Target user</p>
                        <p className="mt-2 text-base font-semibold text-foreground">{item.targetUserId ?? "N/A"}</p>
                      </div>
                      <div className="border border-border bg-white px-4 py-4">
                        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Target property</p>
                        <p className="mt-2 text-base font-semibold text-foreground">{item.targetPropertyId ?? "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      rows={5}
                      value={reasons[item.id] ?? item.decisionReason ?? ""}
                      onChange={(event) =>
                        setReasons((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      placeholder="Reject reason or more-info note"
                    />
                    <div className="grid gap-2">
                      <Button disabled={item.status !== "PENDING"} onClick={() => approveMutation.mutate(item.id)}>
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        disabled={item.status !== "PENDING"}
                        onClick={() =>
                          rejectMutation.mutate({
                            id: item.id,
                            reason: reasons[item.id] || "Please review and resubmit with complete information.",
                          })
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        disabled={item.status !== "PENDING"}
                        onClick={() => toast.success("Request-more-info flow staged for the next backend iteration.")}
                      >
                        Request more info
                      </Button>
                    </div>
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
