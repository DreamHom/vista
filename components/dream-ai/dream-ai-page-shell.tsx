"use client";

import * as React from "react";

import { DreamAiChat } from "@/components/dream-ai/dream-ai-chat";
import { PublicApiNotice } from "@/components/public/public-components";
import { cn } from "@/lib/utils";
import type { PublicListing } from "@/lib/seed/public-data";

const shellEase = "cubic-bezier(0.22, 1, 0.36, 1)";

type DreamAiPageShellProps = {
  listings: PublicListing[];
};

/**
 * Wraps Dream AI marketing hero + chat card. When the user sends their first
 * message, the hero collapses and the chat panel animates to fill the main
 * column below the site header (navbar stays visible).
 */
export function DreamAiPageShell({ listings }: DreamAiPageShellProps) {
  const [immersive, setImmersive] = React.useState(false);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col motion-reduce:transition-none",
        immersive ? "overflow-hidden px-3 py-2 md:px-4 md:py-3" : "overflow-y-auto py-6 md:py-8 container",
        "transition-[padding] duration-500",
      )}
      style={{ transitionTimingFunction: shellEase }}
    >
      <div
        className={cn(
          "grid motion-reduce:transition-none",
          "transition-[grid-template-rows,opacity] duration-500",
          immersive ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
        style={{ transitionTimingFunction: shellEase }}
        aria-hidden={immersive}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mb-6 max-w-3xl pb-0.5">
            <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Dream AI</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Ask for a home the way you would describe it to a trusted friend.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Dream AI helps with discovery, pricing context, inspection prep, and shortlist refinement. It does not
              replace due diligence or negotiation.
            </p>
          </div>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className={cn("mb-6", immersive && "mb-3")}>
          <PublicApiNotice>
            Haven listing browse is unavailable at `{process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api"}` right now, so Dream AI has no live inventory to rank against.
          </PublicApiNotice>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden border border-border bg-card motion-reduce:transition-none",
          "transition-[transform,box-shadow,border-radius,margin] duration-500",
          immersive
            ? cn(
                "h-full min-h-0 flex-1 origin-top scale-100 shadow-2xl ring-1 ring-border/40",
                "max-md:rounded-none md:mx-auto md:max-w-5xl md:rounded-lg",
                "motion-reduce:scale-100",
              )
            : "min-h-0 shrink-0 origin-top scale-[0.992] shadow-none motion-reduce:scale-100",
        )}
        style={{ transitionTimingFunction: shellEase }}
      >
        <DreamAiChat
          embedded
          listings={listings}
          occupyFullHeight={immersive}
          onConversationChange={setImmersive}
        />
      </div>
    </div>
  );
}
