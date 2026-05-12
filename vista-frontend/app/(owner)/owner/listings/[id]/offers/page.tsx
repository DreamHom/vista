import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import * as Listings from "@/lib/api/listings";
import * as Inspections from "@/lib/api/inspections";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import { listingFromApi } from "@/lib/api/adapters";

export const metadata: Metadata = { title: "Offers" };

export default async function ListingOffersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect(`/login?next=/owner/listings/${id}/offers`);

  const apiListing = await Listings.getListing(id).catch((err) => {
    if (err instanceof HavenError && err.status === 404) notFound();
    throw err;
  });
  const photos = await Listings.getListingPhotos(id).catch(() => []);
  const listing = listingFromApi(apiListing, photos);

  const slots = await Inspections.listListingSlots(id).catch(() => []);
  const leadSignal = listing.saves;

  return (
    <>
      <PageHeader
        title={`Offers · ${listing.title}`}
        description="Owner has the final say. If an agent is assigned, they present with their recommendation."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active={`/owner/listings/${listing.id}/offers`}
          items={[
            { href: `/owner/listings/${listing.id}`, label: "Overview" },
            { href: `/owner/listings/${listing.id}/leads`, label: "Leads", count: leadSignal },
            {
              href: `/owner/listings/${listing.id}/inspections`,
              label: "Inspections",
              count: slots.length,
            },
            { href: `/owner/listings/${listing.id}/offers`, label: "Offers" },
          ]}
        />

        <Card>
          <CardBody className="p-8">
            <EmptyState
              title="Listing offers feed not available from the backend yet"
              description="Applicants can submit offers and respond to counters, but the current backend contract does not expose a listing-level offers retrieval endpoint."
              icon={<Icon.Coin size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
