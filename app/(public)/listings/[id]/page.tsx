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
import {
  CompactListingTile,
  ListingScheduleInspectionLink,
  MetricCard,
  PublicApiNotice,
  RatingRow,
  VerificationBadgeWithPopover,
} from "@/components/public/public-components";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import {
  formatAvailability,
  getListingById,
  getSimilarListings,
} from "@/lib/seed/public-data";
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
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return {};

  return {
    title: listing.title,
    description: `${listing.address}. ${listing.description}`,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const similar = await getSimilarListings(id, 3);
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
    <div className="container py-10 md:py-14">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.52fr)] xl:items-start xl:gap-10">
        <div className="min-w-0 space-y-8">
          <ListingGallery photos={galleryPhotos} title={listing.title} />

          <article className="border border-border bg-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{listing.term === "RENT" ? "For rent" : "For sale"}</Badge>
                  <Badge variant="outline">{formatListingTypeLabel(listing.type)}</Badge>
                  {listing.verified ? (
                    <VerificationBadgeWithPopover
                      label={listing.verificationLabel?.trim() || "Verified"}
                      align="start"
                    />
                  ) : null}
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

            <div className="mt-8 border-t border-border pt-8">
              <ListingScheduleInspectionLink
                listingId={listing.id}
                variant="primary"
                size="lg"
                className="flex h-14 w-full items-center justify-center gap-2 text-base font-semibold tracking-tight"
              >
                <CalendarClock className="h-5 w-5 shrink-0" aria-hidden />
                Schedule inspection
              </ListingScheduleInspectionLink>
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground md:text-sm">
                Applicants go to My Inspections; everyone else can create an account first. Messages stay on-platform.
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
                {listing.pendingReportCount > 0 ? (
                  <Badge variant="warning">{listing.pendingReportCount} open report(s)</Badge>
                ) : null}
              </div>
            </section>

            <section className="border border-border bg-card p-6 md:p-7">
              <h2 className="text-xl font-semibold tracking-tight">About this property</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{listing.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <MetricCard label="Views" value={String(listing.viewCount)} icon="eye" />
                <MetricCard label="Reports" value={String(listing.pendingReportCount)} icon="flag" />
              </div>
            </section>
          </div>

          <section className="border border-border bg-card p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Public Q&amp;A</h2>
              <Link href={`/signup?next=/listings/${listing.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Sign up to ask a question
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {listing.comments.length ? (
                listing.comments.map((comment) => (
                  <article key={comment.id} className="border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{comment.authorName}</p>
                      <Badge variant="outline">{comment.authorRole}</Badge>
                      <span className="text-sm text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{comment.body}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No public questions yet on this listing.</p>
              )}
            </div>
          </section>

          <section className="border border-border bg-card p-6 md:p-7">
            <h2 className="text-xl font-semibold tracking-tight">Public reviews tied to this listing</h2>
            <div className="mt-5 space-y-4">
              {listing.reviews.length ? (
                listing.reviews.map((review) => (
                  <article key={review.id} className="border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{review.reviewerName}</p>
                        <p className="text-sm text-muted-foreground">{review.reviewerRole}</p>
                      </div>
                      <RatingRow rating={review.rating} reviewCount={1} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                    <p className="mt-2 text-xs uppercase tracking-eyebrow text-muted-foreground">{review.date}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No public reviews are attached to this listing yet.</p>
              )}
            </div>
          </section>

          <section className="border border-border bg-card p-6 md:p-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-6 sm:gap-y-0">
              <h2 className="min-w-0 text-pretty text-xl font-semibold tracking-tight">Similar listings</h2>
              <Link
                href="/compare"
                className="inline-flex shrink-0 self-start text-sm font-medium text-primary hover:text-primary/80 sm:self-auto sm:whitespace-nowrap"
              >
                Compare options
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
        </div>

        <aside className="min-w-0 space-y-5 border border-border bg-card p-5 md:p-6 xl:sticky xl:top-24 xl:self-start">
          <PublicApiNotice>
            This page is backend-driven. Pet rules and utilities are not in Haven v1.0.1 yet. The map shows an approximate Lagos / Abuja pin until the API exposes real coordinates.
          </PublicApiNotice>

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
                  <p className="text-muted-foreground">
                    Ask during inspection. Haven does not expose pet or utility responsibility on every listing yet.
                  </p>
                }
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Open inspection slots</p>
            <div className="mt-3 space-y-2">
              {listing.slots.length ? (
                listing.slots.slice(0, 5).map((slot) => (
                  <div key={slot.id} className="border border-border bg-secondary/20 px-3 py-2.5 text-sm text-foreground">
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(slot.startsAt))}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No public slots right now. Use schedule inspection after sign-in to request a time.
                </p>
              )}
            </div>
            <ListingScheduleInspectionLink
              listingId={listing.id}
              variant="outline"
              size="sm"
              className="mt-4 w-full justify-center"
            >
              Request a slot
            </ListingScheduleInspectionLink>
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
