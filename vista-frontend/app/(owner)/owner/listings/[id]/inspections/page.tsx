import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import { SlotCreateForm } from "@/components/owner/slot-create-form";
import * as Listings from "@/lib/api/listings";
import * as Inspections from "@/lib/api/inspections";
import { BACKEND_CAPABILITIES } from "@/lib/api/capabilities";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import { listingFromApi } from "@/lib/api/adapters";

export const metadata: Metadata = { title: "Inspections" };

const slotTone = (s: string) =>
  s === "BOOKED"
    ? "success"
    : s === "COMPLETED"
      ? "muted"
      : s === "CANCELLED"
        ? "warn"
        : "brand";

export default async function ListingInspectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect(`/login?next=/owner/listings/${id}/inspections`);

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
        title={`Inspections · ${listing.title}`}
        description="Open slots and inspection requests from applicants."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active={`/owner/listings/${listing.id}/inspections`}
          items={[
            { href: `/owner/listings/${listing.id}`, label: "Overview" },
            {
              href: `/owner/listings/${listing.id}/leads`,
              label: "Leads",
              count: leadSignal,
            },
            {
              href: `/owner/listings/${listing.id}/inspections`,
              label: "Inspections",
              count: slots.length,
            },
            { href: `/owner/listings/${listing.id}/offers`, label: "Offers" },
          ]}
        />

        <Card>
          <CardHeader
            title="Create a slot"
            description="Published slots appear on the public listing page immediately."
          />
          <CardBody>
            <SlotCreateForm listingId={listing.id} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Published slots" description="Applicants book from the public listing page." />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {slots.length === 0 ? (
                <li className="p-5 text-sm text-fg-muted">No slots yet. Create one from the owner tools when available.</li>
              ) : (
                slots.map((s) => (
                  <li key={s.id} className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-14 flex-col items-center justify-center rounded-xl bg-bg-sunken text-center">
                      <span className="text-[11px] uppercase tracking-wide text-fg-subtle">
                        {new Date(s.startsAt).toLocaleString("en-NG", { month: "short" })}
                      </span>
                      <span className="text-lg font-semibold text-fg">
                        {new Date(s.startsAt).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-fg">
                        {new Date(s.startsAt).toLocaleString("en-NG", {
                          weekday: "long",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · {s.durationMins} mins
                      </p>
                      <p className="mt-1 text-xs text-fg-muted">Slot ID {s.id}</p>
                    </div>
                    <Badge tone={slotTone(s.status) as never}>
                      {s.status.toLowerCase()}
                    </Badge>
                  </li>
                ))
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Inspection requests" description="Bookings tied to your slots." />
          <CardBody className="p-8">
            <EmptyState
              title="Inspection requests feed not available yet"
              description={
                BACKEND_CAPABILITIES.inspections.listingFeed
                  ? "Inspection request history will appear here."
                  : "Applicants can book from the public listing page, but the current backend contract does not expose a listing-level inspection requests endpoint."
              }
              icon={<Icon.Calendar size={20} />}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
