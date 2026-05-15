# Listing collections

The curated, story-shaped groupings of listings that power the landing
page hero (and, later, the listings-index section headers). A collection
is to the frontend what the **personas** are to haven: a stable answer to
*"what story is this surface telling?"*

If you're touching anything that displays multiple listings together —
the hero carousel, the "neighbourhoods you might like" rail on the
listings index, the recommendations on the listing detail — start here.

## Why this folder exists

Discovery is the front door of the product. Every photo on the front
door should feel **picked**, not shuffled. A collection bundles four
things:

- A **slug** (`lekki-modern`) — stable, kebab-case, slot for a future URL.
- A **title** — what we call the collection in headers.
- An **area** — the geographical anchor for the caption stamp.
- A **story** — the one-paragraph voice copy. This is *the* place to write
  voice. Read it out loud. It should sound like a magazine cutline.
- A list of **listing IDs** — the curated set.

A listing can appear in multiple collections. A Lekki villa is both *"Lekki —
modern Lagos"* and *"Family homes with pools"*. That's fine; the collection
is a perspective on the catalog, not a partition of it.

## The cast (today)

| Collection | Area | Listings (count) |
|---|---|---|
| [`lekki-modern`](./collections/lekki-modern.md) | Lekki Phase 1, Lagos | 5 |
| [`ikoyi-old-money`](./collections/ikoyi-old-money.md) | Old Ikoyi · Banana Island · VI, Lagos | 3 |
| [`abuja-power`](./collections/abuja-power.md) | Maitama · Asokoro · Wuse 2, Abuja | 3 |

The featured collection (used by the landing hero today) is `lekki-modern`.
Swap by changing `FEATURED_COLLECTION_ID` in
[`lib/seed/collections.ts`](../lib/seed/collections.ts).

## How the data is shaped

```ts
interface ListingCollection {
  id: string;          // slug, stable
  title: string;       // headline-style, sentence case, no period
  area: string;        // "Neighbourhood, City" caption stamp
  story: string;       // one paragraph of voice copy
  listingIds: string[]; // ordered — the first is the anchor (LCP photo)
}
```

Helpers in `lib/seed/collections.ts`:

| Helper | What it returns |
|---|---|
| `collection(id)` | The collection or throws (fail-fast in dev) |
| `listingsOf(c)` | Full `SeedListing[]` hydrated from `listingIds` |
| `photosOf(c)` | Flat `SeedPhoto[]` across all listings, in order |
| `photoStreams(c, n)` | `n` photo arrays for parallel carousels |

## How the landing hero uses this

[`components/landing/hero.tsx`](../components/landing/hero.tsx):

```ts
const featured = collection(FEATURED_COLLECTION_ID);
const heroPhotos = photosOf(featured);          // main carousel
const thumbStreams = photoStreams(featured, 3); // 3 thumb carousels
```

Every photo the user sees rotating in the hero — main + all three thumbs —
comes from **one** collection. Switching collections (or letting them
rotate weekly) is a `FEATURED_COLLECTION_ID` change, nothing else.

## Mapping to haven's data model

When the real `/listings` endpoint is in production, collections become a
frontend assembly over real data:

| Frontend concept | Haven equivalent |
|---|---|
| `SeedListing.id` | `ListingResponse.id` (`int64`) |
| `SeedListing.priceNgn` | `ListingResponse.askingPrice` |
| `SeedListing.term` | `ListingResponse.listingType` (RENT \| SALE) |
| `SeedListing.type` | `ListingResponse.property.type` |
| `SeedListing.location` | `ListingResponse.property.address` |
| `SeedListing.bedrooms` etc. | `ListingResponse.property.bedrooms` etc. |
| `SeedListing.photos` | `ListingPhotoResponse[]` from `/listings/{id}/photos` |
| `SeedListing.verified` | derived from `property.documentsVerifiedAt != null` |

The collection metadata (title, area, story, curation) stays
frontend-only — collections are an editorial product, not a backend
domain. When we want them dynamic, the move is to publish a small JSON
file (or a CMS entry) and read it at build time, not to add a
`/collections` endpoint to haven.

## Status legend

- ✅ **Featured** — currently used as the hero's default collection
- 🟡 **Defined** — present in `collections.ts`, available for hero rotation
- ⬜ **Future** — sketched in this README, no entry in code yet

## Future collections (sketched, not built)

- `family-pools` — listings across Lekki and Ikoyi that share the "kids in
  the water by 4pm" feel.
- `first-time-renters` — affordable Surulere, Yaba, Ikorodu. Speaks to
  [Temi](../haven/docs/users/temi-the-first-timer.md).
- `agent-managed` — listings handled by verified agents. Speaks to
  [Biodun](../haven/docs/users/biodun-the-developer.md) and
  [Emeka](../haven/docs/users/emeka-the-hustling-agent.md).
- `verified-only` — every listing carries the strict property-documents
  verified badge. Speaks to [Ngozi](../haven/docs/users/ngozi-the-skeptic.md)'s
  trust threshold.
