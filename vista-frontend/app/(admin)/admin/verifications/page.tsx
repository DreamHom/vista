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

export const metadata: Metadata = { title: "Admin · verifications" };

export default async function VerificationsQueuePage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/verifications");

  let items: Awaited<ReturnType<typeof Verification.adminListVerifications>> =
    [];
  let error: string | null = null;
  try {
    const [owners, agents, properties, applicants] = await Promise.all([
      Verification.adminListVerifications(token, "OWNER_IDENTITY"),
      Verification.adminListVerifications(token, "AGENT_CREDENTIALS"),
      Verification.adminListVerifications(token, "PROPERTY_DOCUMENTS"),
      Verification.adminListVerifications(token, "APPLICANT_IDENTITY"),
    ]);
    items = [...owners, ...agents, ...properties, ...applicants];
  } catch (err) {
    if (err instanceof HavenError && err.status === 403) {
      redirect("/dashboard");
    }
    error = err instanceof Error ? err.message : "Could not load the queue.";
  }

  const pending = items.filter((v) => v.status === "PENDING");
  const counts = {
    owner: pending.filter((v) => v.track === "OWNER_IDENTITY").length,
    agent: pending.filter((v) => v.track === "AGENT_CREDENTIALS").length,
    property: pending.filter((v) => v.track === "PROPERTY_DOCUMENTS").length,
    applicant: pending.filter((v) => v.track === "APPLICANT_IDENTITY").length,
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
            {
              href: "/admin/verifications",
              label: "All",
              count: pending.length,
            },
            {
              href: "/admin/verifications/owners",
              label: "Owners",
              count: counts.owner,
            },
            {
              href: "/admin/verifications/agents",
              label: "Agents",
              count: counts.agent,
            },
            {
              href: "/admin/verifications/properties",
              label: "Properties",
              count: counts.property,
            },
          ]}
        />

        <Card>
          <CardHeader
            title={`${pending.length} pending`}
            description="Oldest first — uphold our SLA."
          />
          <CardBody className="p-0">
            {error ? (
              <div className="p-6 text-sm text-danger">{error}</div>
            ) : pending.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Queue is clear."
                  description="No pending verifications right now. Good work."
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
