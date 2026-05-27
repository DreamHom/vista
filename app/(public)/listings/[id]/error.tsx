"use client";

/**
 * Route-scoped error boundary for /listings/[id].
 *
 * Without this file, any throw inside the Server Component bubbles all the
 * way to `app/error.tsx` (the full-page "Something went wrong" panel), which
 * is jarring for a transient haven hiccup. This boundary keeps the user
 * inside the listings flow: clear copy, a Try Again button that calls
 * `reset()` (re-runs the segment's data fetches without a full page reload),
 * and a fallback back to the browse index.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ListingDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[listings/[id]] segment error:", error);
    }
  }, [error]);

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-xl border border-border bg-card p-8 md:p-10">
        <div className="flex h-12 w-12 items-center justify-center border border-border bg-secondary/50 text-foreground">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          We couldn't load this listing
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Haven might be having a momentary hiccup. The retry usually catches a fresh response.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "gap-2")}
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
          <Link
            href="/listings"
            className={cn(buttonVariants({ variant: "outline", size: "md" }), "gap-2")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to listings
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-muted-foreground tabular-nums">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
