import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import { PhotoUploader } from "@/components/owner/photo-uploader";
import * as Listings from "@/lib/api/listings";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import { listingFromApi } from "@/lib/api/adapters";
import { listingStatusLabel, listingStatusTone } from "@/lib/types";
import { formatCurrencyNGN } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const l = await Listings.getListing(id);
    return { title: `Manage · ${l.title}` };
  } catch {
    return { title: "Listing" };
  }
}

export default async function OwnerListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  if (!token) {
    redirect(`/login?next=/owner/listings/${id}`);
  }

  const apiListing = await Listings.getListing(id).catch((err) => {
    if (err instanceof HavenError && err.status === 404) notFound();
    throw err;
  });
  const photos = await Listings.getListingPhotos(id).catch(() => []);
  const listing = listingFromApi(apiListing, photos);

  return (
    <>
      <PageHeader
        title={listing.title}
        description={`${listing.area}, ${listing.city} · ${
          listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`
        } · ${listing.type}`}
        actions={
          <>
            <ButtonLink href={`/listings/${listing.id}`} variant="outline">
              View as applicant
            </ButtonLink>
            <ButtonLink
              href={`/owner/listings/${listing.id}/edit`}
              leadingIcon={<Icon.Settings size={14} />}
            >
              Edit listing
            </ButtonLink>
          </>
        }
      />

      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active={`/owner/listings/${listing.id}`}
          items={[
            { href: `/owner/listings/${listing.id}`, label: "Overview" },
            { href: `/owner/listings/${listing.id}/leads`, label: "Leads" },
            {
              href: `/owner/listings/${listing.id}/inspections`,
              label: "Inspections",
            },
            { href: `/owner/listings/${listing.id}/offers`, label: "Offers" },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="relative aspect-[2/1]">
              <Image
                src={listing.photos[0]}
                alt={listing.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge tone={listingStatusTone(listing)}>
                  {listingStatusLabel(listing)}
                </Badge>
                {listing.ownerVerified && <VerifiedBadge kind="owner" />}
                {listing.documentsVerified && (
                  <VerifiedBadge kind="documents" />
                )}
              </div>
            </div>
            <CardBody>
              <p className="text-sm text-fg-muted leading-relaxed">
                {listing.description}
              </p>
            </CardBody>
          </Card>

          <div className="space-y-4">
            <Stat
              label="Views"
              value={listing.views.toLocaleString()}
              icon={<Icon.Eye size={14} />}
            />
            <Stat
              label="Saves"
              value={`${listing.saves}`}
              icon={<Icon.Bookmark size={14} />}
            />
            <Stat
              label="Inspections"
              value={`${listing.inspections}`}
              icon={<Icon.Calendar size={14} />}
            />
            <Stat
              label="Asking"
              value={
                listing.purpose === "rent"
                  ? `${formatCurrencyNGN(listing.fees.rent ?? 0)}/yr`
                  : formatCurrencyNGN(listing.fees.price ?? 0)
              }
              icon={<Icon.Coin size={14} />}
            />
          </div>
        </div>

        <Card>
          <CardHeader
            title="Photos"
            description="The first photo is the cover. Drag-and-drop reordering coming soon."
          />
          <CardBody className="space-y-5">
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {photos
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-bg-sunken"
                    >
                      <Image
                        src={p.url}
                        alt={p.caption ?? ""}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                      {p.displayOrder === 0 ? (
                        <Badge
                          tone="brand"
                          className="absolute left-2 top-2"
                        >
                          Cover
                        </Badge>
                      ) : null}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-fg-muted">
                No photos yet — your listing card looks lonely. Add one below.
              </p>
            )}
            <PhotoUploader listingId={listing.id} />
          </CardBody>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <SubCard
            title="Leads"
            href={`/owner/listings/${listing.id}/leads`}
            description="Saved · Warm · Hot"
            icon={<Icon.Chart size={14} />}
          />
          <SubCard
            title="Inspections"
            href={`/owner/listings/${listing.id}/inspections`}
            description="Open, booked, completed"
            icon={<Icon.Calendar size={14} />}
          />
          <SubCard
            title="Offers"
            href={`/owner/listings/${listing.id}/offers`}
            description="Negotiations in flight"
            icon={<Icon.Coin size={14} />}
          />
        </div>
      </div>
    </>
  );
}

function SubCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-bg-elevated p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
          {icon}
        </span>
        <Icon.ArrowRight
          size={14}
          className="text-fg-subtle group-hover:text-brand"
        />
      </div>
      <p className="mt-4 text-sm font-medium text-fg-muted">{title}</p>
      <p className="mt-2 text-xs text-fg-subtle">{description}</p>
    </Link>
  );
}
