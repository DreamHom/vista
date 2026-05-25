import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  CalendarClock,
  FileText,
  MapPin,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { ListingGallery } from "@/components/public/listing-gallery";
import { ListingDetailMap } from "@/components/public/listing-detail-map";
import { CompactListingTile, MetricCard } from "@/components/public/public-components";
import { ListingTrustChips } from "@/components/public/listing-trust-chips";
import { ListingDetailViewerBar } from "@/components/public/listing-detail-viewer-bar";
import { ListingQaSection } from "@/components/public/listing-qa-section";
import { ListingReviewsSection } from "@/components/public/listing-reviews-section";
import { AdjacentListingNav } from "@/components/public/widgets/adjacent-listing-nav";
import { ListingSlotPicker } from "@/components/public/widgets/listing-slot-picker";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import {
  formatAvailability,
  getAdjacentListings,
  getListingById,
  getSimilarListings,
  normalizeListingRouteId,
} from "@/lib/seed/public-data";
import { truncateMetaDescription } from "@/lib/seo-metadata";
import { cn } from "@/lib/utils";

function formatListingTypeLabel(raw: string) {
  return raw
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = normalizeListingRouteId(rawId);
  const listing = await getListingById(id);
  if (!listing) {
    return { title: "Listing", robots: { index: false, follow: true } };
  }

  const description = truncateMetaDescription(
    [listing.address, listing.description].filter(Boolean).join(" "),
  );

  return {
    title: listing.title,
    description,
    alternates: { canonical: `/listings/${id}` },
    openGraph: {
      title: listing.title,
      description,
      url: `/listings/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = normalizeListingRouteId(rawId);
  const listing = await getListingById(id);
  if (!listing) notFound();

  // Adjacent + similar fetched in parallel — both walk the same listManyListings
  // cache, so this is effectively a single network round trip.
  const [similar, adjacent] = await Promise.all([
    getSimilarListings(id, 3),
    getAdjacentListings(id),
  ]);
  const galleryPhotos = listing.photos.length
    ? listing.photos
    : Array.from({ length: 4 }, (_, index) =>
        fallbackListingPhoto(`${listing.id}-${listing.title}`, { w: 1200, ratio: "4:3" }, index),
      );

  const feeSummaryParts = [
    listing.cautionFeeNgn !== null ? `Caution ${formatNaira(listing.cautionFeeNgn, { compact: true })}` : null,
    listing.serviceChargeNgn !== null ? `Service ${formatNaira(listing.serviceChargeNgn, { compact: true })}` : null,
    listing.agencyFeeNgn !== null ? `Agency ${formatNaira(listing.agencyFeeNgn, { compact: true })}` : null,
  ].filter(Boolean);

  return (
    <div className="container py-6 md:py-10">
      {/* Adjacent listing nav — flips through the catalogue without losing
          the visitor's place. Hidden when there's nothing to either side. */}
      <AdjacentListingNav previous={adjacent.previous} next={adjacent.next} />

      <ListingDetailViewerBar
        listingId={listing.id}
        propertyId={listing.propertyId}
        ownerId={listing.ownerId}
        agentId={listing.agentId}
      />

      <section className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.52fr)] xl:items-start xl:gap-10">
        <div className="min-w-0 space-y-8">
          <ListingGallery photos={galleryPhotos} title={listing.title} />

          <article className="border border-border bg-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{listing.term === "RENT" ? "For rent" : "For sale"}</Badge>
                  <Badge variant="outline">{formatListingTypeLabel(listing.type)}</Badge>
                  <ListingTrustChips
                    ownerIdentityVerifiedAt={listing.ownerIdentityVerifiedAt}
                    documentsVerifiedAt={listing.documentsVerifiedAt}
                  />
                </div>
                <div>
                  <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.35rem] lg:leading-tight">
                    {listing.title}
                  </h1>
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground md:text-base">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {listing.address}
                  </p>
                </div>
              </div>

              <div className="shrink-0 space-y-1 text-right">
                <p className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {formatNaira(listing.priceNgn)}
                  {listing.term === "RENT" ? (
                    <span className="block text-base font-medium text-muted-foreground md:inline md:pl-1">
                      per year
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">{listing.availableFrom}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Stat icon={<BedDouble className="h-4 w-4" aria-hidden />} label="Bedrooms" value={String(listing.bedrooms ?? "N/A")} />
              <Stat icon={<Bath className="h-4 w-4" aria-hidden />} label="Bathrooms" value={String(listing.bathrooms ?? "N/A")} />
              <Stat
                icon={<Ruler className="h-4 w-4" aria-hidden />}
                label="Size"
                value={listing.sizeSqm ? `${listing.sizeSqm} sqm` : "Not provided"}
              />
              <Stat icon={<CalendarClock className="h-4 w-4" aria-hidden />} label="Handover" value={listing.availableFrom} />
              <Stat icon={<ShieldCheck className="h-4 w-4" aria-hidden />} label="Status" value={listing.status} />
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <Link
                href="#schedule-inspection"
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "flex h-14 w-full items-center justify-center gap-2 text-base font-semibold tracking-tight",
                )}
              >
                <CalendarClock className="h-5 w-5 shrink-0" aria-hidden />
                {listing.slots.length > 0
                  ? `Schedule a visit · ${listing.slots.length} open slot${listing.slots.length === 1 ? "" : "s"}`
                  : "Schedule a visit"}
              </Link>
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground md:text-sm">
                Pick a published time below, or request a custom slot if none of the existing ones work.
              </p>
            </div>
          </article>

          <div className="grid gap-6 lg:grid-cols-2">
            <section id="listing-pricing" className="scroll-mt-24 border border-border bg-card p-6 md:p-7">
              <h2 className="text-xl font-semibold tracking-tight">Pricing breakdown</h2>
              <div className="mt-5 space-y-3 text-sm">
                <PriceRow
                  label="Asking price"
                  value={`${formatNaira(listing.priceNgn)}${listing.term === "RENT" ? " / year" : ""}`}
                />
                <PriceRow label="Caution fee" value={listing.cautionFeeNgn !== null ? formatNaira(listing.cautionFeeNgn) : "Not disclosed"} />
                <PriceRow
                  label="Service charge"
                  value={listing.serviceChargeNgn !== null ? formatNaira(listing.serviceChargeNgn) : "Not disclosed"}
                />
                <PriceRow label="Agency fee" value={listing.agencyFeeNgn !== null ? formatNaira(listing.agencyFeeNgn) : "Not disclosed"} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="outline">No inspection fee in Haven flow</Badge>
              </div>
            </section>

            <section className="border border-border bg-card p-6 md:p-7">
              <h2 className="text-xl font-semibold tracking-tight">About this property</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{listing.description}</p>
              <MetricCard label="Views" value={String(listing.viewCount)} icon="eye" />
            </section>
          </div>

          {/* Inline schedule-a-visit picker — primary booking surface.
              Replaces the old deep-link CTA that bounced applicants out to
              the inspections workspace. Guests still see slots as a preview;
              applicants book directly here. */}
          <ListingSlotPicker
            listingId={listing.id}
            slots={listing.slots}
            ownerId={listing.ownerId}
            agentId={listing.agentId}
          />

          {/* Similar listings — moved up so pivoting between properties
              happens before the long-tail Q&A and reviews sections. */}
          <section className="border border-border bg-card p-6 md:p-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-6 sm:gap-y-0">
              <h2 className="min-w-0 text-pretty text-xl font-semibold tracking-tight">
                Similar listings
              </h2>
              <Link
                href="/compare"
                className="inline-flex shrink-0 self-start text-sm font-medium text-primary hover:text-primary/80 sm:self-auto sm:whitespace-nowrap"
              >
                Compare options →
              </Link>
            </div>
            <ul className="mt-5 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr))]">
              {similar.map((item) => (
                <li key={item.id} className="min-w-0">
                  <CompactListingTile listing={item} ctaLabel="View full listing" />
                </li>
              ))}
            </ul>
          </section>

          <ListingQaSection
            listingId={listing.id}
            ownerId={listing.ownerId}
            agentId={listing.agentId}
            comments={listing.comments}
          />

          <ListingReviewsSection
            listingId={listing.id}
            ownerId={listing.ownerId}
            agentId={listing.agentId}
            reviews={listing.reviews}
          />

        </div>

        <aside className="min-w-0 space-y-5 border border-border bg-card p-5 md:p-6 xl:sticky xl:top-24 xl:self-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">At a glance</p>
            <div className="mt-1 divide-y divide-border">
              <PanelRow
                icon={<CalendarClock className="h-4 w-4" aria-hidden />}
                title="Availability"
                body={
                  <>
                    <p>{formatAvailability(listing.availability)}</p>
                    <p className="mt-1 text-muted-foreground">Move-in: {listing.availableFrom}</p>
                  </>
                }
              />
              <PanelRow
                icon={<FileText className="h-4 w-4" aria-hidden />}
                title="Fees &amp; extras"
                body={
                  feeSummaryParts.length ? (
                    <>
                      <p>{feeSummaryParts.join(" · ")}</p>
                      <Link href="#listing-pricing" className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary/80">
                        Full pricing breakdown
                      </Link>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Fee lines are not all published yet.</p>
                  )
                }
              />
              <PanelRow
                icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
                title="Pet &amp; utilities"
                body={
                  listing.petsAllowed?.trim() || listing.utilitiesNote?.trim() ? (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {listing.petsAllowed?.trim() ? (
                        <p>
                          <span className="font-medium text-foreground">Pets: </span>
                          {listing.petsAllowed.trim()}
                        </p>
                      ) : null}
                      {listing.utilitiesNote?.trim() ? (
                        <p>
                          <span className="font-medium text-foreground">Utilities: </span>
                          {listing.utilitiesNote.trim()}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      The owner has not added pet or utility notes on this listing yet. Ask during inspection if it matters for your move.
                    </p>
                  )
                }
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                Quick book
              </p>
              <Link
                href="#schedule-inspection"
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                See all slots ↓
              </Link>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {listing.slots.length === 0
                ? "No public slots yet. Use the Schedule a visit panel to request a custom time."
                : `${listing.slots.length} open ${listing.slots.length === 1 ? "slot" : "slots"} available. Tap to jump to the picker.`}
            </p>
            <Link
              href="#schedule-inspection"
              className={cn(
                buttonVariants({ variant: listing.slots.length > 0 ? "primary" : "outline", size: "sm" }),
                "mt-3 w-full justify-center",
              )}
            >
              {listing.slots.length > 0 ? "Pick a time" : "Request a time"}
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Map</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              OpenStreetMap tiles · drag to pan · tap the pin for details. Coordinates are approximate until Haven ships geometry.
            </p>
            <div className="mt-3">
              <ListingDetailMap
                latitude={listing.latitude}
                longitude={listing.longitude}
                label={listing.location}
                term={listing.term}
              />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function PanelRow({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: ReactNode;
}) {
  return (
    <div className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-secondary text-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">{title}</p>
        <div className="mt-1.5 text-sm text-foreground">{body}</div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border p-4">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center bg-secondary text-foreground">{icon}</div>
      <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
