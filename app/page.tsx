import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            DreamHomes
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Sign in
            </Link>
            <Link href="/register" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="container flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Moniepoint DreamDev Bootcamp · Capstone 2026
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Making dreams come true, <span className="text-primary">one home at a time.</span>
        </h1>
        <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          A transparent, trust-first property platform connecting owners, agents and applicants.
          Discover listings, schedule inspections, and close deals — all on platform.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/listings" className={buttonVariants({ variant: "primary", size: "lg" })}>
            Browse listings
          </Link>
          <Link href="/register" className={buttonVariants({ variant: "outline", size: "lg" })}>
            List a property
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DreamHomes · Built from first principles.
        </div>
      </footer>
    </main>
  );
}
