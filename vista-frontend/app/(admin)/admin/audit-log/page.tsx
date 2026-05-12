import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "Admin · audit log" };

export default async function AdminAuditLogPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/audit-log");

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Immutable record of admin actions for compliance."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="py-12">
            <EmptyState
              title="No audit stream yet"
              description="Connect haven’s admin audit endpoint to render this feed. Moderation actions still apply through existing APIs."
              icon={<Icon.Shield size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
