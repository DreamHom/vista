"use client";

import { Sparkles } from "lucide-react";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import { cn } from "@/lib/utils";

export function DreamAiWelcomeBanner({
  signedIn,
  className,
}: {
  signedIn: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full border-b border-border bg-background px-4 py-10 text-center sm:px-8 sm:py-12 md:py-14",
        className,
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 border border-border px-3 py-1 text-[11px] uppercase tracking-eyebrow text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" aria-hidden />
          Dream AI · Beta
        </span>
        <h1 className="text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
          Tell us your{" "}
          <TextShimmer as="span" duration={2.4} className="text-accent">
            dream home
          </TextShimmer>
          .
        </h1>
        <p className="max-w-lg text-balance text-sm leading-relaxed text-muted-foreground md:text-base">
          Describe the home you want.{" "}
          {signedIn
            ? "We&apos;ll send your question to Haven and return matching listings."
            : "We&apos;ll send your question and show what Haven returns."}
        </p>
      </div>
    </div>
  );
}
