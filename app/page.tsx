import type { Metadata } from "next";
import { PublicFooter } from "@/components/layout/public-footer";
import { Hero } from "@/components/landing/hero";
import { ListingsPreview } from "@/components/landing/listings-preview";
import { ValueProposition } from "@/components/landing/value-proposition";
import { ShortsVideo } from "@/components/landing/shorts-video";
import { FeaturedListing } from "@/components/landing/featured-listing";
import { Services } from "@/components/landing/services";
import { I18nProvider } from "@/lib/i18n/provider";
import { searchListings } from "@/lib/seed/public-data";
import { fallbackListingPhoto } from "@/lib/seed/photos";

/** Home uses an absolute title so the root `title.template` is not applied twice in SERPs. */
export const metadata: Metadata = {
  title: {
    absolute: "DreamHomes — verified homes for rent & sale in Lagos & Abuja",
  },
  description:
    "Browse verified rentals and sales, compare listings on a map, meet rated agents, and use Dream AI to narrow your search across Lagos, Abuja, and nearby corridors.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DreamHomes — verified homes for rent & sale in Lagos & Abuja",
    description:
      "Browse verified rentals and sales, compare listings, and use Dream AI across Lagos and Abuja.",
    url: "/",
  },
  twitter: {
    title: "DreamHomes — verified homes for rent & sale in Lagos & Abuja",
    description: "Browse verified rentals and sales across Lagos and Abuja.",
  },
};

/**
 * Landing page composition.
 *
 * Wrapped in `<I18nProvider>`: the EN/YO/IG/HA language toggle in the hero
 * lives below this provider and pipes the chosen locale through every
 * section. Translations are scoped to the landing page only (see
 * `lib/i18n/dictionary.ts`).
 *
 * Note: the landing page deliberately skips the global `<PublicHeader />`;
 * the hero's right column carries the brand mark + nav inline, matching the
 * editorial reference. Inner public routes (/listings, etc.) use the
 * standalone header.
 */
export default async function HomePage() {
  const { listings, backendUnavailable } = await searchListings({ page: "1", sort: "newest" }, 10);
  const previewListings = listings.slice(0, 6);
  const featuredListing = listings[0] ?? null;
  const shortsPosters = Array.from({ length: 5 }, (_, i) => {
    const photo = listings[i]?.photos[0];
    return photo ?? fallbackListingPhoto(`landing-shorts-${i}`, { w: 960, ratio: "4:3", q: 88 }, i);
  });

  return (
    <I18nProvider>
      <main>
        <Hero />
        <ListingsPreview listings={previewListings} backendUnavailable={backendUnavailable} />
        <ValueProposition />
        <ShortsVideo posters={shortsPosters} />
        <FeaturedListing listing={featuredListing} />
        <Services />
      </main>
      <PublicFooter />
    </I18nProvider>
  );
}
