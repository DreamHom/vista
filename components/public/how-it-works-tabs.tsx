"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { NumberedStep } from "@/components/landing/numbered-step";
import { cn } from "@/lib/utils";

interface JourneyTab {
  id: string;
  label: string;
  ctaHref: string;
  ctaLabel: string;
  steps: ReadonlyArray<{
    title: string;
    body: string;
  }>;
}

export function HowItWorksTabs({ tabs }: { tabs: readonly JourneyTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">How It Works</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          Open discovery. Documented next steps.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Pick your role and see how browsing, verification, inspections, and offers stay on DreamHomes instead of scattered chat.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={cn(
                buttonVariants({ variant: active.id === tab.id ? "primary" : "outline", size: "md" }),
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 border border-border bg-card p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{active.label}</p>
            <div className="mt-6 space-y-8">
              {active.steps.map((step, index) => (
                <NumberedStep
                  key={step.title}
                  number={String(index + 1).padStart(2, "0")}
                  title={step.title}
                  body={step.body}
                />
              ))}
            </div>
          </div>

          <div className="border border-border bg-secondary/40 p-5 lg:w-[260px]">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ready to start this path?
            </p>
            <Link href={active.ctaHref} className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-4 w-full")}>
              {active.ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
