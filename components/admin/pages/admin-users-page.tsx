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
import { NativeSelect } from "./admin-page-primitives";

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"all" | "OWNER" | "AGENT" | "APPLICANT" | "ADMIN">("all");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const usersQuery = useQuery({
    queryKey: ["admin-users", email, role, status],
    queryFn: () =>
      listAdminUsers({
        email: email || undefined,
        role: role === "all" ? undefined : role,
        suspended: status === "all" ? undefined : status === "suspended",
      }),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) => suspendUser(userId, reason),
    onSuccess: async () => {
      toast.success("User suspended.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("We couldn't suspend that user."),
  });

  const reactivateMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) => reactivateUser(userId, reason),
    onSuccess: async () => {
      toast.success("User reactivated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("We couldn't reactivate that user."),
  });

  if (usersQuery.isLoading) return <LoadingPanel label="Loading user management..." />;
  if (usersQuery.isError || !usersQuery.data) {
    return <ErrorPanel body="We couldn’t load the user directory right now." onRetry={() => void usersQuery.refetch()} />;
  }

  const items = usersQuery.data.items;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="User management"
        description="Search across roles, inspect trust state, and manage suspended or active accounts."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Search by email" />
        <NativeSelect value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
          <option value="all">All roles</option>
          <option value="OWNER">Owner</option>
          <option value="AGENT">Agent</option>
          <option value="APPLICANT">Applicant</option>
          <option value="ADMIN">Admin</option>
        </NativeSelect>
        <NativeSelect value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </NativeSelect>
      </div>

      {items.length === 0 ? (
        <EmptyPanel title="No users match these filters" body="Try a different role, status, or email search." />
      ) : (
        <div className="space-y-3">
          {items.map((user) => (
            <Card key={user.id} className="border-border shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{user.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {user.email} • {user.role}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.identityVerifiedAt ? <StatusBadge label="Identity verified" variant="success" /> : <StatusBadge label="Unverified" variant="warning" />}
                    {user.suspendedAt ? <StatusBadge label="Suspended" variant="warning" /> : <StatusBadge label="Active" variant="outline" />}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-eyebrow">Join date</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{user.joinedAt ? formatDate(user.joinedAt) : "Unavailable"}</p>
                    </div>
                    <div className="border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-eyebrow">Role</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{user.role}</p>
                    </div>
                    <div className="border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-eyebrow">Verification</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{user.identityVerifiedAt ? "Verified" : "Pending"}</p>
                    </div>
                    <div className="border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-eyebrow">Status</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{user.suspendedAt ? "Suspended" : "Active"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Textarea
                      rows={4}
                      value={reasons[user.id] ?? ""}
                      onChange={(event) =>
                        setReasons((current) => ({
                          ...current,
                          [user.id]: event.target.value,
                        }))
                      }
                      placeholder="Reason for suspension or reactivation"
                    />
                    <div className="grid gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Full activity history</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{user.fullName}</DialogTitle>
                            <DialogDescription>Recent audit events against this user account.</DialogDescription>
                          </DialogHeader>
                          <AdminUserHistory userId={user.id} />
                        </DialogContent>
                      </Dialog>
                      {user.suspendedAt ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>Reactivate</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reactivate {user.fullName}?</DialogTitle>
                              <DialogDescription>This will restore account access and keep the audit trail intact.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  onClick={() =>
                                    reactivateMutation.mutate({
                                      userId: user.id,
                                      reason: reasons[user.id] || "Reactivated after manual review.",
                                    })
                                  }
                                >
                                  Confirm reactivation
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">Suspend</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Suspend {user.fullName}?</DialogTitle>
                              <DialogDescription>This invalidates their active sessions and writes an audit log entry.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  onClick={() =>
                                    suspendMutation.mutate({
                                      userId: user.id,
                                      reason: reasons[user.id] || "Suspended by admin review.",
                                    })
                                  }
                                >
                                  Confirm suspension
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
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

function AdminUserHistory({ userId }: { userId: number }) {
  const historyQuery = useQuery({
    queryKey: ["admin-user-history", userId],
    queryFn: () => listAdminAuditLogs({ targetType: "USER", targetId: userId }),
  });

  if (historyQuery.isLoading) return <LoadingPanel label="Loading user activity history..." />;
  if (historyQuery.isError || !historyQuery.data) {
    return <ErrorPanel body="We couldn’t load the user activity history." onRetry={() => void historyQuery.refetch()} />;
  }

  return historyQuery.data.items.length === 0 ? (
    <EmptyPanel title="No audit events yet" body="This user has not been the subject of tracked admin actions." />
  ) : (
    <div className="space-y-3">
      {historyQuery.data.items.map((entry) => (
        <div key={entry.id} className="border border-border bg-white px-4 py-4">
          <p className="text-sm font-medium text-foreground">{entry.action.replaceAll("_", " ")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{entry.metadata || "No metadata attached."}</p>
          <p className="mt-2 text-xs uppercase tracking-eyebrow text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
