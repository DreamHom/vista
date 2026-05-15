"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BROWSE_LOCATION_OPTIONS, isKnownBrowseLocation } from "@/lib/public-browse-locations";
import type { ListingSearchInput } from "@/lib/seed/public-data";
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

const SELECT_CLASS = cn(INPUT_TEXT_CLASS, "cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-10");

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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="min-w-0 cursor-pointer">
          <FieldCaption>{label}</FieldCaption>
        </label>
        <span className="shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-foreground" aria-live="polite">
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
  const [maxPrice, setMaxPrice] = useState(searchParams.priceMax ?? DEFAULT_MAX_PRICE);
  const [bedStep, setBedStep] = useState(() => parseRoomStep(searchParams.bedrooms));
  const [bathStep, setBathStep] = useState(() => parseRoomStep(searchParams.bathrooms));
  const [availChoice, setAvailChoice] = useState(searchParams.availability ?? "");
  const [verifiedDraft, setVerifiedDraft] = useState(searchParams.verified === "true");
  const [listingTypeMain, setListingTypeMain] = useState(searchParams.listingType ?? "");
  const [propertyTypeMain, setPropertyTypeMain] = useState(searchParams.propertyType ?? "");

  const locationRaw = searchParams.location?.trim() ?? "";
  const locationOrphan = locationRaw && !isKnownBrowseLocation(locationRaw) ? locationRaw : null;

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

  function syncDraftsFromUrl() {
    setBedStep(parseRoomStep(searchParams.bedrooms));
    setBathStep(parseRoomStep(searchParams.bathrooms));
    setAvailChoice(searchParams.availability ?? "");
    setVerifiedDraft(searchParams.verified === "true");
    setMaxPrice(searchParams.priceMax ?? DEFAULT_MAX_PRICE);
  }

  const advancedFilterCount = useMemo(() => countAdvancedFilters(searchParams), [searchParams]);

  const filtersForm = (
    <form
      action={action}
      className="space-y-4"
      onSubmit={() => {
        setFiltersOpen(false);
      }}
    >
      <input type="hidden" name="q" value={searchParams.q ?? ""} />
      <input type="hidden" name="location" value={searchParams.location ?? ""} />
      <input type="hidden" name="listingType" value={searchParams.listingType ?? ""} />
      <input type="hidden" name="propertyType" value={searchParams.propertyType ?? ""} />
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="bedrooms" value={bedStep === 0 ? "" : String(bedStep)} />
      <input type="hidden" name="bathrooms" value={bathStep === 0 ? "" : String(bathStep)} />
      <input type="hidden" name="availability" value={availChoice} />

      <div className="grid gap-4 sm:grid-cols-2">
        <RoomStepSlider id="filter-bedrooms" label="Minimum bedrooms" step={bedStep} onStepChange={setBedStep} kind="bed" />
        <RoomStepSlider id="filter-bathrooms" label="Minimum bathrooms" step={bathStep} onStepChange={setBathStep} kind="bath" />
      </div>

      <fieldset className="space-y-1.5 border-0 p-0">
        <legend className="mb-0.5">
          <FieldCaption>Availability</FieldCaption>
        </legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2" role="group" aria-label="Availability">
          {AVAILABILITY_OPTIONS.map((item) => {
            const selected = availChoice === item.value;
            return (
              <button
                key={item.value || "any"}
                type="button"
                onClick={() => setAvailChoice(item.value)}
                className={cn(
                  "min-h-10 rounded-none border px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3.5",
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

      <label className="flex flex-col gap-1.5">
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
          "flex cursor-pointer items-center gap-2.5 border border-border bg-background p-2.5 transition-colors hover:bg-secondary/25",
          verifiedDraft && "border-foreground/80 bg-secondary/30",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-secondary/50 text-primary">
          <BadgeCheck className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">Verified listings only</span>
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

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "md" }), "h-10 w-full")}>
          Apply
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen(false)}
          className={cn(buttonVariants({ variant: "outline", size: "md" }), "h-10 w-full")}
        >
          Cancel
        </button>
        <Link
          href={action}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 justify-start px-0 text-muted-foreground hover:text-foreground")}
          onClick={() => setFiltersOpen(false)}
        >
          Clear all filters
        </Link>
      </div>
    </form>
  );

  return (
    <section className="border border-border bg-card p-5 md:p-7">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">
          {mode === "browse" ? "Browse Listings" : "Search Results"}
        </p>
        <h1 className="max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {mode === "browse"
            ? "Find premium homes, serviced apartments, and verified listings across Lagos and Abuja."
            : "Refine your shortlist without fighting the interface."}
        </h1>
      </div>

      <div className="mt-6 space-y-4">
        <form action={action} className="space-y-4 border border-border bg-secondary/25 p-4 md:p-5">
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="listingType" value={listingTypeMain} />
          <input type="hidden" name="propertyType" value={propertyTypeMain} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label htmlFor="listings-q" className="min-w-0 flex-1">
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

            <label className="w-full shrink-0 sm:w-52">
              <FieldCaption>Area</FieldCaption>
              <select
                key={`loc-${locationRaw}`}
                name="location"
                defaultValue={locationRaw}
                className={cn(SELECT_CLASS, "mt-1.5")}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                {locationOrphan ? <option value={locationOrphan}>{locationOrphan}</option> : null}
                {BROWSE_LOCATION_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-5 xl:flex-row xl:flex-wrap xl:items-start xl:gap-x-10 xl:gap-y-4">
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
              <div className="flex w-max max-w-full flex-wrap gap-2" role="group" aria-label="Property type">
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

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end sm:gap-2">
            <DropdownMenu
              open={filtersOpen}
              onOpenChange={(open) => {
                setFiltersOpen(open);
                if (open) syncDraftsFromUrl();
              }}
            >
              <DropdownMenuTrigger
                asChild
                className="h-12 pr-4 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <button
                  type="button"
                  aria-expanded={filtersOpen}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 w-full gap-2 sm:w-auto")}
                >
                  <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                  <span>More filters</span>
                  {advancedFilterCount > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-semibold tabular-nums text-background">
                      {advancedFilterCount}
                    </span>
                  ) : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                aria-label="More filters"
                className="z-[200] w-[min(20rem,calc(100vw-1.5rem))] max-h-[min(72vh,520px)] overflow-y-auto rounded-none border-border p-3 shadow-md"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {filtersForm}
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "h-12 w-full sm:w-auto")}>
              <Search className="h-4 w-4" aria-hidden />
              Search listings
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
