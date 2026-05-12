import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "My inspections" };

export default async function InspectionsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/dashboard/inspections");

  return (
    <>
      <PageHeader
        title="Inspections"
        description="Every property visit you've booked, completed or missed. Two no-shows in 60 days pause your privileges — keep this clean."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="p-8">
            <EmptyState
              title="Inspection feed not available from the backend yet"
              description="You can request an inspection from a listing page, but the current backend contract does not expose a personal inspections history endpoint."
              icon={<Icon.Calendar size={20} />}
            />
          </CardBody>
        </Card>

        <p className="mt-6 text-xs text-fg-subtle">
          Inspection requests notify the assigned agent or owner. You will get a
          notification when the status changes.
        </p>
      </div>
    </>
  );
}
