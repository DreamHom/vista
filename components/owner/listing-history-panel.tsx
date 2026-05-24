"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatNaira } from "@/lib/format";
import { formatDate } from "@/components/dashboard/utils";
import {
  listingOfferLabel,
  listingStatusLabel,
  listingStatusVariant,
} from "@/lib/listing-lifecycle";
import type { OwnerListingBundle } from "@/lib/owner-dashboard";

export function ListingHistoryPanel({
  propertyId,
  history,
}: {
  propertyId: number;
  history: OwnerListingBundle[];
}) {
  if (history.length === 0) return null;

  return (
    <section className="space-y-3 border border-border bg-card p-4 md:p-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Previous listings on this property</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Each row is a separate offer on the same address. Property facts stay; price and availability change per
          listing.
        </p>
      </div>
      <ul className="divide-y divide-border border border-border">
        {history.map((row) => (
          <li key={row.listing.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-foreground">{row.listing.title ?? `Listing #${row.listing.id}`}</p>
              <p className="text-sm text-muted-foreground">
                {listingOfferLabel(row.listing)} · Listed {formatDate(row.listing.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                label={listingStatusLabel(row.listing.status)}
                variant={listingStatusVariant(row.listing.status)}
              />
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatNaira(row.listing.askingPrice)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Need another offer on this address?{" "}
        <Link href={`/owner/properties/new?propertyId=${propertyId}`} className="text-accent underline-offset-4 hover:underline">
          Create a new listing
        </Link>
        .
      </p>
    </section>
  );
}
