/**
 * Curated listing collections.
 *
 * A collection is a *story-shaped* group of listings that belong together:
 * same neighbourhood, same vibe, same kind of buyer. The landing hero pulls
 * its cycling photos from ONE collection at a time so the rotation reads as
 * a coherent slideshow ("here is Lekki") rather than a random shuffle.
 *
 * Why this exists:
 *  - The PRD treats discovery as the front door of the product. The front
 *    door should feel curated, not algorithmic.
 *  - Each collection has a `story` field, the one-paragraph copy that runs
 *    underneath the hero photo (when we add it) or in the listings index
 *    section headers. It is *the* place to write voice copy.
 *  - Listings can appear in more than one collection (a Lekki villa is both
 *    "Lekki, modern Lagos" and "Family homes with pools"). That's fine.
 *
 * When haven exposes a real /listings endpoint, this structure becomes a
 * frontend-only concern; we'll fetch listings by tag/area and assemble
 * collections client-side from the data backend returns. The `story` and
 * the curation are still owned by the frontend.
 */

import { LISTINGS, type SeedListing } from "./listings";
import type { SeedPhoto } from "./photos";

export interface ListingCollection {
  /** Stable slug, used as React keys and as the URL slug when collections
      become browsable (e.g. `/listings/collection/lekki-modern`). */
  id: string;
  /** Headline-style title, sentence case, no period. */
  title: string;
  /** "Area · City" style geographical anchor for the caption stamp. */
  area: string;
  /** Country, rendered bold on line 1 of the hero caption. */
  country: string;
  /** State / capital territory, rendered on line 2 with the live clock. */
  state: string;
  /** IANA timezone, used by the hero's live clock to show local time. */
  timezone: string;
  /** One-paragraph story. Read it out loud: it should sound like a magazine
      cutline, not a marketing email. */
  story: string;
  /** IDs into LISTINGS. The first listing's first photo is treated as the
      anchor (LCP candidate) when the hero renders this collection. */
  listingIds: string[];
}

export const COLLECTIONS: readonly ListingCollection[] = [
  {
    id: "lekki-modern",
    title: "Lekki, modern Lagos",
    area: "Lekki Phase 1, Lagos",
    country: "Nigeria",
    state: "Lagos",
    timezone: "Africa/Lagos",
    story:
      "The new Lagos. Concrete villas with infinity pools, smart-wired " +
      "townhouses, and ocean-view towers on land that didn't exist a decade " +
      "ago. The postcode where the next generation of Nigerian wealth is " +
      "building.",
    listingIds: ["1", "7", "11", "5", "10"],
  },
  {
    id: "ikoyi-old-money",
    title: "Ikoyi & Banana Island, old money Lagos",
    area: "Old Ikoyi · Banana Island · Victoria Island, Lagos",
    country: "Nigeria",
    state: "Lagos",
    timezone: "Africa/Lagos",
    story:
      "Quiet streets, mature gardens, family compounds passed down through " +
      "generations. The Lagos that doesn't need to introduce itself. " +
      "Where the names on the gates have been there a while.",
    listingIds: ["2", "3", "6"],
  },
  {
    id: "abuja-power",
    title: "Abuja, power and quiet",
    area: "Maitama · Asokoro · Wuse 2, Abuja",
    country: "Nigeria",
    state: "Abuja",
    timezone: "Africa/Lagos",
    story:
      "Embassy Row residences, family compounds in Asokoro, and serviced " +
      "office suites in Wuse 2. The capital's enclaves, where decisions " +
      "get made between conversations.",
    listingIds: ["4", "8", "12"],
  },
];

/**
 * The collection the landing hero features by default. Eventually this can
 * rotate weekly via a cron job + revalidation, or come from a `featured`
 * flag on the backend. For now: lock to the first.
 */
export const FEATURED_COLLECTION_ID = "lekki-modern";

/** Look up a collection by id. Throws when the id is unknown, fail fast in dev. */
export function collection(id: string): ListingCollection {
  const found = COLLECTIONS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown collection: ${id}`);
  return found;
}

/** Hydrate a collection's listing IDs into full SeedListing objects. */
export function listingsOf(c: ListingCollection): SeedListing[] {
  return c.listingIds
    .map((id) => LISTINGS.find((l) => l.id === id))
    .filter((l): l is SeedListing => l != null);
}

/**
 * Flat list of every photo in a collection, in `listingIds` order. Each
 * listing contributes its photos in display order. This is what the hero
 * carousel iterates over for the main image.
 */
export function photosOf(c: ListingCollection): SeedPhoto[] {
  return listingsOf(c).flatMap((l) => l.photos);
}

/**
 * Split the collection's photos into N evenly-sized streams. Used to feed
 * the three thumb carousels in the hero; each stream gets a different
 * subset so all three thumbs show different photos at any given moment.
 * If there are fewer photos than `streams * minPerStream`, photos repeat
 * so every stream still has something to cycle through.
 */
export function photoStreams(
  c: ListingCollection,
  streams: number,
  minPerStream = 2,
): SeedPhoto[][] {
  const all = photosOf(c);
  if (all.length === 0) return Array.from({ length: streams }, () => []);

  const perStream = Math.max(minPerStream, Math.ceil(all.length / streams));
  return Array.from({ length: streams }, (_, i) => {
    const start = (i * perStream) % all.length;
    const slice: SeedPhoto[] = [];
    for (let j = 0; j < perStream; j++) {
      slice.push(all[(start + j) % all.length]);
    }
    return slice;
  });
}
