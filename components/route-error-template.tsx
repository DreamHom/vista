"use client";

/**
 * Parameterized error-boundary surface for route-scoped `error.tsx` files.
 *
 * Generalizes the layout from `app/(public)/listings/[id]/error.tsx` so each
 * route only needs to specify its own copy and a back-link. Per-route
 * `error.tsx` becomes ~12 lines: import this, render it.
 *
 * Why per-route + this template (instead of just the global app/error.tsx):
 * a transient haven hiccup on one section shouldn't bounce the user out to
 * a generic "Something went wrong" panel. Keeping the chrome consistent
 * across routes preserves the editorial register.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RouteErrorTemplateProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** H1 copy. Specific to the surface that errored (e.g. "We couldn't load this listing"). */
  title: string;
  /** Body paragraph under the title. Should hint at next steps without being apologetic. */
  body: string;
  /** Where the back link goes when retry isn't enough. */
  backHref: string;
  /** Back-link text (e.g. "Back to listings"). */
  backLabel: string;
  /** Optional segment label for the dev console line — helps with debugging in dev. */
  logLabel?: string;
}

export function RouteErrorTemplate({
  error,
  reset,
  title,
  body,
  backHref,
  backLabel,
  logLabel,
}: RouteErrorTemplateProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[${logLabel ?? "route"}] segment error:`, error);
    }
  }, [error, logLabel]);

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-xl border border-border bg-card p-8 md:p-10">
        <div className="flex h-12 w-12 items-center justify-center border border-border bg-secondary/50 text-foreground">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{body}</p>
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
            href={backHref}
            className={cn(buttonVariants({ variant: "outline", size: "md" }), "gap-2")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-muted-foreground tabular-nums">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
