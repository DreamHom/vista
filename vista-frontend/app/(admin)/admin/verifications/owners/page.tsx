import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import { verificationQueue } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · owner verifications" };

const items = verificationQueue.filter((v) => v.track === "owner");

export default function OwnerVerificationsPage() {
  return (
    <>
      <PageHeader title="Owner verifications" description="Identity check: government ID + NIN reference." />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active="/admin/verifications/owners"
          items={[
            { href: "/admin/verifications", label: "All" },
            { href: "/admin/verifications/owners", label: "Owners", count: items.length },
            { href: "/admin/verifications/agents", label: "Agents" },
            { href: "/admin/verifications/properties", label: "Properties" },
          ]}
        />
        <Card>
          <CardHeader title={`${items.length} pending`} />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {items.map((v) => (
                <li key={v.id} className="flex items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg">{v.subject}</p>
                    <p className="text-xs text-fg-muted">
                      {v.documents.join(", ")} · {formatRelativeTime(v.submittedAt)}
                    </p>
                  </div>
                  <Badge tone="warn">pending</Badge>
                  <Button size="sm" leadingIcon={<Icon.Check size={14} />}>Approve</Button>
                  <Button size="sm" variant="ghost" leadingIcon={<Icon.X size={14} />}>Reject</Button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
