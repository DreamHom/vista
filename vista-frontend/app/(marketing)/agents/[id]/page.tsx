import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import * as Users from "@/lib/api/users";
import { HavenError } from "@/lib/api/http";
import {
  publicProfileAgentVerified,
  publicProfileDisplayName,
  publicProfileId,
} from "@/lib/api/public-profile";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const profile = await Users.getUserProfile(id);
    return { title: publicProfileDisplayName(profile) };
  } catch {
    return { title: "Agent" };
  }
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await Users.getUserProfile(id).catch((err) => {
    if (err instanceof HavenError && err.status === 404) notFound();
    throw err;
  });
  const reviews = await Users.getUserReviews(id).catch(() => []);

  const label = publicProfileDisplayName(profile);
  const first = label.split(/\s+/)[0] ?? label;
  const rating = profile.averageRating ?? 0;

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
            <Avatar name={label} size={88} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
                  {label}
                </h1>
                {publicProfileAgentVerified(profile) ? (
                  <VerifiedBadge kind="agent" />
                ) : profile.role === "AGENT" ? (
                  <Badge tone="warn">Credentials pending</Badge>
                ) : null}
                {profile.suspended ? (
                  <Badge tone="danger">Suspended</Badge>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Icon.Pin size={12} /> {profile.role}
                </span>
                {profile.joinedAt ? (
                  <>
                    <span>·</span>
                    <span>Joined {formatDate(profile.joinedAt)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink
              href={`/dashboard/messages?to=${publicProfileId(profile)}`}
              leadingIcon={<Icon.Chat size={16} />}
            >
              Message {first}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section className="py-10 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              On DreamHomes
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat
                label="Avg. rating"
                value={rating.toFixed(1)}
                sub={`${profile.reviewCount} reviews`}
              />
              <Stat
                label="Identity"
                value={
                  profile.identityVerifiedAt ? "Verified" : "Not verified"
                }
                sub="from haven profile"
              />
            </div>
          </div>
        </aside>

        <div>
          <h2 className="text-xl font-semibold text-fg">Recent reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">
              No reviews yet. Reviews can only be written after a deal closes —
              you can&rsquo;t farm them, you can&rsquo;t buy them.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border bg-bg-elevated p-5"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Icon.Star size={14} className="text-accent" />
                    <span className="font-semibold text-fg">{r.rating}</span>
                    <span className="text-fg-subtle">·</span>
                    <span className="text-fg-muted">{r.authorName}</span>
                    <span className="text-fg-subtle">·</span>
                    <span className="text-fg-subtle">
                      {formatRelativeTime(r.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fg leading-relaxed">
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
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
