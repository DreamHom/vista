"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ImageOff, MapPin, Sparkles } from "lucide-react";

import type { OwnerManagedProperty } from "@/lib/owner-dashboard";
import { listOwnerOffers } from "@/lib/owner-dashboard";
import { listingStatusLabel, listingStatusVariant } from "@/lib/listing-lifecycle";
import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground">{children}</label>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background py-2 pl-3 pr-11 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        props.className,
      )}
    />
  );
}

export function propertyImageUrl(item: OwnerManagedProperty | { listingDetail: OwnerManagedProperty["listingDetail"] }) {
  return item.listingDetail?.photos?.[0]?.url ?? null;
}

export function PropertyThumbnail({
  url,
  alt,
  className,
  actionHref,
  actionLabel = "Add photos",
}: {
  url?: string | null;
  alt: string;
  className?: string;
  /** Optional anchor target for the empty state (e.g. "#listing-photos"). */
  actionHref?: string;
  actionLabel?: string;
}) {
  if (url) {
    return <img src={url} alt={alt} className={cn("h-full w-full object-cover", className)} />;
  }
  const emptyBody = (
    <>
      <ImageOff className="h-5 w-5" aria-hidden />
      <span className="text-[10px] uppercase tracking-eyebrow">No photo yet</span>
      {actionHref ? (
        <span className="mt-1 text-xs font-medium text-foreground underline underline-offset-4">
          {actionLabel}
        </span>
      ) : null}
    </>
  );

  if (actionHref) {
    return (
      <Link
        href={actionHref}
        aria-label={`${alt} — ${actionLabel}`}
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 border border-border bg-secondary/40 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
          className,
        )}
      >
        {emptyBody}
      </Link>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt} — no photo uploaded yet`}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 border border-border bg-secondary/40 text-muted-foreground",
        className,
      )}
    >
      {emptyBody}
    </div>
  );
}

export function listingTitle(item: OwnerManagedProperty) {
  return item.listing?.title ?? item.listingDetail?.title ?? item.property.address;
}

export function listingLocation(item: OwnerManagedProperty) {
  return item.listing?.property.address ?? item.listingDetail?.location ?? item.property.address;
}

export function PrototypeNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-primary/20 bg-primary/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-full bg-white p-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{body}</p>
        </div>
      </div>
    </div>
  );
}

export function FilterPills({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-colors",
            value === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function OwnerPropertyCard({
  item,
  onPause,
}: {
  item: OwnerManagedProperty;
  onPause?: () => void;
}) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-none">
      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative h-52 bg-secondary lg:h-full">
          <PropertyThumbnail url={propertyImageUrl(item)} alt={listingTitle(item)} />
        </div>
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={item.listing ? listingStatusLabel(item.listing.status) : "No listing"}
                  variant={item.listing ? listingStatusVariant(item.listing.status) : "outline"}
                />
                <StatusBadge
                  label={item.property.type.replaceAll("_", " ")}
                  variant="secondary"
                />
                {item.listing?.property.documentsVerifiedAt ? (
                  <StatusBadge label="Property verified" variant="success" />
                ) : (
                  <StatusBadge label="Verification pending" variant="warning" />
                )}
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {item.listing?.title ?? item.property.address}
              </h3>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {item.property.address}
              </p>
              {item.pastListings && item.pastListings.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {item.pastListings.length} previous listing{item.pastListings.length === 1 ? "" : "s"} on this property
                </p>
              ) : null}
            </div>

            {item.listing ? (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Asking</p>
                <p className="text-lg font-semibold text-foreground">{formatNaira(item.listing.askingPrice)}</p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl bg-secondary/60 px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow">Beds</p>
              <p className="mt-2 text-base font-semibold text-foreground">{item.property.bedrooms ?? "N/A"}</p>
            </div>
            <div className="rounded-2xl bg-secondary/60 px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow">Baths</p>
              <p className="mt-2 text-base font-semibold text-foreground">{item.property.bathrooms ?? "N/A"}</p>
            </div>
            <div className="rounded-2xl bg-secondary/60 px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow">Size</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {item.property.sizeSqm ? `${item.property.sizeSqm} sqm` : "TBC"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/owner/properties/${item.property.id}`} className="inline-flex">
              <Button>View</Button>
            </Link>
            <Link href={`/owner/properties/${item.property.id}`} className="inline-flex">
              <Button variant="outline">Edit</Button>
            </Link>
            {item.listing ? (
              <Button variant="outline" onClick={onPause} disabled={item.listing.status === "CLOSED" || item.listing.status === "TAKEN_DOWN"}>
                {item.listing.status === "PAUSED" ? "Resume listing" : "Pause listing"}
              </Button>
            ) : (
              <Link href={`/owner/properties/new?propertyId=${item.property.id}`} className="inline-flex">
                <Button variant="outline">Create listing</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function groupOffersByThread(
  items: Awaited<ReturnType<typeof listOwnerOffers>>,
): Array<{ id: string; chain: typeof items; current: (typeof items)[number] | null }> {
  const byId = new Map(items.map((item) => [item.offer.id, item] as const));
  const groups = new Map<number, typeof items>();

  function rootId(item: (typeof items)[number]) {
    let current = item.offer;
    while (current.parentOfferId) {
      const parent = byId.get(current.parentOfferId)?.offer;
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }

  for (const item of items) {
    const key = rootId(item);
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }

  return [...groups.entries()]
    .map(([id, chain]) => {
      const sorted = [...chain].sort(
        (left, right) => new Date(left.offer.createdAt).getTime() - new Date(right.offer.createdAt).getTime(),
      );
      return {
        id: String(id),
        chain: sorted,
        current: sorted.at(-1) ?? null,
      };
    })
    .sort((left, right) => {
      const leftTime = left.current ? new Date(left.current.offer.updatedAt).getTime() : 0;
      const rightTime = right.current ? new Date(right.current.offer.updatedAt).getTime() : 0;
      return rightTime - leftTime;
    });
}

export function ownerNotificationCategory(kind: string) {
  if (kind.startsWith("INSPECTION")) return "inspections";
  if (kind.startsWith("OFFER")) return "offers";
  if (kind.startsWith("AGENT_ASSIGNMENT")) return "agent-activity";
  if (kind.startsWith("VERIFICATION") || kind.startsWith("LISTING_")) return "verification";
  return "general";
}

