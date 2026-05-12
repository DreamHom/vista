import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getSessionUser } from "@/lib/api/session-user";
import { getToken } from "@/lib/api/session";
import * as Listings from "@/lib/api/listings";

export const metadata: Metadata = { title: "Inspections" };

export default async function OwnerInspectionsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/owner/inspections");
  const token = await getToken();
  if (!token) redirect("/login?next=/owner/inspections");

  const mine = await Listings.listAllOwnedListings(String(me.id), { page: 0, size: 100 }).catch(
    () => [],
  );

  return (
    <>
      <PageHeader
        title="Inspection calendar"
        description="Inspection requests across your portfolio."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader title="Upcoming & past inspections" />
          <CardBody className="p-8">
            <EmptyState
              title="Inspection requests are not listable from the backend yet"
              description={`You currently have ${mine.length} listing${mine.length === 1 ? "" : "s"} in your portfolio. Slot creation is live, but booking history is delivered through notifications until a listing endpoint for inspection requests is added.`}
              icon={<Icon.Calendar size={20} />}
            />
          </CardBody>
        </Card>
        <p className="mt-6 text-xs text-fg-subtle">
          <Icon.Sparkles size={12} className="inline mr-1 -mt-0.5" />
          Tip: confirm or reschedule from each listing&apos;s inspections tab.
        </p>
      </div>
    </>
  );
}
