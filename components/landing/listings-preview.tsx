"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/lib/i18n/provider";
import { ListingDiscoveryCard, PublicApiNotice } from "@/components/public/public-components";
import { iconForListingType, iconForPropertyType } from "@/components/public/listing-pill-defs";
import type { PublicListing } from "@/lib/seed/public-data";
import { buildListingsBrowseHref } from "@/lib/query-string";
import { SectionHeading } from "./section-heading";
import { FilterPills } from "./filter-pills";

/**
 * Section 02: Listings preview grid — live Haven inventory via {@link PublicListing}
 * and the same discovery cards as `/listings`.
 */
export function ListingsPreview({
  listings,
  backendUnavailable,
}: {
  listings: PublicListing[];
  backendUnavailable: boolean;
}) {
  const { t } = useTranslations();

  const termPills = [
    {
      value: "all",
      label: t.listingsPreview.filters.all,
      href: "/listings",
      icon: iconForListingType(""),
    },
    {
      value: "RENT",
      label: t.listingsPreview.filters.rent,
      href: buildListingsBrowseHref({ listingType: "RENT" }),
      icon: iconForListingType("RENT"),
    },
    {
      value: "SALE",
      label: t.listingsPreview.filters.sale,
      href: buildListingsBrowseHref({ listingType: "SALE" }),
      icon: iconForListingType("SALE"),
    },
    {
      value: "COMMERCIAL",
      label: t.listingsPreview.filters.commercial,
      href: buildListingsBrowseHref({ propertyType: "COMMERCIAL" }),
      icon: iconForPropertyType("COMMERCIAL"),
    },
  ];

  const typePills = [
    {
      value: "APARTMENT",
      label: t.listingsPreview.filters.apartment,
      href: buildListingsBrowseHref({ propertyType: "APARTMENT" }),
      icon: iconForPropertyType("APARTMENT"),
    },
    {
      value: "HOUSE",
      label: t.listingsPreview.filters.house,
      href: buildListingsBrowseHref({ propertyType: "HOUSE" }),
      icon: iconForPropertyType("HOUSE"),
    },
    {
      value: "VILLA",
      label: t.listingsPreview.filters.villa,
      href: buildListingsBrowseHref({ propertyType: "VILLA" }),
      icon: iconForPropertyType("VILLA"),
    },
    {
      value: "SHORTLET",
      label: t.listingsPreview.filters.shortlet,
      href: buildListingsBrowseHref({ listingType: "RENT", q: "shortlet" }),
      icon: iconForPropertyType("SHORTLET"),
    },
    {
      value: "LAND",
      label: t.listingsPreview.filters.land,
      href: buildListingsBrowseHref({ propertyType: "LAND" }),
      icon: iconForPropertyType("LAND"),
    },
  ];

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading
        title={t.listingsPreview.title}
        supporting={t.listingsPreview.supporting}
        action={
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent"
          >
            {t.listingsPreview.seeAll}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <div className="mt-10 flex flex-col gap-3">
        <FilterPills options={termPills} selected="all" size="md" />
        <FilterPills options={typePills} size="sm" />
      </div>

      {backendUnavailable ? (
        <div className="mt-8">
          <PublicApiNotice>
            We couldn&apos;t reach the listings service right now, so this section is empty. Try again shortly or open
            the full directory — your filters still work from there.
          </PublicApiNotice>
        </div>
      ) : null}

      {listings.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {listings.map((listing) => (
            <ListingDiscoveryCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : !backendUnavailable ? (
        <p className="mt-12 text-sm text-muted-foreground">No published listings yet — check back soon.</p>
      ) : null}
    </section>
  );
}
