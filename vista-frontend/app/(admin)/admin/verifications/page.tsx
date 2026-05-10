import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import { verificationQueue } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · verifications" };

export default function VerificationsQueuePage() {
  const counts = {
    owner: verificationQueue.filter((v) => v.track === "owner").length,
    agent: verificationQueue.filter((v) => v.track === "agent").length,
    property: verificationQueue.filter((v) => v.track === "property").length,
    applicant: verificationQueue.filter((v) => v.track === "applicant").length,
  };

  return (
    <>
      <PageHeader
        title="Verification queue"
        description="Strict bar. Approve only when documents and identities match."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active="/admin/verifications"
          items={[
            { href: "/admin/verifications", label: "All", count: verificationQueue.length },
            { href: "/admin/verifications/owners", label: "Owners", count: counts.owner },
            { href: "/admin/verifications/agents", label: "Agents", count: counts.agent },
            { href: "/admin/verifications/properties", label: "Properties", count: counts.property },
          ]}
        />

        <Card>
          <CardHeader
            title={`${verificationQueue.length} pending`}
            description="Oldest first — uphold our SLA."
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {verificationQueue.map((v) => (
                <li key={v.id} className="flex items-center gap-4 p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Icon.Shield size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-fg truncate">{v.subject}</p>
                      <Badge tone="muted">{v.track}</Badge>
                    </div>
                    <p className="text-xs text-fg-muted">
                      {v.documents.join(", ")} · submitted {formatRelativeTime(v.submittedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" leadingIcon={<Icon.Eye size={14} />}>
                      Review
                    </Button>
                    <Button size="sm" leadingIcon={<Icon.Check size={14} />}>
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" leadingIcon={<Icon.X size={14} />}>
                      Reject
                    </Button>
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
