"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { LISTINGS } from "@/lib/seed/listings";
import { photoUrl } from "@/lib/seed/photos";
import { useTranslations } from "@/lib/i18n/provider";
import { interpolate } from "@/lib/i18n/dictionary";

/**
 * Section 05: Featured listing (side-by-side asymmetric).
 */
export function FeaturedListing() {
  const { t } = useTranslations();
  const listing = LISTINGS[0];
  const heroPhoto = listing.photos[0];
  const thumbs = Array.from(
    { length: 4 },
    (_, i) => listing.photos[i % listing.photos.length],
  );

  return (
    <section className="container py-20 md:py-28">
      <div className="relative overflow-hidden border border-border">
        <div className="relative overflow-hidden">
          <Image
            src={photoUrl(heroPhoto, { w: 1600, ratio: "3:2" })}
            alt={heroPhoto.alt}
            fill
            unoptimized
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />

          <div className="relative z-10 flex min-h-[42rem] items-end p-4 md:min-h-[46rem] md:p-6 lg:items-center lg:p-8 xl:min-h-[50rem] xl:p-10">
            <div className="w-full max-w-[34rem] border border-border bg-white p-6 text-foreground md:p-8 lg:p-10">
              <div className="flex flex-col gap-7">
                <span className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                  {t.featured.eyebrow}
                </span>

                <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-tight md:text-5xl">
                  {listing.title}
                </h2>

                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                    <span className="leading-none">4.8 / 5.0</span>
                  </span>
                  <span aria-hidden>·</span>
                  <span className="leading-none">{interpolate(t.featured.reviews, { n: "128" })}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="leading-none text-foreground">{listing.location}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {thumbs.map((photo, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden border border-border bg-muted">
                      <Image
                        src={photoUrl(photo, { w: 200, ratio: "1:1" })}
                        alt={photo.alt}
                        fill
                        unoptimized
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                <Link
                  href={`/listings/${listing.id}`}
                  className="inline-flex items-center gap-2 self-start text-sm font-medium text-foreground transition-colors hover:text-accent"
                >
                  {t.featured.viewListing}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
