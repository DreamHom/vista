"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminAnalyticsWorkspace } from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel, MetricCard, SectionCard } from "@/components/dashboard/applicant-ui";

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

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
  const supplyDenominator = Math.max(1, summary.openListings + summary.closedListings);
  const closeRatePct = Math.round((summary.closedListings / supplyDenominator) * 100);
  const maxTrendPrice = Math.max(1, ...priceTrends.map((t) => t.averagePrice));

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Analytics"
        description="Summary metrics from Haven admin analytics, agent rows from public profiles, and location aggregates from the live listing index (no simulated series)."
      />

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="User growth baseline" value={String(summary.totalUsers)} hint="Current registered user count." />
        <MetricCard label="Listing volume" value={String(summary.openListings)} hint="Live public inventory." />
        <MetricCard
          label="Ops queue"
          value={String(summary.pendingOffers + summary.pendingVerifications)}
          hint="Pending offers plus pending verifications from the analytics summary."
        />
        <MetricCard label="Deal close rate" value={`${closeRatePct}%`} hint="Closed listings ÷ (open + closed) from the same summary." />
        <MetricCard label="Pending offers" value={String(summary.pendingOffers)} hint="Negotiations waiting for response." />
        <MetricCard label="Suspended users" value={String(summary.suspendedUsers)} hint="Users currently blocked by admin action." tone="accent" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Agent performance" description="Top agents by closed deals; ratings and response times from public profile DTOs only.">
          <div className="space-y-3">
            {agentPerformance.length === 0 ? (
              <EmptyPanel title="No agent rows" body="No agent accounts were returned for this workspace." />
            ) : (
              agentPerformance.map((agent) => (
                <div
                  key={agent.id}
                  className="grid gap-3 border border-border bg-white px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,5rem)_minmax(0,7rem)_minmax(0,4rem)] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" title={agent.name}>
                      {agent.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{agent.reviewCount} reviews (profile)</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Deals</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{agent.dealsClosed}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Med. response</p>
                    <p className="mt-2 truncate text-base font-semibold text-foreground">
                      {agent.medianResponseMinutes != null ? `${agent.medianResponseMinutes} min` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Rating</p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {agent.rating != null ? agent.rating.toFixed(1) : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Property hotspots" description="Aggregates from the same live listing sample used for discovery (grouped by address tail).">
          {hotspots.length === 0 ? (
            <EmptyPanel title="No hotspot data" body="The listing index returned no rows; check Haven connectivity or inventory." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {hotspots.map((spot) => (
                <div key={spot.location} className="border border-border bg-white px-4 py-4">
                  <p className="line-clamp-2 text-sm font-medium text-foreground" title={spot.location}>
                    {spot.location}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{spot.listings} active listings</p>
                  <p className="mt-3 text-base font-semibold text-foreground">Avg. {ngn.format(spot.averagePrice)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Price trends per location" description="Relative average price by location from the same listing sample (bar width is proportional within this list only).">
        {priceTrends.length === 0 ? (
          <EmptyPanel title="No price trend rows" body="Need at least one listing with a location grouping to chart averages." />
        ) : (
          <div className="space-y-4">
            {priceTrends.map((trend) => (
              <div
                key={trend.location}
                className="grid gap-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
              >
                <p className="min-w-0 truncate text-sm font-medium text-foreground" title={trend.location}>
                  {trend.location}
                </p>
                <div className="min-w-0 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-3 max-w-full rounded-full bg-primary"
                    style={{ width: `${(trend.averagePrice / maxTrendPrice) * 100}%` }}
                  />
                </div>
                <p className="shrink-0 text-sm tabular-nums text-muted-foreground">{ngn.format(trend.averagePrice)}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
