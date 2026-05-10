import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import { Icon } from "@/components/icons";
import { getAgent, listings } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = getAgent(id);
  return { title: agent ? agent.name : "Agent" };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const agentListings = listings.filter((l) => l.agentId === agent.id);

  return (
    <>
      <Section className="bg-bg-elevated border-b border-border py-10">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6"
        >
          ← All agents
        </Link>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-5">
            <Avatar name={agent.name} src={agent.avatar} size={88} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
                  {agent.name}
                </h1>
                {agent.verified && <VerifiedBadge kind="agent" />}
              </div>
              <p className="mt-1 text-fg-muted">{agent.headline}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Icon.Pin size={12} /> {agent.city}
                </span>
                <span>·</span>
                <span>Joined {formatDate(agent.joinedAt)}</span>
                <span>·</span>
                <span>Speaks {agent.languages.join(", ")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`#`} leadingIcon={<Icon.Chat size={16} />}>
              Message {agent.name.split(" ")[0]}
            </ButtonLink>
            <ButtonLink href={`#`} variant="outline" leadingIcon={<Icon.Bookmark size={16} />}>
              Save agent
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section className="py-10 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Performance
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Rating" value={agent.rating.toFixed(1)} sub={`${agent.reviews} reviews`} />
              <Stat label="Deals closed" value={`${agent.dealsClosed}`} sub="lifetime" />
              <Stat label="Response rate" value={`${agent.responseRate}%`} sub={`~${agent.responseTimeMins} min`} />
              <Stat label="Agency fee" value={`${agent.feePercent}%`} sub="declared up front" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Areas covered
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.areasCovered.map((a) => (
                <Badge key={a} tone="muted" leadingIcon={<Icon.Pin size={10} />}>
                  {a}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Specialisations
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.specializations.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <h2 className="text-xl font-semibold text-fg">About {agent.name.split(" ")[0]}</h2>
          <p className="mt-3 text-fg-muted leading-relaxed">{agent.bio}</p>

          <h2 className="mt-12 text-xl font-semibold text-fg">
            Active listings ({agentListings.length})
          </h2>
          {agentListings.length ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {agentListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-fg-muted">
              No live listings right now. Drop a message to discuss off-market options.
            </p>
          )}

          <h2 className="mt-12 text-xl font-semibold text-fg">Recent reviews</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                name: "Daniel O.",
                body: "Showed up early, knew the building and didn't waste my time on units that didn't match. Closed in 8 days.",
                rating: 5,
              },
              {
                name: "Adaora N.",
                body: "Honest about the flooded street nobody else mentioned. Saved me a year of regret.",
                rating: 5,
              },
              {
                name: "Femi A.",
                body: "Patient through three rounds of counter-offers. Owner finally agreed to my number.",
                rating: 4.5,
              },
            ].map((r, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-bg-elevated p-5">
                <div className="flex items-center gap-2 text-sm">
                  <Icon.Star size={14} className="text-accent" />
                  <span className="font-semibold text-fg">{r.rating}</span>
                  <span className="text-fg-subtle">·</span>
                  <span className="text-fg-muted">{r.name}</span>
                </div>
                <p className="mt-2 text-sm text-fg leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-fg">{value}</p>
      {sub && <p className="text-xs text-fg-muted">{sub}</p>}
    </div>
  );
}
