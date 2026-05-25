"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

const OSM_TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noreferrer">OpenStreetMap</a>';

export type PublicMapPin = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  priceLabel: string;
  term: "RENT" | "SALE";
  href: string;
  selected: boolean;
};

function markerIcon(term: "RENT" | "SALE", selected: boolean) {
  const fill = term === "RENT" ? "#059669" : "#d97706";
  const ring = selected ? "0 0 0 3px rgba(255,255,255,0.95)" : "0 0 0 2px rgba(255,255,255,0.85)";
  return L.divIcon({
    className: "dh-leaflet-marker",
    html: `<div style="width:13px;height:13px;border-radius:50%;background:${fill};box-shadow:${ring},0 2px 10px rgba(0,0,0,.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = useMemo(() => JSON.stringify(points.map((p) => [p[0].toFixed(5), p[1].toFixed(5)])), [points]);

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    const bounds = L.latLngBounds(points);
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [40, 48], maxZoom: 14 });
  }, [map, points, key]);

  return null;
}

function resetLeafletContainer(el: Element | null) {
  if (!el) return;
  const node = el as Element & { _leaflet_id?: unknown };
  if (node._leaflet_id !== undefined) delete node._leaflet_id;
}

function useLeafletContainerGuard(hostRef: React.RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Guard against stale instances left behind by HMR/StrictMode remounts.
    resetLeafletContainer(host.querySelector(".leaflet-container"));
    resetLeafletContainer(host.firstElementChild);
  });
}

/**
 * Dev/HMR guard: ensure Leaflet tears down the map instance on unmount so
 * remounting in the same container doesn't trip "Map container is already initialized."
 */
function MapUnmountCleanup() {
  const map = useMap();

  useEffect(() => {
    return () => {
      try {
        map.remove();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Dev/HMR can overlap teardown + remount and throw reuse errors.
        if (!/reused by another instance|already initialized/i.test(message)) {
          throw error;
        }
      }
    };
  }, [map]);

  return null;
}

export function PublicListingsMap({ pins }: { pins: PublicMapPin[] }) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  useLeafletContainerGuard(hostRef);

  if (pins.length === 0) {
    return (
      <div className="flex h-[70vh] min-h-[400px] items-center justify-center border border-white/10 bg-slate-900/80 px-4 text-center text-sm text-white/70">
        No listings match these filters on the map yet.
      </div>
    );
  }

  const first = pins[0]!;
  const positions = pins.map((p) => [p.latitude, p.longitude] as [number, number]);

  return (
    <div ref={hostRef} className="relative z-0 h-[70vh] min-h-[400px] w-full overflow-hidden border border-white/10 bg-slate-950">
      <MapContainer
        center={[first.latitude, first.longitude]}
        zoom={12}
        className="h-full w-full [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:bg-white/90"
        scrollWheelZoom
      >
        <MapUnmountCleanup />
        <TileLayer attribution={OSM_ATTR} url={OSM_TILE} />
        <FitBounds points={positions} />
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={markerIcon(pin.term, pin.selected)}
            eventHandlers={{
              click: () => {
                router.push(pin.href);
              },
            }}
          >
            <Popup className="[&_.leaflet-popup-content]:m-3 [&_.leaflet-popup-content]:min-w-[200px]">
              <div className="text-slate-900">
                <p className="font-semibold leading-snug">{pin.title}</p>
                <p className="mt-1 text-sm text-slate-600">{pin.priceLabel}</p>
                <p className="mt-1 text-xs text-slate-500">{pin.term === "RENT" ? "For rent" : "For sale"}</p>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <Link href={`/listings/${pin.id}`} className="font-medium text-blue-700 underline-offset-2 hover:underline">
                    Open listing
                  </Link>
                  <Link href={pin.href} className="text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline">
                    Focus on map
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function ListingMiniMap({
  latitude,
  longitude,
  label,
  term,
}: {
  latitude: number;
  longitude: number;
  label: string;
  term: "RENT" | "SALE";
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  useLeafletContainerGuard(hostRef);

  return (
    <div ref={hostRef} className="relative z-0 h-52 w-full overflow-hidden border border-border bg-muted">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        className="h-full w-full [&_.leaflet-control-attribution]:text-[9px]"
        scrollWheelZoom={false}
        dragging
        doubleClickZoom={false}
      >
        <MapUnmountCleanup />
        <TileLayer attribution={OSM_ATTR} url={OSM_TILE} />
        <Marker position={[latitude, longitude]} icon={markerIcon(term, true)}>
          <Popup>
            <div className="text-slate-900">
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs text-slate-500">Approximate pin (Lagos / Abuja) until coordinates ship from Haven.</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
