import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import {
  getListing,
  getLeadsFor,
  getInspectionsFor,
  getOffersFor,
} from "@/lib/mock-data";
import { formatCurrencyNGN } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const l = getListing(id);
  return { title: l ? `Manage · ${l.title}` : "Listing" };
}

export default async function OwnerListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const listingLeads = getLeadsFor(listing.id);
  const listingInspections = getInspectionsFor(listing.id);
  const listingOffers = getOffersFor(listing.id);

  return (
    <>
      <PageHeader
        title={listing.title}
        description={`${listing.area}, ${listing.city} · ${listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`} · ${listing.type}`}
        actions={
          <>
            <ButtonLink href={`/listings/${listing.id}`} variant="outline">
              View as applicant
            </ButtonLink>
            <ButtonLink href={`/owner/listings/${listing.id}/edit`} leadingIcon={<Icon.Settings size={14} />}>
              Edit listing
            </ButtonLink>
          </>
        }
      />

      <div className="px-6 lg:px-8 py-8 space-y-8">
        {/* tabs */}
        <PillTabs
          active={`/owner/listings/${listing.id}`}
          items={[
            { href: `/owner/listings/${listing.id}`, label: "Overview" },
            { href: `/owner/listings/${listing.id}/leads`, label: "Leads", count: listingLeads.length },
            { href: `/owner/listings/${listing.id}/inspections`, label: "Inspections", count: listingInspections.length },
            { href: `/owner/listings/${listing.id}/offers`, label: "Offers", count: listingOffers.length },
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
                <Badge tone={listing.status === "live" ? "success" : "muted"}>
                  {listing.status.replace("_", " ")}
                </Badge>
                {listing.ownerVerified && <VerifiedBadge kind="owner" />}
                {listing.documentsVerified && <VerifiedBadge kind="documents" />}
              </div>
            </div>
            <CardBody>
              <p className="text-sm text-fg-muted leading-relaxed">{listing.description}</p>
            </CardBody>
          </Card>

          <div className="space-y-4">
            <Stat label="Views" value={listing.views.toLocaleString()} delta="+184 last 7 days" tone="positive" icon={<Icon.Eye size={14} />} />
            <Stat label="Saves" value={`${listing.saves}`} delta="+9 this week" tone="positive" icon={<Icon.Bookmark size={14} />} />
            <Stat label="Inspections" value={`${listing.inspections}`} icon={<Icon.Calendar size={14} />} />
            <Stat label="Asking" value={listing.purpose === "rent" ? `${formatCurrencyNGN(listing.fees.rent ?? 0)}/yr` : formatCurrencyNGN(listing.fees.price ?? 0)} icon={<Icon.Coin size={14} />} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <SubCard
            title="Leads"
            href={`/owner/listings/${listing.id}/leads`}
            count={listingLeads.length}
            description="Saved · Warm · Hot"
            icon={<Icon.Chart size={14} />}
          />
          <SubCard
            title="Inspections"
            href={`/owner/listings/${listing.id}/inspections`}
            count={listingInspections.length}
            description="Open, booked, completed"
            icon={<Icon.Calendar size={14} />}
          />
          <SubCard
            title="Offers"
            href={`/owner/listings/${listing.id}/offers`}
            count={listingOffers.length}
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
  count,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  count: number;
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
        <Icon.ArrowRight size={14} className="text-fg-subtle group-hover:text-brand" />
      </div>
      <p className="mt-4 text-sm font-medium text-fg-muted">{title}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-fg">{count}</p>
      <p className="mt-2 text-xs text-fg-subtle">{description}</p>
    </Link>
  );
}
