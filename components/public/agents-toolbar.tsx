"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { BadgeCheck, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { AgentSearchInput } from "@/lib/seed/public-data";
import { useMinMd } from "@/lib/use-min-md";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "highest-rated", label: "Highest rated" },
  { value: "most-deals", label: "Most deals closed" },
  { value: "newest", label: "Joined most recently" },
  { value: "most-active", label: "Most reviewed" },
] as const;

const RATING_FILTER_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4.0+ stars" },
  { value: "4.5", label: "4.5+ stars" },
] as const;

const INPUT_CLASS =
  "h-12 w-full min-w-0 border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground";

const PILL_BASE =
  "inline-flex min-h-12 w-full items-center justify-center rounded-none border px-3 py-2.5 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4";

function pillClass(selected: boolean) {
  return cn(
    PILL_BASE,
    selected
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-foreground hover:border-foreground/50 hover:bg-secondary/40",
  );
}

function FieldCaption({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

function buildFilterSummary(params: AgentSearchInput, activeSort: string) {
  const parts: string[] = [];
  if (params.minRating) parts.push(`${params.minRating}+ stars`);
  if (params.verified === "true") parts.push("Verified agents only");
  const sortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label;
  if (activeSort && activeSort !== "highest-rated" && sortLabel) parts.push(sortLabel);
  return parts;
}

function countAdvancedFilters(params: AgentSearchInput) {
  return [Boolean(params.minRating), params.verified === "true"].filter(Boolean).length;
}

export function AgentsToolbar({
  params,
  sort,
}: {
  params: AgentSearchInput;
  sort: string;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [verifiedDraft, setVerifiedDraft] = useState(params.verified === "true");
  const [ratingDraft, setRatingDraft] = useState(params.minRating ?? "");
  const [sortDraft, setSortDraft] = useState(sort);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setVerifiedDraft(params.verified === "true");
  }, [params.verified]);

  useEffect(() => {
    setRatingDraft(params.minRating ?? "");
  }, [params.minRating]);

  useEffect(() => {
    setSortDraft(sort);
  }, [sort]);

  useEffect(() => {
    if (!filtersOpen) return;
    setVerifiedDraft(params.verified === "true");
    setRatingDraft(params.minRating ?? "");
    setSortDraft(sort);
  }, [filtersOpen, params.verified, params.minRating, sort]);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  const summary = useMemo(() => buildFilterSummary(params, sort), [params, sort]);
  const advancedCount = useMemo(() => countAdvancedFilters(params), [params]);
  const isMdUp = useMinMd();

  const filtersPanel = (
    <>
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <div className="min-w-0">
          <h2 id="agents-filters-title" className="text-lg font-semibold tracking-tight text-foreground">
            Narrow your list
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tighten ratings, show only verified agents, or change how the list is ordered.
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
        <form action="/agents" className="space-y-6" onSubmit={() => setFiltersOpen(false)}>
          <input type="hidden" name="q" value={params.q ?? ""} />
          <input type="hidden" name="minRating" value={ratingDraft} />
          <input type="hidden" name="sort" value={sortDraft} />

          <fieldset className="space-y-3 border-0 p-0">
            <legend className="mb-1">
              <FieldCaption>Minimum rating</FieldCaption>
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Minimum average rating">
              {RATING_FILTER_OPTIONS.map((opt) => {
                const selected = ratingDraft === opt.value;
                return (
                  <button
                    key={opt.value || "any"}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRatingDraft(opt.value)}
                    className={pillClass(selected)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-3 border-0 p-0">
            <legend className="mb-1">
              <FieldCaption>Sort list by</FieldCaption>
            </legend>
            <div className="grid grid-cols-1 gap-2" role="group" aria-label="Sort agents by">
              {SORT_OPTIONS.map((opt) => {
                const selected = sortDraft === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSortDraft(opt.value)}
                    className={cn(pillClass(selected), "justify-start text-left sm:justify-center sm:text-center")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label
            htmlFor="agents-filter-verified"
            className={cn(
              "flex cursor-pointer items-center gap-4 border border-border bg-background p-4 transition-colors hover:bg-secondary/25",
              verifiedDraft && "border-foreground/80 bg-secondary/30",
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-secondary/50 text-primary">
              <BadgeCheck className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">Verified agents only</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                Show agents who have completed identity or credential checks on DreamHomes.
              </span>
            </span>
            <input
              id="agents-filter-verified"
              type="checkbox"
              name="verified"
              value="true"
              checked={verifiedDraft}
              onChange={(e) => setVerifiedDraft(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-border accent-foreground"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/agents" className={buttonVariants({ variant: "ghost", size: "sm" })} onClick={() => setFiltersOpen(false)}>
              Reset filters
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

  const overlay =
    mounted && filtersOpen
      ? createPortal(
          <div className="fixed inset-0 z-[200]" role="presentation">
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 z-[200] bg-foreground/45 backdrop-blur-[2px]"
              onClick={() => setFiltersOpen(false)}
            />
            {isMdUp ? (
              <div className="pointer-events-none fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-6">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="agents-filters-title"
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
                aria-labelledby="agents-filters-title"
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
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Find an agent</p>
        <h1 className="max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          Find an agent you can build a relationship with, not just a name on a listing.
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Start with a name search. When you want stricter criteria or a different order, open More filters. It keeps this screen uncluttered.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <form action="/agents" className="space-y-4 border border-border bg-secondary/25 p-4 md:p-5">
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="minRating" value={params.minRating ?? ""} />
          {params.verified === "true" ? <input type="hidden" name="verified" value="true" /> : null}

          <div className="space-y-2">
            <label htmlFor="agents-q" className="block">
              <FieldCaption>Agent name</FieldCaption>
              <span className="relative mt-1.5 block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="agents-q"
                  type="text"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Search by first or last name"
                  autoComplete="off"
                  className={cn(INPUT_CLASS, "pl-10")}
                />
              </span>
            </label>
            <p className="text-xs text-muted-foreground">You’re browsing agents who work with buyers and renters on DreamHomes.</p>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground sm:max-w-[60%]">
              Want only highly rated agents, or people we’ve already verified? Use{" "}
              <span className="font-medium text-foreground">More filters</span>.
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
                {advancedCount ? (
                  <span className="inline-flex min-w-6 items-center justify-center border border-border px-1.5 text-xs tabular-nums">
                    {advancedCount}
                  </span>
                ) : null}
              </button>
              <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "h-12 w-full sm:w-auto")}>
                <Search className="h-4 w-4" aria-hidden />
                Search agents
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {params.q?.trim() ? (
            <span className="inline-flex items-center border border-border bg-background px-3 py-1.5 text-sm text-foreground">
              Name: {params.q.trim()}
            </span>
          ) : null}
          {summary.map((line) => (
            <span
              key={line}
              className="inline-flex items-center border border-border bg-background px-3 py-1.5 text-sm text-foreground"
            >
              {line}
            </span>
          ))}
          {!params.q?.trim() && summary.length === 0 ? (
            <p className="text-sm text-muted-foreground">No extra filters. We’re showing well-rated agents first.</p>
          ) : null}
        </div>
      </div>

      {overlay}
    </section>
  );
}
