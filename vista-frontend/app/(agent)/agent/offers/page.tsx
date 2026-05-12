import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";
import * as Assignments from "@/lib/api/agent-assignments";

export const metadata: Metadata = { title: "Offers" };

export default async function AgentOffersPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/agent/offers");

  const assignments = await Assignments.listMyAssignments(token).catch(() => []);
  const accepted = assignments.filter((a) => a.status === "ACCEPTED");

  return (
    <>
      <PageHeader
        title="Offers"
        description="Offers on listings you manage for owners."
      />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardBody className="p-8">
            <EmptyState
              title="Offer inbox is not available from the backend yet"
              description={`You currently manage ${accepted.length} accepted assignment${accepted.length === 1 ? "" : "s"}. The backend contract does not include an agent-facing offers retrieval endpoint.`}
              icon={<Icon.Coin size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
