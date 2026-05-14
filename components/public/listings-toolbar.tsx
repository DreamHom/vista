"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  BadgeCheck,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { ListingSearchInput } from "@/lib/seed/public-data";
import { useMinMd } from "@/lib/use-min-md";
import { cn } from "@/lib/utils";
import { LISTING_TYPE_PILLS, PROPERTY_TYPE_PILLS } from "./listing-pill-defs";

const AVAILABILITY_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "NOW", label: "Available now" },
  { value: "THIRTY_DAYS", label: "Within 30 days" },
  { value: "NEXT_QUARTER", label: "Next quarter" },
] as const;

const ROOM_TICKS = ["Any", "1+", "2+", "3+", "4+"] as const;

const DEFAULT_MAX_PRICE = "600000000";

const INPUT_TEXT_CLASS =
  "h-12 w-full min-w-0 rounded-none border border-border bg-background pl-3 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground";

const PILL_BASE =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-none border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4";

function pillClass(selected: boolean) {
  return cn(
    PILL_BASE,
    selected
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-foreground hover:border-foreground/50 hover:bg-secondary/40",
  );
}

function formatTerm(value?: string) {
  if (!value) return null;
  return value === "RENT" ? "Rent" : value === "SALE" ? "Buy" : value;
}

function formatPropertyType(value?: string) {
  if (!value) return null;
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseRoomStep(raw?: string): number {
  if (!raw) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.min(4, Math.floor(n));
}

function shortRoomSummary(step: number): string {
  if (step === 0) return "Any";
  return `${step}+`;
}

function roomAriaValueText(step: number, kind: "bed" | "bath"): string {
  if (step === 0) return `Any minimum ${kind === "bed" ? "bedrooms" : "bathrooms"}`;
  const unit = kind === "bed" ? "bedrooms" : "bathrooms";
  return `${step}+ ${unit} minimum`;
}

function buildActiveTokens(searchParams: ListingSearchInput) {
  const tokens: string[] = [];

  if (searchParams.q?.trim()) tokens.push(`Keywords: ${searchParams.q.trim()}`);
  if (searchParams.location?.trim()) tokens.push(`Area: ${searchParams.location.trim()}`);

  const listingType = formatTerm(searchParams.listingType);
  if (listingType) tokens.push(listingType);

  const propertyType = formatPropertyType(searchParams.propertyType);
  if (propertyType) tokens.push(propertyType);

  if (searchParams.bedrooms) tokens.push(`${searchParams.bedrooms}+ bed`);
  if (searchParams.bathrooms) tokens.push(`${searchParams.bathrooms}+ bath`);
  if (searchParams.availability) {
    const match = AVAILABILITY_OPTIONS.find((item) => item.value === searchParams.availability);
    if (match) tokens.push(match.label);
  }
  if (searchParams.verified === "true") tokens.push("Verified only");
  if (searchParams.priceMax && searchParams.priceMax !== DEFAULT_MAX_PRICE) {
    tokens.push(`Up to N${new Intl.NumberFormat("en-NG").format(Number(searchParams.priceMax))}`);
  }

  return tokens;
}

function countAdvancedFilters(searchParams: ListingSearchInput) {
  return [
    Boolean(searchParams.bedrooms),
    Boolean(searchParams.bathrooms),
    Boolean(searchParams.availability),
    searchParams.verified === "true",
    Boolean(searchParams.priceMax && searchParams.priceMax !== DEFAULT_MAX_PRICE),
  ].filter(Boolean).length;
}

function FieldCaption({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

function RoomStepSlider({
  id,
  label,
  step,
  onStepChange,
  kind,
}: {
  id: string;
  label: string;
  step: number;
  onStepChange: (n: number) => void;
  kind: "bed" | "bath";
}) {
  const summary = shortRoomSummary(step);
  const ariaValueText = roomAriaValueText(step, kind);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="min-w-0 cursor-pointer">
          <FieldCaption>{label}</FieldCaption>
        </label>
        <span
          className="shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-foreground"
          aria-live="polite"
        >
          {summary}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={4}
        step={1}
        value={step}
        onChange={(e) => onStepChange(Number(e.target.value))}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={step}
        aria-valuetext={ariaValueText}
        className="h-2 w-full cursor-pointer accent-foreground"
      />
      <div className="flex select-none justify-between px-0.5 text-[10px] font-medium uppercase tracking-eyebrow text-muted-foreground">
        {ROOM_TICKS.map((tick) => (
          <span key={tick} className="w-8 text-center">
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ListingsToolbar({
  mode,
  searchParams,
  sort,
}: {
  mode: "browse" | "search";
  searchParams: ListingSearchInput;
  sort: string;
}) {
  const action = mode === "search" ? "/search" : "/listings";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [maxPrice, setMaxPrice] = useState(searchParams.priceMax ?? DEFAULT_MAX_PRICE);
  const [bedStep, setBedStep] = useState(() => parseRoomStep(searchParams.bedrooms));
  const [bathStep, setBathStep] = useState(() => parseRoomStep(searchParams.bathrooms));
  const [availChoice, setAvailChoice] = useState(searchParams.availability ?? "");
  const [verifiedDraft, setVerifiedDraft] = useState(searchParams.verified === "true");
  const [listingTypeMain, setListingTypeMain] = useState(searchParams.listingType ?? "");
  const [propertyTypeMain, setPropertyTypeMain] = useState(searchParams.propertyType ?? "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setListingTypeMain(searchParams.listingType ?? "");
    setPropertyTypeMain(searchParams.propertyType ?? "");
    setMaxPrice(searchParams.priceMax ?? DEFAULT_MAX_PRICE);
    setBedStep(parseRoomStep(searchParams.bedrooms));
    setBathStep(parseRoomStep(searchParams.bathrooms));
    setAvailChoice(searchParams.availability ?? "");
    setVerifiedDraft(searchParams.verified === "true");
  }, [
    searchParams.listingType,
    searchParams.propertyType,
    searchParams.priceMax,
    searchParams.bedrooms,
    searchParams.bathrooms,
    searchParams.availability,
    searchParams.verified,
  ]);

  useEffect(() => {
    if (!filtersOpen) return;
    setBedStep(parseRoomStep(searchParams.bedrooms));
    setBathStep(parseRoomStep(searchParams.bathrooms));
    setAvailChoice(searchParams.availability ?? "");
    setVerifiedDraft(searchParams.verified === "true");
    setMaxPrice(searchParams.priceMax ?? DEFAULT_MAX_PRICE);
  }, [
    filtersOpen,
    searchParams.bedrooms,
    searchParams.bathrooms,
    searchParams.availability,
    searchParams.verified,
    searchParams.priceMax,
  ]);

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [filtersOpen]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtersOpen]);

  const activeTokens = useMemo(() => buildActiveTokens(searchParams), [searchParams]);
  const advancedFilterCount = useMemo(() => countAdvancedFilters(searchParams), [searchParams]);
  const isMdUp = useMinMd();

  const filtersPanel = (
    <>
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <div className="min-w-0">
          <h2 id="listings-filters-title" className="text-lg font-semibold tracking-tight text-foreground">
            More filters
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Beds, baths, price cap, availability, and verified-only, without cluttering search.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(false)}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-10 w-10 shrink-0")}
          aria-label="Close filters"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6">
        <form action={action} className="space-y-6" onSubmit={() => setFiltersOpen(false)}>
          <input type="hidden" name="q" value={searchParams.q ?? ""} />
          <input type="hidden" name="location" value={searchParams.location ?? ""} />
          <input type="hidden" name="listingType" value={searchParams.listingType ?? ""} />
          <input type="hidden" name="propertyType" value={searchParams.propertyType ?? ""} />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="bedrooms" value={bedStep === 0 ? "" : String(bedStep)} />
          <input type="hidden" name="bathrooms" value={bathStep === 0 ? "" : String(bathStep)} />
          <input type="hidden" name="availability" value={availChoice} />

          <div className="grid gap-6 sm:grid-cols-2">
            <RoomStepSlider
              id="filter-bedrooms"
              label="Minimum bedrooms"
              step={bedStep}
              onStepChange={setBedStep}
              kind="bed"
            />
            <RoomStepSlider
              id="filter-bathrooms"
              label="Minimum bathrooms"
              step={bathStep}
              onStepChange={setBathStep}
              kind="bath"
            />
          </div>

          <fieldset className="space-y-3 border-0 p-0">
            <legend className="mb-1">
              <FieldCaption>Availability</FieldCaption>
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Availability">
              {AVAILABILITY_OPTIONS.map((item) => {
                const selected = availChoice === item.value;
                return (
                  <button
                    key={item.value || "any"}
                    type="button"
                    onClick={() => setAvailChoice(item.value)}
                    className={cn(
                      "min-h-12 rounded-none border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground hover:border-foreground/50 hover:bg-secondary/40",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <FieldCaption>Max price</FieldCaption>
              <span className="text-sm font-medium tabular-nums text-foreground">
                ₦{new Intl.NumberFormat("en-NG").format(Number(maxPrice))}
              </span>
            </div>
            <input
              type="range"
              name="priceMax"
              min="1000000"
              max="800000000"
              step="1000000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-2 w-full cursor-pointer accent-foreground"
            />
          </label>

          <label
            htmlFor="filter-verified-only"
            className={cn(
              "flex cursor-pointer items-center gap-4 border border-border bg-background p-4 transition-colors hover:bg-secondary/25",
              verifiedDraft && "border-foreground/80 bg-secondary/30",
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-secondary/50 text-primary">
              <BadgeCheck className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">Verified listings only</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                Limit results to properties where the owner has completed verification on DreamHomes.
              </span>
            </span>
            <input
              id="filter-verified-only"
              type="checkbox"
              name="verified"
              value="true"
              checked={verifiedDraft}
              onChange={(e) => setVerifiedDraft(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-border accent-foreground"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href={action} className={buttonVariants({ variant: "ghost", size: "sm" })} onClick={() => setFiltersOpen(false)}>
              Clear all filters
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Cancel
              </button>
              <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Apply
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );

  const filterOverlay =
    mounted && filtersOpen
      ? createPortal(
          <div className="fixed inset-0 z-[200]" role="presentation">
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 z-[200] bg-foreground/45 backdrop-blur-[2px] transition-opacity"
              onClick={() => setFiltersOpen(false)}
            />
            {isMdUp ? (
              <div className="pointer-events-none fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-6">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="listings-filters-title"
                  className="pointer-events-auto flex max-h-[min(92dvh,880px)] w-full max-w-lg flex-col border border-border bg-background shadow-[0_24px_80px_rgba(15,23,42,0.2)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {filtersPanel}
                </div>
              </div>
            ) : (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="listings-filters-title"
                className="absolute inset-y-0 right-0 z-[201] flex w-full max-w-md flex-col border-l border-border bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.04),-12px_0_48px_rgba(15,23,42,0.12)]"
              >
                {filtersPanel}
              </div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <section className="border border-border bg-card p-5 md:p-7">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">
          {mode === "browse" ? "Browse Listings" : "Search Results"}
        </p>
        <h1 className="max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {mode === "browse"
            ? "Find premium homes, serviced apartments, and verified listings across Lagos and Abuja."
            : "Refine your shortlist without fighting the interface."}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Search with keywords first, narrow by area and listing type, then open{" "}
          <span className="font-medium text-foreground">More filters</span> when you need price, beds, or availability.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <form action={action} className="space-y-4 border border-border bg-secondary/25 p-4 md:p-5">
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="listingType" value={listingTypeMain} />
          <input type="hidden" name="propertyType" value={propertyTypeMain} />

          <div className="space-y-2">
            <label htmlFor="listings-q" className="block">
              <FieldCaption>Keywords</FieldCaption>
              <span className="relative mt-1.5 block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="listings-q"
                  type="text"
                  name="q"
                  defaultValue={searchParams.q ?? ""}
                  placeholder="e.g. pool, Banana Island, 3 bed serviced"
                  autoComplete="off"
                  className={cn(INPUT_TEXT_CLASS, "pl-10")}
                />
              </span>
            </label>
            <p className="text-xs text-muted-foreground">Describe features, neighbourhood, or budget hints. Not required to run a search.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <FieldCaption>Area / city</FieldCaption>
              <input
                type="text"
                name="location"
                defaultValue={searchParams.location ?? ""}
                placeholder="Lagos, Abuja, Lekki…"
                className={INPUT_TEXT_CLASS}
              />
            </label>

            <div className="flex flex-col gap-5 sm:col-span-2 xl:flex-row xl:flex-wrap xl:items-start xl:gap-x-10 xl:gap-y-4">
              <div className="min-w-0 shrink-0 space-y-2">
                <FieldCaption>Listing type</FieldCaption>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Listing type">
                  {LISTING_TYPE_PILLS.map((pill) => {
                    const Icon = pill.Icon;
                    return (
                      <button
                        key={pill.value || "any"}
                        type="button"
                        onClick={() => setListingTypeMain(pill.value)}
                        className={pillClass(listingTypeMain === pill.value)}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <FieldCaption>Property type</FieldCaption>
                <div
                  className="flex w-max max-w-full flex-wrap gap-2"
                  role="group"
                  aria-label="Property type"
                >
                  {PROPERTY_TYPE_PILLS.map((pill) => {
                    const Icon = pill.Icon;
                    return (
                      <button
                        key={pill.value || "any"}
                        type="button"
                        onClick={() => setPropertyTypeMain(pill.value)}
                        className={pillClass(propertyTypeMain === pill.value)}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground sm:max-w-[55%]">
              Results update when you submit. Use <span className="font-medium text-foreground">More filters</span> for price range and room counts.
            </p>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-expanded={filtersOpen}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 w-full sm:w-auto")}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                More filters
                {advancedFilterCount ? (
                  <span className="inline-flex min-w-6 items-center justify-center border border-border px-1.5 text-xs tabular-nums">
                    {advancedFilterCount}
                  </span>
                ) : null}
              </button>
              <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "h-12 w-full sm:w-auto")}>
                <Search className="h-4 w-4" aria-hidden />
                Search listings
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {activeTokens.length ? (
            activeTokens.map((token) => (
              <span
                key={token}
                className="inline-flex items-center border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                {token}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No active filters. Showing the broadest match for this page.</p>
          )}
        </div>
      </div>

      {filterOverlay}
    </section>
  );
}
