import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import {
  listings,
  agents,
  applicants,
  owners,
  verificationQueue,
  auditLog,
} from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin overview" };

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        title="Admin · ops control"
        description="Verification queues, content moderation, platform health."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Live listings" value={`${listings.length}`} icon={<Icon.Building size={14} />} />
          <Stat label="Verified agents" value={`${agents.filter((a) => a.verified).length}`} icon={<Icon.ShieldCheck size={14} />} />
          <Stat label="Owners" value={`${owners.length}`} icon={<Icon.Users size={14} />} />
          <Stat label="Applicants" value={`${applicants.length}`} icon={<Icon.Heart size={14} />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Verification queue"
              description="Owners, agents, properties, applicants. Newest first."
              action={
                <Link
                  href="/admin/verifications"
                  className="text-sm font-medium text-brand hover:text-brand-hover"
                >
                  Open queue
                </Link>
              }
            />
            <CardBody className="p-0">
              <ul className="divide-y divide-border">
                {verificationQueue.map((v) => (
                  <li key={v.id} className="flex items-center gap-4 p-5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Icon.Shield size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-fg truncate">{v.subject}</p>
                      <p className="text-xs text-fg-muted">
                        {v.track} · {v.documents.join(", ")}
                      </p>
                    </div>
                    <Badge tone="warn">{v.status}</Badge>
                    <span className="text-xs text-fg-subtle">
                      {formatRelativeTime(v.submittedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent admin actions" />
            <CardBody className="space-y-4">
              {auditLog.slice(0, 6).map((a) => (
                <div key={a.id} className="rounded-xl border border-border p-3">
                  <p className="text-xs font-mono text-fg-subtle">{a.action}</p>
                  <p className="mt-1 text-sm font-medium text-fg">{a.target}</p>
                  {a.meta && (
                    <p className="mt-0.5 text-xs text-fg-muted">{a.meta}</p>
                  )}
                  <p className="mt-1 text-[11px] text-fg-subtle">
                    {a.actor} · {formatRelativeTime(a.at)}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
