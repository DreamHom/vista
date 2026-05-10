import Link from "next/link";
import { Logo } from "@/components/icons";
import { BRAND, FOOTER_GROUPS } from "@/lib/constants";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-fg-muted leading-relaxed">
              {BRAND.tagline} Built for owners, agents and applicants who deserve a
              transparent way to do real estate. Powered by {BRAND.partner} home financing.
            </p>
          </div>
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted hover:text-fg transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-fg-subtle md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Built at the Moniepoint DreamDev
            Bootcamp 2026.
          </p>
          <p>
            Listings are user-submitted; verified badges are earned, not bought. Read{" "}
            <Link
              href="/trust-and-safety"
              className="underline underline-offset-2 hover:text-fg"
            >
              how we verify
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
