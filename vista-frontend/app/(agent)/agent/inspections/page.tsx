import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getToken } from "@/lib/api/session";
import * as Assignments from "@/lib/api/agent-assignments";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Inspections" };

export default async function AgentInspectionsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/agent/inspections");

  const assignments = await Assignments.listMyAssignments(token).catch(() => []);
  const accepted = assignments.filter((a) => a.status === "ACCEPTED");

  return (
    <>
      <PageHeader
        title="Inspection calendar"
        description="Inspection requests on listings you manage."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="p-8">
            <EmptyState
              title="Inspection inbox is not available from the backend yet"
              description={`You currently manage ${accepted.length} accepted assignment${accepted.length === 1 ? "" : "s"}. Inspection requests are delivered through notifications until a dedicated agent-facing inspections feed is added.`}
              icon={<Icon.Calendar size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
