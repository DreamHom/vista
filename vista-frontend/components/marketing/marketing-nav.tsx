import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo, Icon } from "@/components/icons";
import { NAV_LINKS } from "@/lib/constants";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="focus-ring rounded-md">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg rounded-full hover:bg-bg-sunken transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex h-10 items-center px-4 text-sm font-medium text-fg hover:text-brand transition"
          >
            Sign in
          </Link>
          <ButtonLink
            href="/register"
            size="md"
            trailingIcon={<Icon.ArrowRight size={16} />}
          >
            Get started
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
