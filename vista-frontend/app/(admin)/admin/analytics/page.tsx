import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Admin · analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Platform analytics"
        description="Health of the marketplace at a glance. Charts coming via the haven analytics API."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Active users (30d)" value="12,480" delta="+11% vs last" tone="positive" icon={<Icon.Users size={14} />} />
          <Stat label="New listings (30d)" value="184" delta="+9 this week" tone="positive" icon={<Icon.Building size={14} />} />
          <Stat label="Inspections completed" value="312" icon={<Icon.Calendar size={14} />} />
          <Stat label="Closed deals" value="48" delta="+6 this month" tone="positive" icon={<Icon.Check size={14} />} />
        </div>

        <Card>
          <CardHeader title="Funnel · last 30 days" description="Saved → Inspection requested → Offer in → Closed." />
          <CardBody>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Saved", value: 8420, share: 100 },
                { label: "Inspection requested", value: 1290, share: 15 },
                { label: "Offer submitted", value: 428, share: 5 },
                { label: "Closed", value: 48, share: 0.6 },
              ].map((step) => (
                <div key={step.label} className="rounded-xl border border-border bg-bg-elevated p-4">
                  <p className="text-xs font-medium text-fg-muted">{step.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-fg">
                    {step.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-fg-subtle">{step.share}% of saved</p>
                  <div className="mt-3 h-2 rounded-full bg-bg-sunken overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${step.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top areas by demand" />
          <CardBody>
            <ul className="space-y-3">
              {[
                { area: "Lekki Phase 1", demand: 92 },
                { area: "Maitama, Abuja", demand: 78 },
                { area: "Yaba", demand: 68 },
                { area: "Sangotedo", demand: 54 },
                { area: "Surulere", demand: 41 },
              ].map((row) => (
                <li key={row.area}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-fg">{row.area}</span>
                    <span className="text-fg-muted">{row.demand}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-bg-sunken overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${row.demand}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
