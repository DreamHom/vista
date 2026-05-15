"use client";

import { useRouter } from "next/navigation";
import { Suggestions, SuggestionList, Suggestion } from "@/components/nexus-ui/suggestions";
import { buildQueryString, type QueryState } from "@/lib/query-string";
import type { ListingSearchInput } from "@/lib/seed/public-data";

const PRESETS: { label: string; patch: Partial<ListingSearchInput> }[] = [
  { label: "Lekki rent", patch: { location: "Lekki", listingType: "RENT" } },
  { label: "Ikoyi buy", patch: { location: "Ikoyi", listingType: "SALE" } },
  { label: "Abuja rent", patch: { location: "Abuja", listingType: "RENT" } },
  { label: "VI serviced", patch: { location: "Victoria Island", q: "serviced" } },
  { label: "3 bed family", patch: { q: "3 bedroom family" } },
  { label: "Under ₦5M/yr", patch: { q: "under 5 million rent yearly" } },
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
          const qs = buildQueryString(current as QueryState, {
            ...preset.patch,
            page: "",
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
