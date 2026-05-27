/**
 * Section-level skeletons for the authenticated dashboards.
 *
 * Context note: dashboard primitives (`Card`, `SectionCard`, `MetricCard`)
 * use `rounded-3xl` and `border-border/70`. These skeletons match that
 * radius and that border tone so when the streamed content arrives, the
 * silhouette already feels right — no jarring corner snap.
 *
 * Distinct from `components/public/skeletons.tsx`: that file is sharp
 * corners + hairline borders + `bg-secondary/40` layered opacity for the
 * editorial public surfaces. This file is dashboard-tuned.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PULSE = "animate-pulse";

/** Mirrors `MetricCard` from `components/dashboard/applicant-ui.tsx`. */
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("border-border/70 bg-white shadow-none", className)} aria-hidden>
      <CardHeader className="pb-3 space-y-2">
        <div className={cn(PULSE, "h-4 w-1/2 bg-muted/60")} />
        <div className={cn(PULSE, "h-9 w-2/3 bg-muted/80")} />
      </CardHeader>
      <CardContent>
        <div className={cn(PULSE, "h-4 w-3/4 bg-muted/40")} />
      </CardContent>
    </Card>
  );
}

export function MetricRowSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Mirrors `SectionCard`. Optional title (rendered as real text so the heading
 * is announced to screen readers while body is shimmer). Rows controls how
 * many shimmer lines fill the body.
 */
export function SectionCardSkeleton({
  title,
  rows = 3,
  className,
}: {
  title?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/70 bg-white shadow-none", className)} aria-hidden>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {title ? (
            <p className="text-base font-semibold text-foreground">{title}</p>
          ) : (
            <div className={cn(PULSE, "h-5 w-32 bg-muted/60")} />
          )}
          <div className={cn(PULSE, "h-4 w-48 bg-muted/40")} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn(PULSE, "h-10 w-10 shrink-0 rounded-full bg-muted/60")} />
              <div className="flex-1 space-y-2">
                <div className={cn(PULSE, "h-4 w-2/3 bg-muted/60")} />
                <div className={cn(PULSE, "h-3 w-1/2 bg-muted/40")} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Compact list inside a SectionCard — useful for recent-activity rails. */
export function ActivityListSkeleton({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-3", className)} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className={cn(PULSE, "mt-1 h-2 w-2 shrink-0 rounded-full bg-muted/80")} />
          <div className="flex-1 space-y-1.5">
            <div className={cn(PULSE, "h-4 w-3/4 bg-muted/60")} />
            <div className={cn(PULSE, "h-3 w-1/2 bg-muted/40")} />
          </div>
          <div className={cn(PULSE, "h-3 w-16 shrink-0 bg-muted/30")} />
        </li>
      ))}
    </ul>
  );
}

/** Grid of offer cards (or any card with a header + 2-line body + amount). */
export function OfferGridSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/70 bg-white shadow-none">
          <CardHeader className="pb-3 space-y-2">
            <div className={cn(PULSE, "h-4 w-1/3 bg-muted/40")} />
            <div className={cn(PULSE, "h-6 w-2/3 bg-muted/60")} />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={cn(PULSE, "h-3 w-full bg-muted/40")} />
            <div className={cn(PULSE, "h-3 w-5/6 bg-muted/40")} />
            <div className="flex items-center justify-between pt-2">
              <div className={cn(PULSE, "h-4 w-24 bg-muted/40")} />
              <div className={cn(PULSE, "h-8 w-20 bg-muted/60")} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Vertical list of inspection rows (date + listing + status badges). */
export function InspectionListSkeleton({
  count = 2,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-3", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-start gap-4 rounded-3xl border border-border/70 bg-white p-4">
          <div className={cn(PULSE, "h-16 w-16 shrink-0 rounded-2xl bg-muted/60")} />
          <div className="flex-1 space-y-2">
            <div className={cn(PULSE, "h-5 w-3/4 bg-muted/60")} />
            <div className={cn(PULSE, "h-4 w-1/2 bg-muted/40")} />
            <div className="flex gap-2 pt-1">
              <div className={cn(PULSE, "h-5 w-16 rounded-full bg-muted/40")} />
              <div className={cn(PULSE, "h-5 w-20 rounded-full bg-muted/40")} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
