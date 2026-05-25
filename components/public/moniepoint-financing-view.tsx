import type { ReactNode } from "react";
import Link from "next/link";
import { HeartHandshake, Sparkles } from "lucide-react";

import { MoniepointMark } from "@/components/partners/moniepoint-mark";
import { MoniepointBridgeBand, MoniepointWhatIsGlyph } from "@/components/public/moniepoint-financing-art";
import { AmbientFrame } from "@/components/illustrations/ambient-frame";
import { PageHeroViewport } from "@/components/layout/page-hero-viewport";
import { buttonVariants } from "@/components/ui/button";
import { MONIEPOINT_FINANCING } from "@/lib/content/moniepoint-financing";
import { cn } from "@/lib/utils";

function ProseSection({
  eyebrow,
  title,
  supporting,
  children,
}: {
  eyebrow: string;
  title: string;
  supporting?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 max-w-4xl text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {supporting ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{supporting}</p>
      ) : null}
      {children}
    </section>
  );
}

export function MoniepointFinancingView() {
  const c = MONIEPOINT_FINANCING;

  return (
    <div className="relative overflow-x-hidden bg-background">
      <PageHeroViewport className="border-b border-border bg-background">
        <div className="container flex flex-1 flex-col justify-center py-16 md:py-20 lg:py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-0">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{c.hero.eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground md:text-5xl md:leading-[1.08]">
                {c.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {c.hero.lead}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={c.cta.primaryHref} className={buttonVariants({ variant: "primary", size: "lg" })}>
                  {c.cta.primaryLabel}
                </Link>
                <Link href={c.cta.secondaryHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  {c.cta.secondaryLabel}
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{c.cta.heroHint}</p>
            </div>

            <aside className="border border-border bg-card p-6 shadow-sm md:p-8 lg:col-span-5 lg:max-w-md lg:justify-self-end xl:max-w-lg">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Sparkles className="h-5 w-5 shrink-0 motion-safe:animate-ambient-breathe" aria-hidden />
                <p className="text-xs font-medium uppercase tracking-eyebrow">Their public promise</p>
              </div>
              <blockquote className="mt-6 text-xl font-medium leading-snug tracking-tight text-foreground md:text-2xl">
                &ldquo;Simplified credit for business growth.&rdquo; Less paperwork, clearer steps, credit that fits how
                shops and teams actually run.
              </blockquote>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Moniepoint serves small and medium businesses with accessible loans, flexible amounts, and repayment
                rhythms aligned to real cash flow.
              </p>
              <div className="mt-8 border border-border bg-muted/30 p-4">
                <MoniepointMark />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Products, rates, and eligibility are set by Moniepoint only. This page explains the partnership; it is
                  not a loan application or product sheet.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </PageHeroViewport>

      <div className="relative bg-background">
        <div className="container relative py-14 md:py-20">
          <div className="space-y-12 md:space-y-16">
            <ProseSection
              eyebrow="In plain words"
              title={c.whatItIs.heading}
              supporting="Money sits beside every home decision. We keep the language plain so you know what DreamHomes does and what Moniepoint offers."
            >
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {c.whatItIs.paragraphs.map((paragraph, i) => (
                  <div
                    key={i}
                    className="relative flex flex-col gap-4 border border-border bg-card p-6 md:gap-5 md:p-7"
                  >
                    <AmbientFrame motion="float-delayed" decorative className="shrink-0">
                      <div className="inline-flex rounded-none border border-border bg-muted/40 p-2">
                        <MoniepointWhatIsGlyph index={i as 0 | 1 | 2} />
                      </div>
                    </AmbientFrame>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px] md:leading-relaxed">
                      {paragraph}
                    </p>
                  </div>
                ))}
              </div>
            </ProseSection>

            <section className="border border-border bg-muted/25 px-5 py-10 md:px-10 md:py-14">
              <div className="mx-auto max-w-3xl text-center">
                <HeartHandshake className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{c.bridge.heading}</h2>
                <AmbientFrame motion="float" decorative className="mx-auto mt-6 block w-full max-w-xl">
                  <MoniepointBridgeBand className="w-full" />
                </AmbientFrame>
              </div>
              <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-sm leading-relaxed text-muted-foreground md:text-base md:leading-relaxed">
                {c.bridge.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            <ProseSection eyebrow="How it works" title={c.howItWorks.heading} supporting={c.howItWorks.intro}>
              <ol className="mt-8 list-none space-y-4 p-0">
                {c.howItWorks.steps.map((step, i) => (
                  <li
                    key={step.title}
                    className="flex gap-4 border border-border bg-card p-5 md:gap-6 md:p-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted/50 text-sm font-semibold tabular-nums text-foreground">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[15px] md:leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </ProseSection>

            <ProseSection eyebrow={c.caseStudies.eyebrow} title={c.caseStudies.heading} supporting={c.caseStudies.disclaimer}>
              <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-10">
                {c.caseStudies.items.map((story) => (
                  <figure
                    key={story.name}
                    className="flex flex-col border border-border bg-muted/10 p-6 md:p-7"
                  >
                    <blockquote className="m-0 border-0 p-0">
                      <p className="font-sans text-[1.03rem] italic leading-snug tracking-tight text-foreground md:text-lg md:leading-snug">
                        &ldquo;{story.quote}&rdquo;
                      </p>
                    </blockquote>
                    <figcaption className="mt-6 text-[11px] font-medium uppercase tracking-eyebrow text-muted-foreground">
                      <span className="text-foreground">{story.name}</span>
                      <span className="mx-1.5 font-normal text-muted-foreground/40">·</span>
                      <span>{story.detail}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </ProseSection>

            <section className="border border-dashed border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
              {c.legalNote}
            </section>

            <div className="flex flex-col items-start justify-between gap-6 border border-border bg-card p-6 md:flex-row md:items-center md:p-8">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{c.cta.heading}</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{c.cta.body}</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                <Link href={c.cta.primaryHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full sm:w-auto")}>
                  {c.cta.primaryLabel}
                </Link>
                <Link
                  href={c.cta.secondaryHref}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
                >
                  {c.cta.secondaryLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
