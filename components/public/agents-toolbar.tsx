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
import type { AgentSearchInput } from "@/lib/seed/public-data";
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
  "inline-flex min-h-10 w-full items-center justify-center rounded-none border px-3 py-2 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3.5";

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
  const [verifiedDraft, setVerifiedDraft] = useState(params.verified === "true");
  const [ratingDraft, setRatingDraft] = useState(params.minRating ?? "");
  const [sortDraft, setSortDraft] = useState(sort);

  useEffect(() => {
    setVerifiedDraft(params.verified === "true");
  }, [params.verified]);

  useEffect(() => {
    setRatingDraft(params.minRating ?? "");
  }, [params.minRating]);

  useEffect(() => {
    setSortDraft(sort);
  }, [sort]);

  function syncDraftsFromUrl() {
    setVerifiedDraft(params.verified === "true");
    setRatingDraft(params.minRating ?? "");
    setSortDraft(sort);
  }

  const summary = useMemo(() => buildFilterSummary(params, sort), [params, sort]);
  const advancedCount = useMemo(() => countAdvancedFilters(params), [params]);
  const hasChips = Boolean(params.q?.trim()) || summary.length > 0;

  const filtersForm = (
    <form action="/agents" className="space-y-4" onSubmit={() => setFiltersOpen(false)}>
      <input type="hidden" name="q" value={params.q ?? ""} />
      <input type="hidden" name="minRating" value={ratingDraft} />
      <input type="hidden" name="sort" value={sortDraft} />

      <fieldset className="space-y-1.5 border-0 p-0">
        <legend className="mb-0.5">
          <FieldCaption>Minimum rating</FieldCaption>
        </legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3" role="group" aria-label="Minimum average rating">
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

      <fieldset className="space-y-1.5 border-0 p-0">
        <legend className="mb-0.5">
          <FieldCaption>Sort by</FieldCaption>
        </legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2" role="group" aria-label="Sort agents by">
          {SORT_OPTIONS.map((opt) => {
            const selected = sortDraft === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setSortDraft(opt.value)}
                className={cn(pillClass(selected), "justify-start text-left")}
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
          "flex cursor-pointer items-center gap-2.5 border border-border bg-background p-2.5 transition-colors hover:bg-secondary/25",
          verifiedDraft && "border-foreground/80 bg-secondary/30",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-secondary/50 text-primary">
          <BadgeCheck className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">Verified agents only</span>
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
          href="/agents"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-9 justify-start px-0 text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setFiltersOpen(false)}
        >
          Reset filters
        </Link>
      </div>
    </form>
  );

  return (
    <section className="border border-border bg-card p-5 md:p-7">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Find an agent</p>
        <h1 className="max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          Find an agent you can build a relationship with, not just a name on a listing.
        </h1>
      </div>

      <div className="mt-6 space-y-4">
        <form action="/agents" className="space-y-4 border border-border bg-secondary/25 p-4 md:p-5">
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="minRating" value={params.minRating ?? ""} />
          {params.verified === "true" ? <input type="hidden" name="verified" value="true" /> : null}

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
                  {advancedCount > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-semibold tabular-nums text-background">
                      {advancedCount}
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
              Search agents
            </button>
          </div>
        </form>

        {hasChips ? (
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
