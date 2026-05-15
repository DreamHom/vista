import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  CompactListingTile,
  EmptyHint,
  PrimaryCtaRow,
  PublicApiNotice,
} from "@/components/public/public-components";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { buildQueryString } from "@/lib/query-string";
import { formatNaira } from "@/lib/format";
import { getCompareListings, getSuggestedCompareListings, type PublicListing } from "@/lib/seed/public-data";

export const metadata: Metadata = {
  title: "Compare Listings",
  description: "Compare up to three DreamHomes listings side by side before you decide which inspection to book.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare listings · DreamHomes",
    description: "Compare up to three DreamHomes listings side by side before you decide which inspection to book.",
    url: "/compare",
  },
};

interface CompareSearchParams {
  ids?: string | string[];
  lookup?: string;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<CompareSearchParams>;
}) {
  const params = await searchParams;
  const selectedIds = normalizeIds(params.ids);
  const listings = await getCompareListings(selectedIds);
  const suggestions = (await getSuggestedCompareListings(params.lookup)).filter(
    (listing) => !selectedIds.includes(listing.id),
  );

  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Compare Listings</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          Put the shortlist side by side before you spend time on inspections.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Compare up to three properties across price, fees, availability, verification, and the reputation of the agent attached to the listing.
        </p>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[320px_1fr]">
        <aside className="h-fit border border-border bg-card p-5">
          <h2 className="font-semibold tracking-tight">Search to add</h2>
          <form action="/compare" className="mt-5 flex gap-2">
            {selectedIds.map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <input
              type="text"
              name="lookup"
              defaultValue={params.lookup ?? ""}
              placeholder="Lekki, penthouse, family..."
              className="h-11 min-w-0 flex-1 border border-border bg-background px-3 text-foreground outline-none"
            />
            <button type="submit" className={buttonVariants({ variant: "outline", size: "md" })}>
              <Search className="h-4 w-4" aria-hidden />
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {suggestions.slice(0, 6).map((listing) => (
              <div key={listing.id} className="border border-border p-3">
                <p className="font-medium text-foreground">{listing.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{listing.location}</p>
                <Link
                  href={`/compare?${buildQueryString({ ids: selectedIds, lookup: params.lookup }, { ids: [...selectedIds, listing.id].slice(0, 3) })}`}
                  className="mt-3 inline-flex text-sm font-medium text-accent hover:text-accent/80"
                >
                  Add to compare
                </Link>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          {suggestions.length === 0 && listings.length === 0 ? (
            <PublicApiNotice>
              Haven compare suggestions are empty at `{process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api"}` right now.
            </PublicApiNotice>
          ) : null}
          {listings.length === 0 ? (
            <EmptyHint
              title="Pick two or three listings to compare."
              body="Start with a search on the left, add the listings that feel closest, and DreamHomes will line up the most important differences in one view."
            />
          ) : (
            <>
              <div className={`grid gap-4 ${listings.length === 1 ? "xl:grid-cols-1" : listings.length === 2 ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>
                {listings.map((listing) => (
                  <ComparisonColumn
                    key={listing.id}
                    listing={listing}
                    removeHref={`/compare?${buildQueryString({ ids: selectedIds, lookup: params.lookup }, { ids: selectedIds.filter((id) => id !== listing.id) })}`}
                  />
                ))}
              </div>

              <section className="overflow-x-auto border border-border bg-card">
                <table className="min-w-full text-sm">
                  <tbody>
                    <CompareRow label="Price" listings={listings} getValue={(listing) => formatNaira(listing.priceNgn)} />
                    <CompareRow label="Location" listings={listings} getValue={(listing) => listing.location} />
                    <CompareRow label="Bedrooms" listings={listings} getValue={(listing) => String(listing.bedrooms ?? "N/A")} />
                    <CompareRow label="Bathrooms" listings={listings} getValue={(listing) => String(listing.bathrooms ?? "N/A")} />
                    <CompareRow label="Size" listings={listings} getValue={(listing) => `${listing.sizeSqm ?? "N/A"} sqm`} />
                    <CompareRow label="Caution fee" listings={listings} getValue={(listing) => (listing.cautionFeeNgn ? formatNaira(listing.cautionFeeNgn) : "None")} />
                    <CompareRow label="Service charge" listings={listings} getValue={(listing) => (listing.serviceChargeNgn ? formatNaira(listing.serviceChargeNgn) : "None")} />
                    <CompareRow label="Availability" listings={listings} getValue={(listing) => listing.availableFrom} />
                    <CompareRow label="Verification" listings={listings} getValue={(listing) => (listing.verified ? "Verified" : "Pending")} />
                    <CompareRow
                      label="Agent rating"
                      listings={listings}
                      getValue={(listing) =>
                        listing.agent
                          ? listing.agent.averageRating !== null
                            ? `${listing.agent.averageRating.toFixed(1)} / 5`
                            : "No rating yet"
                          : "Owner-managed"
                      }
                    />
                  </tbody>
                </table>
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ComparisonColumn({
  listing,
  removeHref,
}: {
  listing: PublicListing;
  removeHref: string;
}) {
  return (
    <section className="border border-border bg-card p-4">
      <CompactListingTile listing={listing} ctaLabel="View full listing" />
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline">{listing.term === "RENT" ? "Rent" : "Sale"}</Badge>
      </div>
      <div className="mt-5">
        <PrimaryCtaRow
          scheduleListingId={listing.id}
          scheduleHref={`/signup?next=/listings/${listing.id}`}
          contactHref={`/listings/${listing.id}`}
        />
      </div>
      <Link href={removeHref} className="mt-4 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
        Remove listing
      </Link>
    </section>
  );
}

function CompareRow({
  label,
  listings,
  getValue,
}: {
  label: string;
  listings: PublicListing[];
  getValue: (listing: PublicListing) => string;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <th className="bg-secondary/40 px-4 py-3 text-left font-medium text-foreground">{label}</th>
      {listings.map((listing) => (
        <td key={`${label}-${listing.id}`} className="px-4 py-3 text-muted-foreground">
          {getValue(listing)}
        </td>
      ))}
    </tr>
  );
}

function normalizeIds(value?: string | string[]) {
  const ids = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(new Set(ids)).slice(0, 3);
}
