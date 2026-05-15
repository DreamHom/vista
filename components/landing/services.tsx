"use client";

import Image from "next/image";
import { ClipboardList, Receipt, ShieldCheck } from "lucide-react";
import { LISTINGS } from "@/lib/seed/listings";
import { photoUrl } from "@/lib/seed/photos";
import { useTranslations } from "@/lib/i18n/provider";
import { NumberedStep } from "./numbered-step";

const NUMBERS = ["01", "02", "03"] as const;

const SERVICE_VISUALS = [
  <ShieldCheck key="svc-1" aria-hidden />,
  <Receipt key="svc-2" aria-hidden />,
  <ClipboardList key="svc-3" aria-hidden />,
] as const;
// Keep the left strip tight and editorial: 3 stacked frames that share the
// same composed height as the main image beside them.
const COLLAGE_LISTINGS = [LISTINGS[2], LISTINGS[3], LISTINGS[4]];
const HERO_LISTING = LISTINGS[10];

/**
 * Section 07: "Simplifying everyday routines".
 */
export function Services() {
  const { t } = useTranslations();
  const heroPhoto = HERO_LISTING.photos[0];
  const items = t.services.items;

  return (
    <section className="container py-20 md:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <h2 className="text-balance text-3xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            {t.services.title}
          </h2>

          <div className="grid min-h-[28rem] grid-cols-[0.95fr_2.4fr] gap-3 md:min-h-[34rem]">
            <div className="flex min-h-0 flex-col gap-3">
              {COLLAGE_LISTINGS.map((listing) => {
                const photo = listing.photos[0];
                return (
                  <div
                    key={listing.id}
                    className="relative min-h-0 flex-1 overflow-hidden bg-muted"
                  >
                    <Image
                      src={photoUrl(photo, { w: 200, ratio: "1:1" })}
                      alt={photo.alt}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>

            <div className="relative min-h-[28rem] overflow-hidden bg-muted md:min-h-[34rem]">
              <Image
                src={photoUrl(heroPhoto, { w: 1000, ratio: "3:2" })}
                alt={heroPhoto.alt}
                fill
                unoptimized
                sizes="(min-width: 1024px) 40vw, 70vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12 lg:pt-12">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-medium tracking-tight text-foreground">
              {t.services.detailsLabel}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.services.detailsBody}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-medium tracking-tight text-foreground">
              {t.services.servicesLabel}
            </h3>
            <div className="flex flex-col gap-10">
              {items.map((service, i) => (
                <NumberedStep
                  key={NUMBERS[i]}
                  number={NUMBERS[i]}
                  title={service.title}
                  body={service.body}
                  visual={SERVICE_VISUALS[i]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
