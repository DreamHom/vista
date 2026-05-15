import type { Metadata } from "next";
import Link from "next/link";
import { MapPageExplorer, type PublicMapPin } from "@/components/public/map-page-explorer";
import { CompactListingTile, PublicApiNotice } from "@/components/public/public-components";
import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { buildQueryString } from "@/lib/query-string";
import { getListingById, searchListings, type ListingSearchInput } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Map View",
  description: "Explore DreamHomes listings through a map-first discovery surface with quick filters and listing previews.",
  alternates: { canonical: "/map" },
  openGraph: {
    title: "Map view · DreamHomes",
    description: "Explore DreamHomes listings through a map-first discovery surface with quick filters and listing previews.",
    url: "/map",
  },
};

interface MapSearchParams extends ListingSearchInput {
  selected?: string;
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<MapSearchParams>;
}) {
  const params = await searchParams;
  const { listings, backendUnavailable } = await searchListings(params, 12);
  const effectiveSelected = params.selected ?? listings[0]?.id ?? "";
  const selected = await getListingById(effectiveSelected);

  const pins: PublicMapPin[] = listings.map((listing) => ({
    id: listing.id,
    latitude: listing.latitude,
    longitude: listing.longitude,
    title: listing.title,
    priceLabel: formatNaira(listing.priceNgn, { compact: true }),
    term: listing.term,
    href: `/map?${buildQueryString(params as Record<string, string | string[] | undefined>, { selected: listing.id })}`,
    selected: listing.id === effectiveSelected,
  }));

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="container py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-white/60">Map View</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Discover listings through the map.</h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white",
              )}
            >
              Map
            </span>
            <Link
              href="/listings"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              List view
            </Link>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <aside className="z-10 h-fit border border-white/10 bg-slate-900/95 p-5 backdrop-blur">
            <h2 className="font-semibold tracking-tight text-white">Map filters</h2>
            <form action="/map" className="mt-5 space-y-4">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Location
                <input
                  type="text"
                  name="location"
                  defaultValue={params.location ?? ""}
                  className="h-11 border border-white/10 bg-slate-950 px-3 text-white outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Property type
                <select
                  name="propertyType"
                  defaultValue={params.propertyType ?? ""}
                  className="h-11 w-full border border-white/10 bg-slate-950 pl-3 pr-11 text-white outline-none"
                >
                  <option value="">All types</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </label>
              <label className="flex items-center gap-3 border border-white/10 px-3 py-3 text-sm text-white">
                <input type="checkbox" name="verified" value="true" defaultChecked={params.verified === "true"} />
                Verified only
              </label>
              <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full")}>
                Update map
              </button>
            </form>
          </aside>

          <section className="relative flex flex-col gap-3">
            <div className="relative z-10">
              <PublicApiNotice>
                {backendUnavailable
                  ? `Haven listing browse is unavailable at ${process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api"}.`
                  : "Pins use approximate Lagos / Abuja coordinates for discovery until Haven publishes exact map geometry."}
              </PublicApiNotice>
            </div>

            <MapPageExplorer pins={pins} />

            {selected ? (
              <div className="border border-white/10 bg-slate-900/95 p-4 backdrop-blur xl:max-w-xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="border border-white/10 px-2.5 py-1 text-xs uppercase tracking-eyebrow text-white/70">
                    {selected.term === "RENT" ? "For rent" : "For sale"}
                  </span>
                </div>
                <CompactListingTile listing={selected} ctaLabel="View listing" />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
