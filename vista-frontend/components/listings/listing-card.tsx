import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/types";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { formatCurrencyNGN } from "@/lib/utils";

export function ListingCard({ listing }: { listing: Listing }) {
  const headlinePrice =
    listing.purpose === "rent"
      ? `${formatCurrencyNGN(listing.fees.rent ?? 0)}/yr`
      : formatCurrencyNGN(listing.fees.price ?? 0);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-bg-elevated transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-sunken">
        <Image
          src={listing.photos[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone={listing.purpose === "rent" ? "brand" : "accent"}>
            {listing.purpose === "rent" ? "For rent" : "For sale"}
          </Badge>
          {listing.ownerVerified && listing.documentsVerified ? (
            <VerifiedBadge kind="documents" />
          ) : !listing.ownerVerified && !listing.documentsVerified ? (
            <Badge tone="warn">Unverified</Badge>
          ) : (
            <Badge tone="muted">Partial verify</Badge>
          )}
        </div>
        <button
          type="button"
          aria-label="Save listing"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg-elevated/85 text-fg-muted backdrop-blur hover:text-brand"
        >
          <Icon.Heart size={16} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-semibold text-fg group-hover:text-brand">
            {listing.title}
          </h3>
        </div>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-fg-muted">
          <Icon.Pin size={14} />
          {listing.area}, {listing.city}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon.Bed size={14} />
            {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon.Bath size={14} />
            {listing.bathrooms} bath
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon.Building size={14} />
            {listing.type}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <p className="text-lg font-semibold tracking-tight text-fg">
            {headlinePrice}
            {listing.purpose === "rent" && (
              <span className="ml-1 text-xs font-normal text-fg-subtle">all-in</span>
            )}
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
            <Icon.Eye size={12} />
            {listing.views.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
