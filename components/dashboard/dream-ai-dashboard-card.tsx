import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { buildDreamAiHref, DREAM_AI_DASHBOARD_PROMPTS } from "@/lib/dream-ai/prompt-link";
import { cn } from "@/lib/utils";

export function DreamAiDashboardCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-[#1e3a52] bg-[#0c1b2a] text-white shadow-none",
        className,
      )}
    >
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(52,146,223,0.28)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(184,121,62,0.14)_0%,transparent_45%)] px-6 pb-5 pt-6">
        <p className="text-xs uppercase tracking-eyebrow text-slate-400">Dream AI</p>
        <h2 className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight">
          Continue your property search with Dream AI
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Ask for neighbourhood fits, inspection prep, or budget guidance. Pick a prompt or open a fresh thread.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-slate-500">Try a prompt</p>
          <ul className="flex flex-col gap-2">
            {DREAM_AI_DASHBOARD_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <Link
                  href={buildDreamAiHref(prompt)}
                  className={cn(
                    "group flex w-full items-center gap-3 border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm leading-snug text-slate-100",
                    "transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1b2a]",
                  )}
                >
                  <span className="min-w-0 flex-1">{prompt}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
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
