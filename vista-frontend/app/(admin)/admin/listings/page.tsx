import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { listings } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Admin · listings" };

export default function AdminListingsPage() {
  const sorted = [...listings].sort((a, b) => b.views - a.views);
  return (
    <>
      <PageHeader
        title="Listing moderation"
        description="Approve, take down, override. Owners and assigned agents are notified."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader title={`${listings.length} listings`} description="Most viewed first." />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-fg-subtle bg-bg-sunken/40">
                  <th className="px-5 py-3 font-medium">Listing</th>
                  <th className="px-5 py-3 font-medium">Verification</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((l) => (
                  <tr key={l.id} className="hover:bg-bg-sunken/40">
                    <td className="px-5 py-4">
                      <p className="font-medium text-fg">{l.title}</p>
                      <p className="text-xs text-fg-muted">{l.area}, {l.city}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {l.ownerVerified ? <VerifiedBadge kind="owner" /> : <Badge tone="muted">Owner unverified</Badge>}
                        {l.documentsVerified ? <VerifiedBadge kind="documents" /> : <Badge tone="warn">Docs pending</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={l.status === "live" ? "success" : "muted"}>{l.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-fg-muted">
                      <Icon.Eye size={11} className="inline mr-1 -mt-0.5" />
                      {l.views.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <Button size="sm" variant="ghost">View</Button>
                        <Button size="sm" variant="outline">Flag</Button>
                        <Button size="sm" variant="ghost">Take down</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
