import type { Metadata } from "next";
import { AgentCard, EmptyHint, PublicApiNotice } from "@/components/public/public-components";
import { AgentsToolbar } from "@/components/public/agents-toolbar";
import { SortAutoSubmitForm } from "@/components/public/sort-auto-submit";
import { searchAgents, type AgentSearchInput } from "@/lib/seed/public-data";

export const metadata: Metadata = {
  title: "Find an Agent",
  description: "Search DreamHomes agents by name, rating, and verification. Compare reviews and response time before you reach out.",
  alternates: { canonical: "/agents" },
  openGraph: {
    title: "Find an agent · DreamHomes",
    description: "Search DreamHomes agents by name, rating, and verification. Compare reviews and response time before you reach out.",
    url: "/agents",
  },
};

const SORT_OPTIONS = [
  { value: "highest-rated", label: "Highest rated" },
  { value: "most-deals", label: "Most deals closed" },
  { value: "newest", label: "Joined most recently" },
  { value: "most-active", label: "Most reviewed" },
] as const;

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<AgentSearchInput>;
}) {
  const params = await searchParams;
  const { agents, sort, backendUnavailable } = await searchAgents(params);

  return (
    <div className="container py-10 md:py-14">
      <AgentsToolbar params={params} sort={sort} />

      <section className="mt-8 space-y-6">
        {backendUnavailable ? (
          <PublicApiNotice>
            We can’t load the agent list right now. Check your connection and try again in a few minutes.
          </PublicApiNotice>
        ) : null}

        <div className="flex flex-col gap-4 border border-border bg-card p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {agents.length} {agents.length === 1 ? "agent" : "agents"} match what you asked for
            </p>
            <p className="text-sm text-muted-foreground">
              Each card shows ratings and activity we publish openly. Open a profile for listings, fees, and client reviews.
            </p>
          </div>

          <SortAutoSubmitForm
            action="/agents"
            appliedSort={sort}
            options={SORT_OPTIONS}
            label="Order results by"
            className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-end sm:justify-end lg:w-auto lg:max-w-none lg:shrink-0"
          >
            {params.q?.trim() ? <input type="hidden" name="q" value={params.q.trim()} /> : null}
            {params.minRating ? <input type="hidden" name="minRating" value={params.minRating} /> : null}
            {params.verified === "true" ? <input type="hidden" name="verified" value="true" /> : null}
          </SortAutoSubmitForm>
        </div>

        {agents.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <EmptyHint
            title="No agents match those filters"
            body="Try another spelling, lower the minimum rating, or clear verified-only to see more profiles."
          />
        )}
      </section>
    </div>
  );
}
