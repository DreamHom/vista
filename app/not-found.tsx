import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10 md:py-14">
      <div className="max-w-2xl border border-border bg-card p-8 text-center md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-foreground">
          <Compass className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          This page doesn&apos;t exist yet.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          The route may have moved, the link may be outdated, or the page simply hasn&apos;t been built yet.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
            <Home className="h-4 w-4" aria-hidden />
            Go Home
          </Link>
          <Link href="/listings" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
