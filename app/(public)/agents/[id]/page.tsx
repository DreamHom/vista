import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  Check,
  ChevronLeft,
  Circle,
  Clock3,
  Home,
  MapPin,
  MessageSquare,
  Star,
} from "lucide-react";
import {
  CompactListingTile,
  PersonAvatar,
  PrimaryCtaRow,
  RatingRow,
  VerificationBadge,
} from "@/components/public/public-components";
import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import {
  getAgentById,
  getAgentReviews,
  getListingsForAgent,
  reviewRatingHistogram,
  summarizeAgentListings,
} from "@/lib/seed/public-data";
import type { PublicAgent, PublicReview } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) return {};

  return {
    title: agent.name,
    description: `DreamHomes profile for ${agent.name}: reviews, active listings, and how to get in touch.`,
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) notFound();

  const [listings, reviews] = await Promise.all([getListingsForAgent(agent.id), getAgentReviews(agent.id)]);
  const insights = summarizeAgentListings(listings);
  const histogram = reviewRatingHistogram(reviews);
  const histogramMax = Math.max(...histogram, 1);

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6" aria-label="Breadcrumb">
        <Link
          href="/agents"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-9 gap-1 px-2 text-muted-foreground hover:text-foreground",
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          All agents
        </Link>
      </nav>

      <section className="border border-border bg-card">
        <div className="border-b border-border p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <PersonAvatar name={agent.name} size={88} className="shrink-0 text-lg" />
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Agent</p>
                <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {agent.name}
                </h1>
                {agent.legalName ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Legal name on file: <span className="text-foreground">{agent.legalName}</span>
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {agent.verified ? <VerificationBadge verified label="Verified on DreamHomes" /> : null}
                  <span className="text-sm text-muted-foreground">
                    Member since{" "}
                    {agent.joinedAt
                      ? new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" }).format(new Date(agent.joinedAt))
                      : "recently"}
                  </span>
                </div>
              </div>
              <RatingRow rating={agent.averageRating} reviewCount={agent.reviewCount} />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              icon={<Briefcase className="h-4 w-4" aria-hidden />}
              label="Deals closed"
              value={String(agent.closedDealCount ?? 0)}
              hint="Completed on DreamHomes"
            />
            <MetricTile
              icon={<Home className="h-4 w-4" aria-hidden />}
              label="Active listings"
              value={String(listings.length)}
              hint="Homes they represent today"
            />
            <MetricTile
              icon={<Star className="h-4 w-4" aria-hidden />}
              label="Client rating"
              value={agent.averageRating !== null ? `${agent.averageRating.toFixed(1)} / 5` : "Not enough yet"}
              hint={`${agent.reviewCount} review${agent.reviewCount === 1 ? "" : "s"}`}
            />
            <MetricTile
              icon={<Clock3 className="h-4 w-4" aria-hidden />}
              label="Typical reply"
              value={agent.medianResponseMinutes !== null ? `${agent.medianResponseMinutes} min` : "Not yet"}
              hint={agent.medianResponseMinutes !== null ? "Median when they respond" : "Not shown for this agent"}
            />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <PortfolioSnapshot agent={agent} insights={insights} />

          <TrustChecklist agent={agent} />

          <section className="border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Client reviews</h2>
                <p className="mt-1 text-sm text-muted-foreground">What renters and buyers have said after working together.</p>
              </div>
            </div>

            {reviews.length ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="border border-border bg-secondary/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Rating mix</p>
                  <ul className="mt-4 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = histogram[star - 1] ?? 0;
                      const widthPct = (count / histogramMax) * 100;
                      return (
                        <li key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-14 shrink-0 tabular-nums text-muted-foreground">{star} stars</span>
                          <div className="h-2 min-w-0 flex-1 bg-muted">
                            <div className="h-full bg-foreground/70 transition-all" style={{ width: `${widthPct}%` }} />
                          </div>
                          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                No reviews yet. When clients leave feedback after a deal or viewing, it will show up here. You can still browse their listings below.
              </p>
            )}
          </section>

          <section className="border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Homes they represent</h2>
              <p className="text-sm text-muted-foreground">{listings.length} active on DreamHomes</p>
            </div>
            {listings.length ? (
              <div className="mt-5 grid gap-4">
                {listings.map((listing) => (
                  <CompactListingTile key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                This agent does not have published listings here at the moment. You can still save their profile or check back later.
              </p>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Work with this agent</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Create a free account to book a viewing, send a message, or make an offer. Everything stays in one place for you and the agent.
            </p>
            <div className="mt-6 min-w-0">
              <PrimaryCtaRow
                layout="stack"
                scheduleHref={`/signup?next=/agents/${agent.id}`}
                contactHref={`/signup?next=/agents/${agent.id}`}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="border border-border bg-background p-4">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center bg-secondary text-foreground">{icon}</div>
      <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function PortfolioSnapshot({
  agent,
  insights,
}: {
  agent: PublicAgent;
  insights: ReturnType<typeof summarizeAgentListings>;
}) {
  return (
    <section className="border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Where they&apos;re active</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Derived from homes they currently list, so you see real markets, not a marketing blurb.
          </p>
        </div>
      </div>

      {insights.activeCount === 0 ? (
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {agent.name.trim().split(/\s+/)[0] || "This agent"} doesn&apos;t have live listings on DreamHomes right now. They may be between stock or onboarding new properties. Worth checking back.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {insights.areas.length ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Areas showing up in their stock</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {insights.areas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 border border-border bg-secondary/40 px-3 py-1.5 text-sm text-foreground"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <div className="border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Listing mix</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {insights.rentCount} for rent · {insights.saleCount} for sale
              </p>
            </div>
            {insights.priceMinNgn != null && insights.priceMaxNgn != null ? (
              <div className="border border-border bg-background p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Asking prices on their stock</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  {insights.priceMinNgn === insights.priceMaxNgn
                    ? formatNaira(insights.priceMinNgn, { compact: true })
                    : `${formatNaira(insights.priceMinNgn, { compact: true })} – ${formatNaira(insights.priceMaxNgn, { compact: true })}`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Across current listings; excludes off-market deals.</p>
              </div>
            ) : null}
          </div>

          {insights.topPropertyTypes.length ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">Property types they list most</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {insights.topPropertyTypes.map((row) => (
                  <span key={row.label} className="border border-border bg-background px-3 py-1.5 text-sm text-foreground">
                    {row.label} · {row.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function TrustChecklist({ agent }: { agent: PublicAgent }) {
  const idOk = Boolean(agent.identityVerifiedAt);
  const credOk = Boolean(agent.agentCredentialVerifiedAt);

  return (
    <section className="border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">Trust checklist</h2>
      <p className="mt-1 text-sm text-muted-foreground">Straightforward checks you can rely on before you message anyone.</p>

      <ul className="mt-6 space-y-0 divide-y divide-border border border-border">
        <ChecklistRow
          ok={idOk}
          title="Government-linked identity"
          detail={
            idOk && agent.identityVerifiedAt
              ? `Confirmed on ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(agent.identityVerifiedAt))}.`
              : "We have not confirmed ID for this profile yet."
          }
        />
        <ChecklistRow
          ok={credOk}
          title="Agent credentials"
          detail={
            credOk && agent.agentCredentialVerifiedAt
              ? `Professional credentials checked on ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(agent.agentCredentialVerifiedAt))}.`
              : "Credentials not verified yet. Ask questions and read reviews."
          }
        />
        <ChecklistRow
          ok={agent.medianResponseMinutes !== null}
          title="Responsiveness"
          detail={
            agent.medianResponseMinutes !== null
              ? `Typically replies in about ${agent.medianResponseMinutes} minutes when active.`
              : "We don’t have enough message history to estimate speed yet."
          }
        />
      </ul>
    </section>
  );
}

function ChecklistRow({ ok, title, detail }: { ok: boolean; title: string; detail: string }) {
  return (
    <li className="flex gap-3 p-4">
      <span className="mt-0.5 shrink-0 text-foreground" aria-hidden>
        {ok ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Circle className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{review.reviewerName}</p>
          <p className="text-sm text-muted-foreground">{review.reviewerRole}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          {review.rating.toFixed(1)}
          <span>{review.date}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
      <Link href={`/listings/${review.listingId}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80">
        <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
        See the home this review is about
      </Link>
    </article>
  );
}
