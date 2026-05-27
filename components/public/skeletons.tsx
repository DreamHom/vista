/**
 * Editorial skeletons for public surfaces.
 *
 * Matches the canonical pattern at `app/(public)/listings/[id]/loading.tsx`:
 *   - sharp corners (the globals enforce `--radius: 0`)
 *   - hairline `border-border` dividers
 *   - layered opacity: outer container `bg-secondary/40`, headlines `/40`,
 *     secondary text `/30`, tertiary `/20`
 *   - `animate-pulse` only
 *   - NO spinners. The brand reads as editorial real-estate, not a SaaS
 *     loading screen.
 *
 * Each primitive is a leaf div composition — no client state. Drop them
 * directly into `<Suspense fallback={...}>` boundaries on any public route.
 */

import { cn } from "@/lib/utils";

const PULSE = "animate-pulse";

/** Generic filler used when a section's exact shape is unknown. */
export function EditorialBlockSkeleton({
  className,
  height = "h-64",
}: {
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn(PULSE, "w-full border border-border bg-secondary/30", height, className)} aria-hidden />
  );
}

// ─── Listing card primitives ────────────────────────────────────────────

/**
 * Mirrors `CompactListingTile` proportions: 4:3 image block + 3 text lines
 * + a footer row. Heights are chosen so the streamed real card lands within
 * ±8px of the skeleton, preventing layout shift.
 */
export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(PULSE, "flex flex-col border border-border bg-secondary/40", className)} aria-hidden>
      <div className="aspect-[4/3] w-full bg-secondary/40" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-3/4 bg-secondary/40" />
        <div className="h-4 w-1/2 bg-secondary/30" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-1/3 bg-secondary/30" />
          <div className="h-4 w-1/4 bg-secondary/20" />
        </div>
      </div>
    </div>
  );
}

export function ListingCardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr))]",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="min-w-0">
          <ListingCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/**
 * Wider variant for the homepage hero rail and similar above-the-fold rows.
 * Same opacity layering, taller image proportion.
 */
export function ListingsPreviewSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul
      className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="min-w-0">
          <ListingCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

// ─── Agent primitives ────────────────────────────────────────────────────

export function AgentCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(PULSE, "flex gap-4 border border-border bg-secondary/40 p-4", className)} aria-hidden>
      <div className="h-16 w-16 shrink-0 bg-secondary/40" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-2/3 bg-secondary/40" />
        <div className="h-4 w-1/2 bg-secondary/30" />
        <div className="h-3 w-1/3 bg-secondary/20" />
      </div>
    </div>
  );
}

export function AgentGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <ul
      className={cn(
        "grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="min-w-0">
          <AgentCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

// ─── Article (blog) primitives ──────────────────────────────────────────

export function ArticleCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(PULSE, "flex flex-col border border-border bg-secondary/40", className)} aria-hidden>
      <div className="aspect-[16/9] w-full bg-secondary/40" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-1/4 bg-secondary/20" />
        <div className="h-5 w-5/6 bg-secondary/40" />
        <div className="h-4 w-3/4 bg-secondary/30" />
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <ul
      className={cn("grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3", className)}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="min-w-0">
          <ArticleCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export function BlogRelatedSkeleton({ count = 3 }: { count?: number }) {
  return <ArticleGridSkeleton count={count} className="mt-6" />;
}

// ─── Review primitives ──────────────────────────────────────────────────

export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(PULSE, "space-y-3 border border-border bg-secondary/40 p-4", className)} aria-hidden>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-secondary/40" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-secondary/40" />
          <div className="h-3 w-20 bg-secondary/20" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-secondary/30" />
        <div className="h-3 w-11/12 bg-secondary/30" />
        <div className="h-3 w-3/4 bg-secondary/20" />
      </div>
    </div>
  );
}

export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Metric primitives (public agent / owner detail pages) ─────────────

export function MetricTileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(PULSE, "space-y-2 border border-border bg-secondary/40 p-4", className)} aria-hidden>
      <div className="h-3 w-1/2 bg-secondary/20" />
      <div className="h-8 w-2/3 bg-secondary/40" />
    </div>
  );
}

export function MetricRowSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <MetricTileSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Compare + adjacent navigation ──────────────────────────────────────

export function CompareSuggestionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      <div className={cn(PULSE, "h-5 w-32 bg-secondary/30")} />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(PULSE, "flex gap-3 border border-border bg-secondary/40 p-3")}
        >
          <div className="h-14 w-20 shrink-0 bg-secondary/40" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 bg-secondary/40" />
            <div className="h-3 w-1/2 bg-secondary/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdjacentNavSkeleton() {
  return (
    <div className="mb-6 flex items-center justify-between gap-3" aria-hidden>
      <div className={cn(PULSE, "h-12 w-32 border border-border bg-secondary/30")} />
      <div className={cn(PULSE, "h-12 w-32 border border-border bg-secondary/30")} />
    </div>
  );
}

// ─── Map page primitives (dark variant) ─────────────────────────────────

/**
 * Map surface lives on a slate-themed dark background. Standard
 * `bg-secondary` layers blend into nothing there, so this variant uses
 * `bg-white/10 → /5` for visibility on dark.
 */
export function MapDetailCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(PULSE, "space-y-3 border border-white/10 bg-white/5 p-4", className)} aria-hidden>
      <div className="aspect-[4/3] w-full bg-white/10" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-white/10" />
        <div className="h-4 w-1/2 bg-white/10" />
        <div className="h-4 w-2/3 bg-white/5" />
      </div>
    </div>
  );
}

export function MapPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-950" aria-hidden>
      <div className="hidden w-80 shrink-0 space-y-3 border-r border-white/10 bg-slate-900 p-4 lg:block">
        <div className={cn(PULSE, "h-10 w-full bg-white/10")} />
        <div className={cn(PULSE, "h-4 w-2/3 bg-white/10")} />
        <div className={cn(PULSE, "h-32 w-full bg-white/5")} />
      </div>
      <div className={cn(PULSE, "flex-1 bg-white/5")} />
      <div className="hidden w-96 shrink-0 border-l border-white/10 bg-slate-900 p-4 xl:block">
        <MapDetailCardSkeleton />
      </div>
    </div>
  );
}
