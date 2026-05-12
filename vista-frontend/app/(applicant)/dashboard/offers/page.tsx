import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "My offers" };

export default async function OffersPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/dashboard/offers");

  return (
    <>
      <PageHeader
        title="Offers"
        description="Your live negotiations. Counter freely — every move is logged on the server."
      />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardBody className="p-8">
            <EmptyState
              title="Offer history is not available from the backend yet"
              description="You can submit, accept, decline, and counter offers, but the current backend contract does not expose a personal offers listing endpoint."
              icon={<Icon.Coin size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
