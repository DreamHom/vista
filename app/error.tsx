"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background font-sans antialiased">
      <div className="container flex min-h-[70vh] items-center justify-center py-10 md:py-14">
        <div className="max-w-2xl border border-border bg-card p-8 text-center md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-foreground">
            <AlertTriangle className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Something went wrong on our end.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            The page hit an unexpected issue. Try again or head back home while we recover.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => reset()} className={buttonVariants({ variant: "primary", size: "lg" })}>
              Try Again
            </button>
            <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
