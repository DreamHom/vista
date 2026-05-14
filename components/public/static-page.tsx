import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { type StaticPageContent } from "@/lib/public-site";
import { cn } from "@/lib/utils";

export function StaticPage({ page }: { page: StaticPageContent }) {
  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{page.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {page.description}
        </p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {page.sections.map((section) => (
          <section key={section.heading} className="border border-border bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {page.cta ? (
        <div className="mt-8 border border-border bg-secondary/40 p-6">
          <p className="text-sm text-muted-foreground">
            Want to keep exploring the platform instead of reading policy copy?
          </p>
          <Link href={page.cta.href} className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-4")}>
            {page.cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
