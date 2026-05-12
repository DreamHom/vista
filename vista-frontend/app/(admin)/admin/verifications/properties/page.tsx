import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import { VerificationDecisionRow } from "@/components/admin/verification-decision-row";
import * as Verification from "@/lib/api/verification";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "Admin · property verifications" };

export default async function PropertyVerificationsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/verifications/properties");

  let items: Awaited<ReturnType<typeof Verification.adminListVerifications>> = [];
  let error: string | null = null;
  try {
    items = await Verification.adminListVerifications(token, "PROPERTY_DOCUMENTS");
  } catch (e) {
    if (e instanceof HavenError && e.status === 403) redirect("/dashboard");
    error = e instanceof Error ? e.message : "Could not load.";
  }

  const pending = items.filter(
    (v) => v.status === "PENDING" && v.track === "PROPERTY_DOCUMENTS",
  );

  return (
    <>
      <PageHeader
        title="Property verifications"
        description="Title documents, proof of ownership and compliance packs."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active="/admin/verifications/properties"
          items={[
            { href: "/admin/verifications", label: "All" },
            { href: "/admin/verifications/owners", label: "Owners" },
            { href: "/admin/verifications/agents", label: "Agents" },
            {
              href: "/admin/verifications/properties",
              label: "Properties",
              count: pending.length,
            },
          ]}
        />
        <Card>
          <CardHeader title={`${pending.length} pending`} />
          <CardBody className="p-0">
            {error ? (
              <div className="p-6 text-sm text-danger">{error}</div>
            ) : pending.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Queue clear"
                  description="No pending property document reviews."
                  icon={<Icon.ShieldCheck size={20} />}
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {pending.map((v) => (
                  <VerificationDecisionRow key={v.id} item={v} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
