"use client";

import { ListingMiniMap } from "@/components/public/listings-leaflet-map";

export function ListingDetailMap(props: {
  latitude: number;
  longitude: number;
  label: string;
  term: "RENT" | "SALE";
}) {
  return <ListingMiniMap {...props} />;
}
