import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";
import * as Listings from "@/lib/api/listings";
import * as Verification from "@/lib/api/verification";
import * as Admin from "@/lib/api/admin";
import { HavenError } from "@/lib/api/http";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin");

  let liveListings = 0;
  let pendingVerifications = 0;
  let summary: Awaited<ReturnType<typeof Admin.adminAnalyticsSummary>> | null = null;
  let queue: Awaited<ReturnType<typeof Verification.adminListVerifications>> = [];
  let err: string | null = null;

  try {
    const [page, ownerVer, agentVer, propertyVer, applicantVer, analytics] = await Promise.all([
      Listings.listListings({ page: 0, size: 200 }),
      Verification.adminListVerifications(token, "OWNER_IDENTITY"),
      Verification.adminListVerifications(token, "AGENT_CREDENTIALS"),
      Verification.adminListVerifications(token, "PROPERTY_DOCUMENTS"),
      Verification.adminListVerifications(token, "APPLICANT_IDENTITY"),
      Admin.adminAnalyticsSummary(token),
    ]);
    liveListings = page.content.filter((l) => l.status === "LIVE").length;
    queue = [...ownerVer, ...agentVer, ...propertyVer, ...applicantVer];
    summary = analytics;
    pendingVerifications = queue.filter((v) => v.status === "PENDING").length;
  } catch (e) {
    if (e instanceof HavenError && e.status === 403) redirect("/dashboard");
    err = e instanceof Error ? e.message : "Could not load admin data.";
  }

  const preview = queue.filter((v) => v.status === "PENDING").slice(0, 6);
  const funnel = summary?.funnel;

  return (
    <>
      <PageHeader
        title="Admin · ops control"
        description="Verification queues, content moderation, platform health."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        {err ? (
          <p className="text-sm text-danger">{err}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Live listings" value={`${liveListings}`} icon={<Icon.Building size={14} />} />
          <Stat
            label="Pending verifications"
            value={`${pendingVerifications}`}
            icon={<Icon.ShieldCheck size={14} />}
          />
          <Stat
            label="Active users (30d)"
            value={summary ? `${summary.activeUsers30d}` : "—"}
            icon={<Icon.Users size={14} />}
          />
          <Stat
            label="New listings (30d)"
            value={summary ? `${summary.newListings30d}` : "—"}
            icon={<Icon.Heart size={14} />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Verification queue"
              description="Owners, agents, properties, applicants."
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
              {preview.length === 0 ? (
                <p className="p-5 text-sm text-fg-muted">No pending items.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {preview.map((v) => (
                    <li key={v.id} className="flex items-center gap-4 p-5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                        <Icon.Shield size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-fg truncate">
                          {v.subject ?? v.submittedByName ?? v.submittedBy}
                        </p>
                        <p className="text-xs text-fg-muted">
                          {v.track} · {v.documents.map((d) => d.name).join(", ") || "Documents"}
                        </p>
                      </div>
                      <Badge tone="warn">{v.status}</Badge>
                      <span className="text-xs text-fg-subtle">
                        {formatRelativeTime(v.submittedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Funnel (30d)" />
            <CardBody className="space-y-3 text-sm text-fg-muted">
              {summary ? (
                <>
                  <p>Saved: {funnel?.saved ?? 0}</p>
                  <p>Inspection requested: {funnel?.inspectionRequested ?? 0}</p>
                  <p>Offer submitted: {funnel?.offerSubmitted ?? 0}</p>
                  <p>Closed: {funnel?.closed ?? 0}</p>
                </>
              ) : (
                <p>Analytics unavailable.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
