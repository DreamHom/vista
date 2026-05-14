import Link from "next/link";
import { ArrowRight, Briefcase, Clock3, ShieldCheck, Star } from "lucide-react";

import type { PublicAgent } from "@/lib/seed/public-data";

import { PersonAvatar } from "./person-avatar";

export function AgentCard({ agent }: { agent: PublicAgent }) {
  const href = `/agents/${agent.id}`;
  const rating = agent.averageRating;
  const reviews = agent.reviewCount;
  const deals = agent.closedDealCount ?? 0;
  const responseMin = agent.medianResponseMinutes;

  return (
    <Link
      href={href}
      className="group block border border-border bg-card text-left transition-colors hover:border-foreground/30 hover:bg-secondary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="p-5 md:p-6">
        <span className="sr-only">Open agent profile for {agent.name}</span>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <PersonAvatar name={agent.name} size={52} className="shrink-0 text-sm font-medium" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-lg font-semibold tracking-tight text-foreground group-hover:text-accent">{agent.name}</p>
              {agent.verified ? (
                <ShieldCheck
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-label="Verified on DreamHomes"
                  strokeWidth={2.25}
                />
              ) : null}
            </div>
          </div>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
          <span
            className="inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5"
            title={rating !== null ? "Average from client reviews" : undefined}
          >
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
              <span className="text-xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
                {rating !== null ? rating.toFixed(1) : "—"}
              </span>
            </span>
            {reviews > 0 ? (
              <span className="text-muted-foreground">
                <span className="tabular-nums text-foreground/90">{reviews}</span> reviews
              </span>
            ) : null}
          </span>

          <span className="mx-2 hidden text-muted-foreground sm:inline" aria-hidden>
            ·
          </span>

          <span className="inline-flex items-center gap-1.5 text-foreground" title="Deals closed on DreamHomes">
            <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-lg font-semibold tabular-nums leading-none">{deals}</span>
          </span>

          <span className="mx-2 hidden text-muted-foreground sm:inline" aria-hidden>
            ·
          </span>

          <span className="inline-flex items-center gap-1.5 text-foreground" title="Median time to first reply">
            <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-lg font-semibold tabular-nums leading-none">
              {responseMin !== null ? `${responseMin}m` : "—"}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
