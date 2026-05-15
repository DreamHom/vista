"use client";

import dynamic from "next/dynamic";

export type { PublicMapPin } from "./listings-leaflet-map-inner";

function ListingsMapFallback() {
  return (
    <div className="flex h-[70vh] min-h-[400px] items-center justify-center border border-white/10 bg-slate-900/80 px-4 text-center text-sm text-white/70">
      Loading map…
    </div>
  );
}

function MiniMapFallback() {
  return (
    <div
      className="flex h-52 w-full items-center justify-center border border-border bg-muted text-xs text-muted-foreground"
      aria-hidden
    >
      Loading map…
    </div>
  );
}

export const PublicListingsMap = dynamic(
  () => import("./listings-leaflet-map-inner").then((m) => m.PublicListingsMap),
  { ssr: false, loading: ListingsMapFallback },
);

export const ListingMiniMap = dynamic(
  () => import("./listings-leaflet-map-inner").then((m) => m.ListingMiniMap),
  { ssr: false, loading: MiniMapFallback },
);
