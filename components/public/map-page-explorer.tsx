"use client";

import { PublicListingsMap, type PublicMapPin } from "@/components/public/listings-leaflet-map";

export type { PublicMapPin };

export function MapPageExplorer({ pins }: { pins: PublicMapPin[] }) {
  return <PublicListingsMap pins={pins} />;
}
