import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import * as Listings from "@/lib/api/listings";
import * as Inspections from "@/lib/api/inspections";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import { listingFromApi } from "@/lib/api/adapters";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect(`/login?next=/owner/listings/${id}/leads`);

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
        title={`Leads · ${listing.title}`}
        description="Activity on this listing from saves, inspections and offers."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active={`/owner/listings/${listing.id}/leads`}
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-elevated p-5">
            <Badge tone="danger">Hot</Badge>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">—</p>
            <p className="text-xs text-fg-subtle">Offer feed unavailable</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-elevated p-5">
            <Badge tone="warn">Warm</Badge>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">{listing.saves}</p>
            <p className="text-xs text-fg-subtle">Saved this listing</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-elevated p-5">
            <Badge tone="muted">Cold</Badge>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">—</p>
            <p className="text-xs text-fg-subtle">Reserved for future lead signals</p>
          </div>
        </div>

        <Card>
          <CardHeader title="Recent activity" description="Only signals exposed by the backend are shown." />
          <CardBody className="p-8">
            <EmptyState
              title="Detailed lead activity is not available yet"
              description="The backend exposes save counts on the listing itself, but it does not provide listing-level inspection or offer feeds for this page yet."
              icon={<Icon.Chart size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
