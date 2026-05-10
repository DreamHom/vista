import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Owner · verification" };

const tracks = [
  {
    title: "Identity",
    status: "verified" as const,
    copy: "Your government ID and NIN reference are on file.",
  },
  {
    title: "Property documents",
    status: "pending" as const,
    copy: "Submit C of O, deed of assignment or tenancy agreement per listing.",
  },
];

export default function OwnerVerificationPage() {
  return (
    <>
      <PageHeader
        title="Verification"
        description="Verified owners + verified docs = the strict blue tick. Conversions roughly triple."
      />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-3xl">
        {tracks.map((t) => (
          <Card key={t.title}>
            <CardHeader
              title={t.title}
              description={t.copy}
              action={
                t.status === "verified" ? (
                  <VerifiedBadge kind="owner" />
                ) : (
                  <Badge tone="warn">Pending submission</Badge>
                )
              }
            />
            <CardBody>
              <div className="rounded-xl border border-dashed border-border bg-bg-sunken/40 p-6 text-center">
                <Icon.Doc size={20} className="mx-auto text-fg-muted" />
                <p className="mt-2 text-sm font-medium text-fg">
                  {t.status === "verified" ? "On file" : "Drop your documents here"}
                </p>
                <p className="text-xs text-fg-muted">
                  {t.status === "verified"
                    ? "We&rsquo;ll re-verify automatically when your ID expires."
                    : "PDF, JPG or PNG · max 8MB · reviewed within 48h"}
                </p>
                {t.status !== "verified" && (
                  <Button variant="outline" size="sm" className="mt-4">
                    Choose file
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
