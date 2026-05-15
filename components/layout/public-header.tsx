"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { PublicAuthDesktopCluster, PublicAuthMobileCluster } from "@/components/layout/public-auth-cluster";
import { PUBLIC_PRIMARY_NAV } from "@/lib/public-site";

/**
 * Marketing header for public routes (landing + /listings/*).
 *
 * Single-row layout that mirrors the reference design language: small
 * typographic nav, brand mark on the left, locale toggle + auth CTAs on
 * the right. No decoration: the page itself is the show.
 */
export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="DreamHomes home">
          <LogoMark size="md" />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {PUBLIC_PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <PublicAuthDesktopCluster className="hidden md:flex" />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="inline-flex h-11 w-11 items-center justify-center text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container space-y-4 py-4">
            <nav className="flex flex-col gap-1">
              {PUBLIC_PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border border-transparent px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <PublicAuthMobileCluster variant="header" onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
