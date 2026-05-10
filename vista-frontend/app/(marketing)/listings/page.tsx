import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard } from "@/components/listings/listing-card";
import { Badge } from "@/components/ui/badge";
import { listings } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Browse listings",
  description: "Verified rentals and sales across Lagos and Abuja.",
};

export default function ListingsPage() {
  return (
    <>
      <Section className="bg-bg-elevated border-b border-border">
        <div className="py-12">
          <Badge tone="brand" className="mb-3">
            {listings.length} live listings
          </Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
            Find a place that&rsquo;s actually available.
          </h1>
          <p className="mt-3 text-fg-muted max-w-2xl">
            Verified properties from owners and agents we&rsquo;ve checked. Sort by what
            matters: price, verification, response speed.
          </p>
          <div className="mt-8">
            <ListingFilters />
          </div>
        </div>
      </Section>

      <Section className="py-12">
        <SectionHeading title="All listings" description={`${listings.length} results · sorted by relevance`} />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </Section>
    </>
  );
}
