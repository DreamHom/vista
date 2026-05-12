import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/icons";
import * as Admin from "@/lib/api/admin";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { AdminAnalyticsSummary } from "@/lib/api/types";

export const metadata: Metadata = { title: "Admin · analytics" };

const FALLBACK: AdminAnalyticsSummary = {
  activeUsers30d: 0,
  newListings30d: 0,
  inspectionsCompleted30d: 0,
  closedDeals30d: 0,
  funnel: { saved: 0, inspectionRequested: 0, offerSubmitted: 0, closed: 0 },
  topAreas: [],
};

export default async function AnalyticsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/analytics");

  let summary: AdminAnalyticsSummary = FALLBACK;
  let error: string | null = null;
  try {
    summary = await Admin.adminAnalyticsSummary(token);
  } catch (err) {
    if (err instanceof HavenError && err.status === 403) {
      redirect("/dashboard");
    }
    error = err instanceof Error ? err.message : "Could not load analytics.";
  }

  const funnelTotal = Math.max(summary.funnel.saved, 1);
  const funnelSteps = [
    { label: "Saved", value: summary.funnel.saved },
    { label: "Inspection requested", value: summary.funnel.inspectionRequested },
    { label: "Offer submitted", value: summary.funnel.offerSubmitted },
    { label: "Closed", value: summary.funnel.closed },
  ];
  const maxDemand = Math.max(...summary.topAreas.map((r) => r.demandScore), 1);

  return (
    <>
      <PageHeader
        title="Platform analytics"
        description="Health of the marketplace at a glance."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        {error ? (
          <div className="rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Stat
            label="Active users (30d)"
            value={summary.activeUsers30d.toLocaleString()}
            icon={<Icon.Users size={14} />}
          />
          <Stat
            label="New listings (30d)"
            value={summary.newListings30d.toLocaleString()}
            icon={<Icon.Building size={14} />}
          />
          <Stat
            label="Inspections completed"
            value={summary.inspectionsCompleted30d.toLocaleString()}
            icon={<Icon.Calendar size={14} />}
          />
          <Stat
            label="Closed deals"
            value={summary.closedDeals30d.toLocaleString()}
            icon={<Icon.Check size={14} />}
          />
        </div>

        <Card>
          <CardHeader
            title="Funnel · last 30 days"
            description="Saved → Inspection requested → Offer in → Closed."
          />
          <CardBody>
            <div className="grid gap-4 md:grid-cols-4">
              {funnelSteps.map((step) => {
                const share = (step.value / funnelTotal) * 100;
                return (
                  <div
                    key={step.label}
                    className="rounded-xl border border-border bg-bg-elevated p-4"
                  >
                    <p className="text-xs font-medium text-fg-muted">
                      {step.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-fg">
                      {step.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-fg-subtle">
                      {share.toFixed(1)}% of saved
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-bg-sunken overflow-hidden">
                      <div
                        className="h-full bg-brand"
                        style={{ width: `${Math.min(100, share)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top areas by demand" />
          <CardBody>
            {summary.topAreas.length === 0 ? (
              <p className="text-sm text-fg-muted">
                No demand signals yet. As people search and save, this fills up.
              </p>
            ) : (
              <ul className="space-y-3">
                {summary.topAreas.map((row) => {
                  const pct = (row.demandScore / maxDemand) * 100;
                  return (
                    <li key={row.area}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-fg">{row.area}</span>
                        <span className="text-fg-muted">{row.demandScore}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-bg-sunken overflow-hidden">
                        <div
                          className="h-full bg-brand"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
