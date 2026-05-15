"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardOverview } from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel, MetricCard, SectionCard } from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
import Link from "next/link";
export function AdminDashboardPage() {
  const query = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: getAdminDashboardOverview,
  });

  if (query.isLoading) return <LoadingPanel label="Loading platform health..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load platform-level stats right now." onRetry={() => void query.refetch()} />;
  }

  const overview = query.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Platform dashboard"
        description="A live view of trust, supply, moderation load, and user distribution across DreamHomes."
      />

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Users" value={String(overview.summary.totalUsers)} hint={`Owners ${overview.roleCounts.OWNER}, agents ${overview.roleCounts.AGENT}, applicants ${overview.roleCounts.APPLICANT}.`} />
        <MetricCard label="Active Listings" value={String(overview.summary.openListings)} hint="Publicly visible inventory right now." />
        <MetricCard label="Inspections This Week" value={String(overview.summary.pendingOffers + overview.summary.pendingVerifications)} hint="Current operational pressure proxy until dedicated inspection analytics land." />
        <MetricCard label="Deals Closed" value={String(overview.summary.closedListings)} hint="Listings already closed platform-wide." />
        <MetricCard label="Revenue" value={`₦${(overview.summary.closedListings * 850000).toLocaleString("en-NG")}`} hint="Prototype revenue view derived from closed activity." />
        <MetricCard label="Flagged Content" value={String(overview.alerts.length)} hint="Active alerts needing moderation attention." tone="accent" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Verification queue summary" description="Pending counts per trust queue.">
          <div className="grid gap-3 sm:grid-cols-2">
            {overview.verificationSummary.map((item) => (
              <Link key={item.type} href="/admin/verification" className="border border-border bg-white px-4 py-4 transition-colors hover:bg-secondary">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{item.type.replaceAll("_", " ")}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.count}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Alerts" description="Reported listings, suspended users, and queue risks that need attention.">
          {overview.alerts.length === 0 ? (
            <EmptyPanel title="No active alerts" body="Critical moderation signals will surface here when they appear." />
          ) : (
            <div className="space-y-3">
              {overview.alerts.map((alert) => (
                <Link key={alert.id} href={alert.href} className="block border border-border bg-white px-4 py-4 transition-colors hover:bg-secondary">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.body}</p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Recent platform activity feed" description="Append-only admin actions and trust decisions.">
        <div className="space-y-3">
          {overview.recentActivity.map((entry) => (
            <div key={entry.id} className="border border-border bg-white px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Target {entry.targetType.toLowerCase()} #{entry.targetId}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
