import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getSessionUser } from "@/lib/api/session-user";
import { getToken } from "@/lib/api/session";
import * as Listings from "@/lib/api/listings";

export const metadata: Metadata = { title: "All offers" };

export default async function OwnerOffersPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/owner/offers");
  const token = await getToken();
  if (!token) redirect("/login?next=/owner/offers");

  const mine = await Listings.listAllOwnedListings(String(me.id), { page: 0, size: 100 }).catch(
    () => [],
  );

  return (
    <>
      <PageHeader
        title="All offers"
        description="Active negotiations across every listing in your portfolio."
      />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardBody className="p-8">
            <EmptyState
              title="Offer inbox is not available from the backend yet"
              description={`Your portfolio currently has ${mine.length} listing${mine.length === 1 ? "" : "s"}. Offer submission endpoints are live, but the backend contract does not expose an owner-wide offers listing feed.`}
              icon={<Icon.Coin size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
