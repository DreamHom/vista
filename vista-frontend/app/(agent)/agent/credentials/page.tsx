import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Agent · credentials" };

const tracks = [
  {
    title: "Real estate license",
    status: "verified" as const,
    sub: "NIESV / ESVARBON · expires 12 Apr 2027",
  },
  {
    title: "CAC certificate",
    status: "verified" as const,
    sub: "RC-1234567 · matches identity on file",
  },
  {
    title: "Government ID",
    status: "verified" as const,
    sub: "International passport · re-verify before expiry",
  },
];

export default function AgentCredentialsPage() {
  return (
    <>
      <PageHeader
        title="Credentials"
        description="Your verified-agent badge depends on these staying current. We&rsquo;ll nudge you 30 days before expiry."
      />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-3xl">
        {tracks.map((t) => (
          <Card key={t.title}>
            <CardHeader
              title={t.title}
              description={t.sub}
              action={
                t.status === "verified" ? (
                  <VerifiedBadge kind="agent" />
                ) : (
                  <Badge tone="warn">Action needed</Badge>
                )
              }
            />
            <CardBody>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-bg-sunken/40 p-5">
                <div className="flex items-center gap-3 text-sm text-fg-muted">
                  <Icon.Doc size={16} />
                  Re-upload to refresh
                </div>
                <Button variant="outline" size="sm">Choose file</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
