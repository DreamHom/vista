import { PublicFooter } from "@/components/layout/public-footer";
import { Hero } from "@/components/landing/hero";
import { ListingsPreview } from "@/components/landing/listings-preview";
import { ValueProposition } from "@/components/landing/value-proposition";
import { ShortsVideo } from "@/components/landing/shorts-video";
import { FeaturedListing } from "@/components/landing/featured-listing";
import { Services } from "@/components/landing/services";
import { I18nProvider } from "@/lib/i18n/provider";

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
export default function HomePage() {
  return (
    <I18nProvider>
      <main>
        <Hero />
        <ListingsPreview />
        <ValueProposition />
        <ShortsVideo />
        <FeaturedListing />
        <Services />
      </main>
      <PublicFooter />
    </I18nProvider>
  );
}
