import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { buildDreamAiHref, DREAM_AI_DASHBOARD_PROMPTS } from "@/lib/dream-ai/prompt-link";
import { cn } from "@/lib/utils";

export function DreamAiDashboardCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border bg-white text-foreground shadow-none",
        className,
      )}
    >
      <div className="border-b border-border px-6 pb-5 pt-6">
        <p className="text-xs uppercase tracking-eyebrow text-primary">Dream AI</p>
        <h2 className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight">
          Continue your property search with Dream AI
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ask for neighbourhood fits, inspection prep, or budget guidance. Pick a prompt or open a fresh thread.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-muted-foreground">Try a prompt</p>
          <ul className="flex flex-col gap-2">
            {DREAM_AI_DASHBOARD_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <Link
                  href={buildDreamAiHref(prompt)}
                  className={cn(
                    "group flex w-full items-center gap-3 border border-border bg-secondary/30 px-4 py-3 text-left text-sm leading-snug text-foreground",
                    "transition-colors hover:border-primary/30 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                >
                  <span className="min-w-0 flex-1">{prompt}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={buildDreamAiHref()}
          className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-auto w-full")}
        >
          Open Dream AI
          <Sparkles className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
