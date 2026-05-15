"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { LISTINGS } from "@/lib/seed/listings";
import { useTranslations } from "@/lib/i18n/provider";
import { ListingCard } from "@/components/listing/listing-card";
import { iconForListingType, iconForPropertyType } from "@/components/public/listing-pill-defs";
import { useLandingScrollReveal } from "@/lib/landing-motion";
import { SectionHeading } from "./section-heading";
import { FilterPills } from "./filter-pills";

/**
 * Section 02: Listings preview grid.
 */
export function ListingsPreview() {
  const { t } = useTranslations();
  const featured = LISTINGS.slice(0, 6);
  const story = useLandingScrollReveal(1);

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
      href: "/listings?listingType=RENT",
      icon: iconForListingType("RENT"),
    },
    {
      value: "SALE",
      label: t.listingsPreview.filters.sale,
      href: "/listings?listingType=SALE",
      icon: iconForListingType("SALE"),
    },
    {
      value: "COMMERCIAL",
      label: t.listingsPreview.filters.commercial,
      href: "/listings?propertyType=COMMERCIAL",
      icon: iconForPropertyType("COMMERCIAL"),
    },
  ];

  const typePills = [
    {
      value: "APARTMENT",
      label: t.listingsPreview.filters.apartment,
      href: "/listings?propertyType=APARTMENT",
      icon: iconForPropertyType("APARTMENT"),
    },
    {
      value: "HOUSE",
      label: t.listingsPreview.filters.house,
      href: "/listings?propertyType=HOUSE",
      icon: iconForPropertyType("HOUSE"),
    },
    {
      value: "VILLA",
      label: t.listingsPreview.filters.villa,
      href: "/listings?propertyType=VILLA",
      icon: iconForPropertyType("VILLA"),
    },
    {
      value: "SHORTLET",
      label: t.listingsPreview.filters.shortlet,
      href: "/listings?listingType=RENT",
      icon: iconForPropertyType("SHORTLET"),
    },
    {
      value: "LAND",
      label: t.listingsPreview.filters.land,
      href: "/listings",
      icon: iconForPropertyType("LAND"),
    },
  ];

  return (
    <motion.section className="container py-20 md:py-28" {...story}>
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

      <div className="mt-12 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((listing) => (
          <ListingCard key={listing.id} listing={listing} variant="overlay" />
        ))}
      </div>
    </motion.section>
  );
}
