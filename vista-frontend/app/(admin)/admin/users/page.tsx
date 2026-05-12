import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "Admin · users" };

export default async function AdminUsersPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/users");

  return (
    <>
      <PageHeader
        title="Users"
        description="Search, suspend and reactivate accounts once haven exposes a user directory API."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="py-12">
            <EmptyState
              title="User search not wired"
              description="Suspend/reactivate actions exist in admin tools; add GET /api/admin/users (or similar) on haven to list and filter accounts."
              icon={<Icon.Users size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
