"use client";

import { useRouter } from "next/navigation";
import { Suggestions, SuggestionList, Suggestion } from "@/components/nexus-ui/suggestions";
import { buildQueryString, type QueryState } from "@/lib/query-string";
import type { ListingSearchInput } from "@/lib/seed/public-data";

// Presets MUST use only filters Haven's `GET /listings` understands server-side:
//   listingType, priceMin, priceMax, bedrooms, propertyType, location.
// Anything that lands in `q` is filtered client-side AFTER pagination, which
// means even when there are real matches in the catalogue, only those that
// happen to fall on the current 6-row page will render — the header still
// shows "N found" while the body shows zero. So: backend filters only.
const PRESETS: { label: string; patch: Partial<ListingSearchInput> }[] = [
  { label: "Lekki rent", patch: { location: "Lekki", listingType: "RENT" } },
  { label: "Ikoyi buy", patch: { location: "Ikoyi", listingType: "SALE" } },
  { label: "Abuja rent", patch: { location: "Abuja", listingType: "RENT" } },
  { label: "VI rent", patch: { location: "Victoria Island", listingType: "RENT" } },
  { label: "3-bedroom", patch: { bedrooms: "3" } },
  { label: "Rent under ₦5M", patch: { listingType: "RENT", priceMax: "5000000" } },
];

export function ListingsExplorerPresets({
  mode,
  current,
}: {
  mode: "browse" | "search";
  current: ListingSearchInput;
}) {
  const router = useRouter();
  const base = mode === "search" ? "/search" : "/listings";

  return (
    <div className="border-b border-border bg-secondary/15 px-4 py-3 md:px-5">
      <p className="mb-2 text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Quick picks</p>
      <Suggestions
        onSelect={(label) => {
          const preset = PRESETS.find((p) => p.label === label);
          if (!preset) return;
          // Reset every filter to its empty string so the preset is a clean
          // switch — otherwise a leftover `q`, `bathrooms`, `verified`, etc.
          // from the previous URL would silently narrow the result set to
          // zero (client-side filters apply after pagination — see the
          // searchListings note in lib/seed/public-data.ts).
          const reset: Record<string, string> = {
            q: "",
            location: "",
            listingType: "",
            propertyType: "",
            bedrooms: "",
            bathrooms: "",
            priceMin: "",
            priceMax: "",
            verified: "",
            availability: "",
            page: "",
          };
          const qs = buildQueryString(current as QueryState, {
            ...reset,
            ...preset.patch,
            // Preserve sort if the user set one.
            sort: current.sort as string | undefined,
          });
          router.push(qs ? `${base}?${qs}` : base);
        }}
      >
        <SuggestionList className="justify-start">
          {PRESETS.map((p) => (
            <Suggestion key={p.label} value={p.label} variant="outline" className="h-9 rounded-none text-xs sm:text-sm">
              {p.label}
            </Suggestion>
          ))}
        </SuggestionList>
      </Suggestions>
    </div>
  );
}
