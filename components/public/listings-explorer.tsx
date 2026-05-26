import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { buildQueryString, type QueryState } from "@/lib/query-string";
import { searchListings, summarizeQuery, type ListingSearchInput } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";
import { ListingsExplorerPresets } from "@/components/listings/listings-explorer-presets";
import { ListingsResultsGrid } from "./listings-results-grid";
import { EmptyHint, PublicApiNotice } from "./public-components";
import { ListingsToolbar } from "./listings-toolbar";
import { SortAutoSubmitForm } from "./sort-auto-submit";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
  { value: "most-saved", label: "Most saved" },
] as const;

export async function ListingsExplorer({
  mode,
  searchParams,
}: {
  mode: "browse" | "search";
  searchParams: ListingSearchInput;
}) {
  const { listings, total, totalPages, page, sort, backendUnavailable } = await searchListings(searchParams);
  const queryState = searchParams as QueryState;
  const summary = summarizeQuery(searchParams);

  // Client-side filters (q, bathrooms, verified, availability) run AFTER
  // pagination, so they can drop `listings` to 0 while haven's `total` stays
  // high. Detect that mismatch so we can show an honest empty state instead
  // of "N properties found" with nothing under it.
  const clientFiltersActive = Boolean(
    searchParams.q?.trim() ||
    searchParams.bathrooms ||
    searchParams.verified === "true" ||
    searchParams.availability,
  );
  const visibleCount = listings.length;
  const countLabel =
    visibleCount === total
      ? `${total} ${total === 1 ? "property" : "properties"} found`
      : `${visibleCount} on this page · ${total} total ${total === 1 ? "match" : "matches"}`;

  return (
    <div className="container py-10 md:py-14">
      <ListingsToolbar mode={mode} searchParams={searchParams} sort={sort} />
      <ListingsExplorerPresets mode={mode} current={searchParams} />

      <section className="mt-8 space-y-6">
          {backendUnavailable ? (
            <PublicApiNotice>
              Haven public endpoints are unavailable at `{process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api"}` right now, so this screen is rendering its empty backend state instead of local mock listings.
            </PublicApiNotice>
          ) : null}
          <div className="flex flex-col gap-4 border border-border bg-card p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
            <div className="min-w-0 space-y-1">
              <p className="text-lg font-semibold tracking-tight text-foreground">{countLabel}</p>
              <p className="text-sm text-muted-foreground">
                {mode === "search"
                  ? `Matching: ${summary}.`
                  : "Verified fees, visible badges, and internal linking into profiles, maps, and comparison."}
              </p>
            </div>

            <SortAutoSubmitForm
              action={mode === "search" ? "/search" : "/listings"}
              appliedSort={sort}
              options={SORT_OPTIONS}
              label="Sort results"
              className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-end sm:justify-end lg:w-auto lg:max-w-none lg:shrink-0"
            >
              {Object.entries(searchParams).map(([key, value]) =>
                key !== "sort" && value ? <input key={key} type="hidden" name={key} value={value} /> : null,
              )}
            </SortAutoSubmitForm>
          </div>

          {listings.length === 0 ? (
            clientFiltersActive && total > 0 ? (
              <EmptyHint
                title={`${total} ${total === 1 ? "property matches" : "properties match"} your filters, but nothing on this page matches the text search.`}
                body="Clear the text search or sort differently to see them. Text matching only runs over the current page of results."
                ctaHref={`${mode === "search" ? "/search" : "/listings"}?${buildQueryString(queryState, { q: "" })}`}
                ctaLabel="Clear text search"
              />
            ) : (
              <EmptyHint
                title="No listings match that exact brief yet."
                body="Try widening the location, relaxing the bedroom count, or let Dream AI help you describe the feel and budget in plain English."
                ctaHref="/dream-ai"
                ctaLabel="Try Dream AI"
              />
            )
          ) : (
            <>
              <ListingsResultsGrid listings={listings} />

              {mode === "search" && total < 4 ? (
                <div className="border border-accent/20 bg-accent/5 p-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
                    <div>
                      <p className="font-semibold tracking-tight text-foreground">Too few results?</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Ask Dream AI for alternatives like nearby neighbourhoods, better value price bands, or inspection advice before you decide.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <PaginationLink
                href={`/${mode === "search" ? "search" : "listings"}?${buildQueryString(queryState, { page: Math.max(1, page - 1) })}`}
                disabled={page <= 1}
              >
                Previous
              </PaginationLink>
              <PaginationLink
                href={`/${mode === "search" ? "search" : "listings"}?${buildQueryString(queryState, { page: Math.min(totalPages, page + 1) })}`}
                disabled={page >= totalPages}
              >
                Next
              </PaginationLink>
            </div>
          </div>
      </section>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  return disabled ? (
    <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-40")}>
      {children}
    </span>
  ) : (
    <Link href={href} className={buttonVariants({ variant: "outline", size: "sm" })}>
      {children}
    </Link>
  );
}
