import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        title="Messages"
        description="Direct messaging is not connected to haven yet. Notifications on your account still work from the bell."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="py-12">
            <EmptyState
              title="No conversations yet"
              description="When the backend exposes a conversations API, threads will appear here. Use listing comments for public questions today."
              icon={<Icon.Chat size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
