import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Messages" };

export default function AgentMessagesPage() {
  return (
    <>
      <PageHeader
        title="Messages"
        description="Direct messaging is not connected to haven yet. Use notifications for time-sensitive replies."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="py-12">
            <EmptyState
              title="No conversations yet"
              description="When haven ships a messaging API, your applicant threads will show here."
              icon={<Icon.Chat size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
