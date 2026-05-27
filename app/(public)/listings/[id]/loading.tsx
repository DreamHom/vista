/**
 * Route-scoped loading state for /listings/[id].
 *
 * Renders during the Server Component's async waterfall so users see a
 * skeleton instead of a blank screen on slow haven responses. Without
 * this file, Next.js falls back to the parent layout's loading state
 * (which is just the static shell).
 */
export default function ListingDetailLoading() {
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6 h-9 w-full animate-pulse border border-border bg-secondary/40" />
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="aspect-[4/3] animate-pulse border border-border bg-secondary/40" />
        <div className="space-y-3">
          <div className="h-10 w-3/4 animate-pulse bg-secondary/40" />
          <div className="h-4 w-1/2 animate-pulse bg-secondary/30" />
          <div className="h-4 w-2/3 animate-pulse bg-secondary/30" />
          <div className="mt-6 h-12 w-full animate-pulse bg-secondary/40" />
        </div>
      </div>
      <div className="mt-8 h-64 w-full animate-pulse border border-border bg-secondary/30" />
    </div>
  );
}
