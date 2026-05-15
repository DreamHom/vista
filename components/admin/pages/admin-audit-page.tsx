"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { listAdminAuditLogs } from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel } from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "./admin-page-primitives";

export function AdminAuditPage() {
  const [actorId, setActorId] = useState("");
  const [action, setAction] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const query = useQuery({
    queryKey: ["admin-audit", actorId, action, from, to],
    queryFn: () =>
      listAdminAuditLogs({
        actorId: actorId ? Number(actorId) : undefined,
        action:
          action === "all"
            ? undefined
            : (action as
                | "VERIFICATION_APPROVED"
                | "VERIFICATION_REJECTED"
                | "LISTING_APPROVED"
                | "LISTING_TAKEDOWN"
                | "USER_SUSPENDED"
                | "USER_REACTIVATED"
                | "REVIEW_TAKEDOWN"),
        from: from || undefined,
        to: to || undefined,
      }),
  });

  function exportCsv() {
    const rows = query.data?.items ?? [];
    const csv = [
      ["id", "adminId", "action", "targetType", "targetId", "metadata", "createdAt"].join(","),
      ...rows.map((entry) =>
        [entry.id, entry.adminId, entry.action, entry.targetType, entry.targetId, JSON.stringify(entry.metadata ?? ""), entry.createdAt].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dreamhomes-admin-audit.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (query.isLoading) return <LoadingPanel label="Loading audit log..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load the audit log right now." onRetry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Audit log"
        description="Every admin write path flows into this append-only activity stream."
        actions={
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Input value={actorId} onChange={(event) => setActorId(event.target.value)} placeholder="Admin ID" />
        <NativeSelect value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="all">All actions</option>
          <option value="VERIFICATION_APPROVED">Verification approved</option>
          <option value="VERIFICATION_REJECTED">Verification rejected</option>
          <option value="LISTING_APPROVED">Listing approved</option>
          <option value="LISTING_TAKEDOWN">Listing takedown</option>
          <option value="USER_SUSPENDED">User suspended</option>
          <option value="USER_REACTIVATED">User reactivated</option>
          <option value="REVIEW_TAKEDOWN">Review takedown</option>
        </NativeSelect>
        <Input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} />
        <Input type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} />
      </div>

      {query.data.items.length === 0 ? (
        <EmptyPanel title="No audit rows match these filters" body="Adjust the admin, action, or date range filters to inspect another slice of history." />
      ) : (
        <div className="space-y-3">
          {query.data.items.map((entry) => (
            <div key={entry.id} className="border border-border bg-white px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Admin #{entry.adminId} • {entry.targetType.toLowerCase()} #{entry.targetId}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{entry.metadata || "No metadata attached."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
