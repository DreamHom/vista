import Link from "next/link";
import { ArrowRight, FileText, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { PolicyDocument } from "@/lib/content/policies";
import { cn } from "@/lib/utils";

function relatedPolicies(slug: PolicyDocument["slug"]) {
  if (slug === "privacy") {
    return [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/cookies", label: "Cookie Policy" },
    ] as const;
  }
  if (slug === "terms") {
    return [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookies", label: "Cookie Policy" },
    ] as const;
  }
  return [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
  ] as const;
}

export function PolicyPage({ document }: { document: PolicyDocument }) {
  const related = relatedPolicies(document.slug);

  return (
    <div className="container max-w-6xl py-10 md:py-16">
      <header className="relative overflow-hidden border border-border bg-card shadow-[0_1px_0_rgba(15,23,42,0.06)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary before:content-['']">
        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {document.eyebrow}
                </span>
                <span className="text-xs text-muted-foreground">Last updated {document.lastUpdated}</span>
              </div>
              <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-[2.5rem]">
                {document.title}
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                {document.description}
              </p>
            </div>
            <a
              href={`mailto:${document.contactEmail}`}
              className="flex shrink-0 items-center gap-2 border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Mail className="h-4 w-4 text-primary" aria-hidden />
              {document.contactEmail}
            </a>
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,240px)_minmax(0,42rem)]">
        <aside className="h-fit lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">On this page</p>
          <nav className="mt-4 flex flex-col border border-border bg-card">
            {document.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="-ml-px border-l-2 border-transparent py-2.5 pl-4 pr-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/[0.05] hover:text-foreground"
              >
                {section.heading}
              </a>
            ))}
          </nav>

          <div className="mt-6 border border-border bg-secondary/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Related policies</p>
            <ul className="mt-3 space-y-2">
              {related.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm font-medium text-primary hover:text-primary/80">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 space-y-8">
          {document.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border border-border bg-card p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{section.heading}</h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-6 space-y-3 border-t border-border pt-6">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-snug text-foreground md:text-base">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <div className="grid gap-6 border border-border bg-secondary/15 p-6 md:grid-cols-2 md:gap-8 md:p-8">
            <div>
              <p className="text-sm font-semibold text-foreground">Questions this page did not answer?</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Send operational questions through Contact, or use the policy email in the header for privacy and legal routing.
              </p>
              <Link
                href="/contact"
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-5 inline-flex rounded-none")}
              >
                Contact DreamHomes
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="flex flex-col justify-center gap-3 border-t border-border pt-6 text-sm md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="font-medium text-foreground">Quick links</p>
              <div className="flex flex-col gap-2 text-muted-foreground">
                {related.map((item) => (
                  <Link key={item.href} href={item.href} className="w-fit font-medium text-primary hover:text-primary/80">
                    {item.label}
                  </Link>
                ))}
                <Link href="/contact" className="w-fit font-medium text-primary hover:text-primary/80">
                  Contact form
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
