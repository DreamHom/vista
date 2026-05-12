import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";

export const metadata: Metadata = {
  title: "Browse listings",
  description: "Verified rentals and sales across Lagos and Abuja.",
};

type SearchParams = {
  city?: string;
  area?: string;
  purpose?: "RENT" | "SALE";
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  type?: string;
  page?: string;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Number(sp.page ?? 0);

  let listings: ReturnType<typeof listingFromApi>[] = [];
  let totalElements = 0;
  let totalPages = 1;
  let error: string | null = null;

  try {
    const data = await Listings.listListings({
      page,
      size: 24,
      city: sp.city,
      area: sp.area,
      purpose: sp.purpose,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      bedrooms: sp.bedrooms ? Number(sp.bedrooms) : undefined,
      type: sp.type,
    });
    listings = data.content.map((l) => listingFromApi(l));
    totalElements = data.page.totalElements;
    totalPages = data.page.totalPages;
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load listings.";
  }

  return (
    <>
      <Section className="bg-bg-elevated border-b border-border">
        <div className="py-12">
          <Badge tone="brand" className="mb-3">
            {totalElements.toLocaleString()} live listings
          </Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
            Find a place that&rsquo;s actually available.
          </h1>
          <p className="mt-3 text-fg-muted max-w-2xl">
            Verified properties from owners and agents we&rsquo;ve checked. Sort
            by what matters: price, verification, response speed.
          </p>
          <div className="mt-8">
            <ListingFilters />
          </div>
        </div>
      </Section>

      <Section className="py-12">
        <SectionHeading
          title="All listings"
          description={`${totalElements.toLocaleString()} results · sorted by relevance`}
        />
        {listings.length === 0 ? (
          <div className="mt-8">
            {error ? (
              <EmptyState
                title="We can't reach the backend right now."
                description={error}
                icon={<Icon.Building size={20} />}
              />
            ) : (
              <EmptyState
                title="No listings match those filters yet."
                description="Try widening the price range or removing the area filter."
                icon={<Icon.Search size={20} />}
              />
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-12 flex items-center justify-center gap-2 text-sm"
          >
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <a
                key={p}
                href={`?page=${p}`}
                className={`h-9 min-w-9 inline-flex items-center justify-center rounded-full border px-3 ${
                  p === page
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-bg-elevated text-fg-muted hover:text-fg"
                }`}
              >
                {p + 1}
              </a>
            ))}
          </nav>
        ) : null}
      </Section>
    </>
  );
}
