/**
 * Curated Unsplash property photos for vista's seed data.
 *
 * Every photo here is verified to load from `images.unsplash.com` (free tier
 *: no premium "plus." photos). Use {@link photoUrl} to compose a fetched URL
 * with the right size + format params. We request **WebP** explicitly
 * (`fm=webp`) plus a high `q` so the CDN returns a sharp, lightweight file.
 *
 *   <Image src={photoUrl(p, { w: 800 })} … />
 *
 * SOURCE: Unsplash photographers (license: free for commercial + non-commercial
 * use). Attribution is appreciated but not required by their license. The
 * `slug` field is the photo's page slug at unsplash.com/photos/<slug>: keep
 * it so we can credit photographers later if we expand the listing detail
 * page to show "Photo by …".
 */

export type PhotoCategory =
  | "exterior-luxury" //  showpiece architecture, often with pool
  | "exterior-modern" //   clean modern facades / minimalist
  | "exterior-warm" //     warmer palette, garden, family vibe
  | "interior-living" //   living rooms / lounges
  | "interior-kitchen" //  kitchens / dining
  | "interior-bedroom" //  bedrooms
  | "landscape" //         pools, gardens, outdoor scenes
  ;

export interface SeedPhoto {
  /** Unsplash long-form ID: `images.unsplash.com/photo-{id}`. */
  id: string;
  /** Page slug at `unsplash.com/photos/{slug}`. */
  slug: string;
  alt: string;
  category: PhotoCategory;
}

export const PHOTOS: readonly SeedPhoto[] = [
  // ── Luxury exteriors (heroes / featured cards) ─────────────────────────
  {
    id: "1505843513577-22bb7d21e455",
    slug: "RKdLlTyjm5g",
    alt: "Modern white and black house lit at twilight",
    category: "exterior-luxury",
  },
  {
    id: "1531971589569-0d9370cbe1e5",
    slug: "kUdbEEMcRwE",
    alt: "Lighted house beside trees at night",
    category: "exterior-luxury",
  },
  {
    id: "1564013799919-ab600027ffc6",
    slug: "g39p1kDjvSY",
    alt: "Bright minimalist white concrete villa",
    category: "exterior-luxury",
  },
  {
    id: "1691425700585-c108acad6467",
    slug: "Is9zywNUhKg",
    alt: "Large white residence with wooden double doors",
    category: "exterior-luxury",
  },

  // ── Modern exteriors (cards) ───────────────────────────────────────────
  {
    id: "1523217582562-09d0def993a6",
    slug: "4ojhpgKpS68",
    alt: "Minimalist white concrete house framed by green tree",
    category: "exterior-modern",
  },
  {
    id: "1635006459494-c9b9665a666e",
    slug: "SU4rZo7STQA",
    alt: "Modern home with stepped walkway and clean lines",
    category: "exterior-modern",
  },
  // ── Warmer exteriors (suburban / family / classic) ─────────────────────
  {
    id: "1513584684374-8bab748fbf90",
    slug: "yFV39g6AZ5o",
    alt: "Two-storey suburban house in a tidy landscape",
    category: "exterior-warm",
  },
  {
    id: "1591474200742-8e512e6f98f8",
    slug: "EMPLSuvDuhQ",
    alt: "White and brown wooden country house under blue sky",
    category: "exterior-warm",
  },

  // ── Pool / landscape (showcase + tropical) ─────────────────────────────
  {
    id: "1512917774080-9991f1c4c750",
    slug: "2d4lAQAlbDA",
    alt: "Modern villa overlooking infinity pool",
    category: "exterior-luxury",
  },
  {
    id: "1706808849780-7a04fbac83ef",
    slug: "WaC-JFfF21M",
    alt: "Modern poolside with lounge chairs and cabana",
    category: "landscape",
  },
  {
    id: "1544984243-ec57ea16fe25",
    slug: "so3wgJLwDxo",
    alt: "Pool by a house at golden hour",
    category: "landscape",
  },
  {
    id: "1693837851506-93d3d01d4f44",
    slug: "SILeB6CB8f0",
    alt: "Tropical home with palm trees and bougainvillea",
    category: "landscape",
  },

  // ── Interior: living rooms ────────────────────────────────────────────
  {
    id: "1502672260266-1c1ef2d93688",
    slug: "3wylDrjxH-E",
    alt: "Gray fabric loveseat by warm wooden table",
    category: "interior-living",
  },
  {
    id: "1583847268964-b28dc8f51f92",
    slug: "OtXADkUh3-I",
    alt: "Warm living room flooded with natural light",
    category: "interior-living",
  },
  {
    id: "1585128792020-803d29415281",
    slug: "aX1TTOuq83M",
    alt: "Brown wooden coffee table beside a gray sofa",
    category: "interior-living",
  },
  {
    id: "1665249934445-1de680641f50",
    slug: "AgK_XAqSbfk",
    alt: "Bright living room with floor-to-ceiling window",
    category: "interior-living",
  },
  {
    id: "1613575831056-0acd5da8f085",
    slug: "xtDpXi_a-YQ",
    alt: "Black leather sofa under a tall picture window",
    category: "interior-living",
  },

  // ── Interior: kitchen / dining ────────────────────────────────────────
  {
    id: "1706808886508-e21834b4672c",
    slug: "pGPAinRjNVk",
    alt: "Long kitchen island with bar stools",
    category: "interior-kitchen",
  },
  {
    id: "1675279200694-8529c73b1fd0",
    slug: "8PKGjZ2GzuQ",
    alt: "Sun-lit kitchen with dining table and chairs",
    category: "interior-kitchen",
  },

  // ── Interior: bedroom ─────────────────────────────────────────────────
  {
    id: "1512918728675-ed5a9ecdebfd",
    slug: "FqqiAvJejto",
    alt: "Brown wooden bed frame with white linens",
    category: "interior-bedroom",
  },
];

export interface PhotoUrlOptions {
  /** Width in CSS pixels. Unsplash CDN scales server-side. */
  w?: number;
  /** Quality 1–100. Defaults to 85 for sharp WebP. */
  q?: number;
  /** Aspect-ratio crop: `4:3` for cards, `3:2` for hero etc. Optional. */
  ratio?: "1:1" | "4:5" | "4:3" | "3:2" | "16:9" | "21:9";
  /** Image format. Defaults to `webp`. */
  fm?: "webp" | "jpg" | "avif";
}

/**
 * Compose an Unsplash CDN URL for a seed photo. Unsplash applies the
 * transformation server-side and returns the optimized output.
 */
export function photoUrl(photo: Pick<SeedPhoto, "id">, options: PhotoUrlOptions = {}): string {
  const { w = 1200, q = 85, ratio, fm = "webp" } = options;
  const params = new URLSearchParams({
    w: String(w),
    q: String(q),
    fm,
    fit: "crop",
  });
  if (ratio) params.set("ar", ratio);
  return `https://images.unsplash.com/photo-${photo.id}?${params.toString()}`;
}

function hashKey(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function fallbackListingPhoto(
  key: string,
  options: PhotoUrlOptions = {},
  offset = 0,
): {
  id: string;
  url: string;
  alt: string;
} {
  const seed = PHOTOS[(hashKey(key) + offset) % PHOTOS.length] ?? PHOTOS[0];
  return {
    id: `fallback-${seed.id}-${offset}`,
    url: photoUrl(seed, options),
    alt: seed.alt,
  };
}
