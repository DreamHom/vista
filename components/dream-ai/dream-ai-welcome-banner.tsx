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
        "relative isolate w-full overflow-hidden border-b border-border/60 px-4 py-10 text-center sm:px-8 sm:py-12 md:py-14",
        "bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.22)_0%,transparent_55%),radial-gradient(circle_at_100%_100%,hsl(var(--accent)/0.12)_0%,transparent_45%),linear-gradient(180deg,hsl(var(--muted)/0.35)_0%,hsl(var(--background))_100%)]",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 border border-border/80 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-eyebrow text-muted-foreground backdrop-blur-sm">
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
            ? "We&apos;ll stream picks from Haven&apos;s live matcher."
            : "We&apos;ll match locally; sign in for saved threads and the live engine."}
        </p>
      </div>
    </div>
  );
}
