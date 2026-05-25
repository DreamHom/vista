"use client";

import * as React from "react";

import { DreamAiChat } from "@/components/dream-ai/dream-ai-chat";
import { PublicApiNotice } from "@/components/public/public-components";
import { cn } from "@/lib/utils";
import type { PublicListing } from "@/lib/seed/public-data";

const shellEase = "cubic-bezier(0.22, 1, 0.36, 1)";

type DreamAiPageShellProps = {
  listings: PublicListing[];
  /** From `/dream-ai?prompt=…` (e.g. dashboard starter chips). */
  initialPrompt?: string;
  initialCompareIds?: number[];
};

/**
 * Dream AI chat card. First message expands to fill the viewport below the header;
 * the welcome banner lives inside the card (centered gradient hero).
 */
export function DreamAiPageShell({ listings, initialPrompt, initialCompareIds }: DreamAiPageShellProps) {
  const [immersive, setImmersive] = React.useState(false);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center motion-reduce:transition-none",
        immersive ? "overflow-hidden px-3 py-2 md:px-4 md:py-3" : "container overflow-y-auto py-6 md:py-8",
        "transition-[padding] duration-500",
      )}
      style={{ transitionTimingFunction: shellEase }}
    >
      {listings.length === 0 && !immersive ? (
        <div className="mb-6 w-full max-w-3xl">
          <PublicApiNotice>
            Haven listing browse is unavailable at `{process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api"}` right now, so Dream AI has no live inventory to rank against.
          </PublicApiNotice>
        </div>
      ) : null}

      <div
        className={cn(
          "flex w-full flex-col overflow-hidden border border-border bg-card motion-reduce:transition-none",
          "transition-[box-shadow,border-radius] duration-500",
          immersive
            ? "min-h-0 max-w-5xl flex-1 shadow-2xl ring-1 ring-border/40 md:rounded-lg"
            : "max-w-3xl shrink-0 shadow-sm",
        )}
        style={{ transitionTimingFunction: shellEase }}
      >
        <DreamAiChat
          embedded
          listings={listings}
          initialPrompt={initialPrompt}
          initialCompareIds={initialCompareIds}
          occupyFullHeight={immersive}
          onConversationChange={setImmersive}
        />
      </div>
    </div>
  );
}
