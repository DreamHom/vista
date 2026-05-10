import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/icons";
import {
  getListing,
  getOwner,
  getAgent,
  getCommentsFor,
  getInspectionsFor,
} from "@/lib/mock-data";
import { formatCurrencyNGN, formatCurrencyNGNFull, formatRelativeTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = getListing(id);
  return {
    title: listing ? listing.title : "Listing",
    description: listing?.description.slice(0, 150),
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const owner = getOwner(listing.ownerId);
  const agent = listing.agentId ? getAgent(listing.agentId) : undefined;
  const listingComments = getCommentsFor(listing.id);
  const slots = getInspectionsFor(listing.id).filter((s) => s.status === "open" || s.status === "booked");

  const fees = listing.fees;
  const allInRent =
    (fees.rent ?? 0) +
    (fees.caution ?? 0) +
    (fees.serviceCharge ?? 0) +
    (fees.agencyFee ?? 0) +
    (fees.legalFee ?? 0);

  return (
    <>
      {/* breadcrumb */}
      <Section className="pt-6">
        <nav className="text-sm text-fg-subtle">
          <Link href="/" className="hover:text-fg">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/listings" className="hover:text-fg">Listings</Link>
          <span className="mx-2">/</span>
          <span className="text-fg">{listing.title}</span>
        </nav>
      </Section>

      {/* gallery */}
      <Section className="pt-6">
        <div className="grid gap-2 lg:grid-cols-4 lg:grid-rows-2 rounded-3xl overflow-hidden bg-bg-sunken">
          <div className="relative lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto">
            <Image
              src={listing.photos[0]}
              alt={listing.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {listing.photos.slice(1, 5).map((p, idx) => (
            <div key={idx} className="relative aspect-[4/3] lg:aspect-auto">
              <Image src={p} alt="" fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
      </Section>

      {/* main */}
      <Section className="py-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={listing.purpose === "rent" ? "brand" : "accent"}>
              {listing.purpose === "rent" ? "For rent" : "For sale"}
            </Badge>
            {listing.ownerVerified && <VerifiedBadge kind="owner" />}
            {listing.documentsVerified && <VerifiedBadge kind="documents" />}
            {!listing.ownerVerified && !listing.documentsVerified && (
              <Badge tone="warn">Unverified — request docs before booking</Badge>
            )}
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-fg leading-tight">
            {listing.title}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-fg-muted">
            <Icon.Pin size={14} />
            {listing.area}, {listing.city}
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-fg-muted">
            <Stat icon={<Icon.Bed size={14} />} label={listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bedrooms`} />
            <Stat icon={<Icon.Bath size={14} />} label={`${listing.bathrooms} bathrooms`} />
            <Stat icon={<Icon.Building size={14} />} label={listing.type} />
            <Stat icon={<Icon.Eye size={14} />} label={`${listing.views.toLocaleString()} views`} />
            <Stat icon={<Icon.Heart size={14} />} label={`${listing.saves} saves`} />
          </div>

          <div className="mt-8 prose-content">
            <h2 className="text-xl font-semibold text-fg">About this place</h2>
            <p className="mt-3 text-fg-muted leading-relaxed">{listing.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-fg">Highlights</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {listing.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 rounded-xl border border-border bg-bg-elevated p-4 text-sm text-fg"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-soft text-success">
                    <Icon.Check size={12} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-fg">Amenities</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.amenities.map((a) => (
                <Badge key={a} tone="muted">
                  {a}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-fg">
                Public questions ({listingComments.length})
              </h2>
              <Badge tone="muted">Comments stay public · keeps everyone honest</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {listingComments.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-bg-elevated p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name="A" size={36} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-fg">An applicant</p>
                      <p className="text-xs text-fg-subtle">{formatRelativeTime(c.createdAt)}</p>
                      <p className="mt-2 text-sm text-fg leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                  {c.replies.map((r, idx) => (
                    <div
                      key={idx}
                      className="mt-3 ml-12 rounded-xl border border-border bg-bg-sunken/40 p-4"
                    >
                      <p className="text-xs font-medium text-fg">
                        {r.by === "owner" ? "Owner reply" : "Agent reply"} ·{" "}
                        <span className="text-fg-subtle">{formatRelativeTime(r.at)}</span>
                      </p>
                      <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-border bg-bg-elevated/60 p-5">
              <p className="text-sm text-fg-muted">
                Questions stay public so future applicants benefit. Owners and agents can
                reply — but cannot post comments themselves.
              </p>
              <div className="mt-3 flex gap-2">
                <ButtonLink href="/login" variant="outline" size="sm">Sign in to ask</ButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-bg-elevated p-6 sticky top-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              {listing.purpose === "rent" ? "Rent" : "Asking price"}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-fg">
              {listing.purpose === "rent"
                ? formatCurrencyNGN(fees.rent ?? 0)
                : formatCurrencyNGN(fees.price ?? 0)}
              {listing.purpose === "rent" && (
                <span className="text-base font-normal text-fg-subtle">/yr</span>
              )}
            </p>

            {listing.purpose === "rent" ? (
              <>
                <div className="mt-5 space-y-2 text-sm">
                  <FeeRow label="Rent" value={fees.rent} />
                  <FeeRow label="Caution deposit" value={fees.caution} />
                  <FeeRow label="Service charge" value={fees.serviceCharge} />
                  <FeeRow label="Agency fee" value={fees.agencyFee} />
                  <FeeRow label="Legal fee" value={fees.legalFee} />
                </div>
                <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-fg">All-in to move</p>
                  <p className="text-sm font-semibold text-fg">
                    {formatCurrencyNGNFull(allInRent)}
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-5 space-y-2 text-sm">
                <FeeRow label="Asking price" value={fees.price} />
                <FeeRow label="Legal fee" value={fees.legalFee} />
                <FeeRow label="Agency fee" value={fees.agencyFee} />
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <ButtonLink
                href={`/listings/${listing.id}/inspect`}
                size="lg"
                trailingIcon={<Icon.ArrowRight size={16} />}
              >
                Request inspection
              </ButtonLink>
              <ButtonLink
                href={`/listings/${listing.id}/offer`}
                variant="outline"
                size="lg"
              >
                Submit offer
              </ButtonLink>
              <Button variant="ghost" size="md" leadingIcon={<Icon.Heart size={16} />}>
                Save listing
              </Button>
            </div>

            {/* moniepoint cross-sell */}
            <div className="mt-5 rounded-xl bg-brand-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                Moniepoint financing
              </p>
              <p className="mt-1.5 text-sm text-fg">
                Apply for a home loan in 3 minutes — pre-approval comes back the same day.
              </p>
              <Link
                href="#"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
              >
                Check eligibility <Icon.ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* host card */}
          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Listed by
            </p>
            {agent ? (
              <Link
                href={`/agents/${agent.id}`}
                className="mt-3 flex items-start gap-3 group"
              >
                <Avatar name={agent.name} src={agent.avatar} size={48} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg group-hover:text-brand">
                    {agent.name}
                  </p>
                  <p className="text-xs text-fg-muted">Verified agent · {agent.city}</p>
                  <p className="mt-1 text-xs text-fg-subtle">
                    Replies in ~{agent.responseTimeMins} min · {agent.responseRate}% response
                  </p>
                </div>
              </Link>
            ) : owner ? (
              <div className="mt-3 flex items-start gap-3">
                <Avatar name={owner.name} src={owner.avatar} size={48} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">{owner.name}</p>
                  <p className="text-xs text-fg-muted">
                    Self-managing owner{owner.verified ? " · verified" : ""}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* inspections */}
          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Open inspection slots
            </p>
            <ul className="mt-3 space-y-2">
              {slots.length ? (
                slots.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-bg-sunken/40 px-3 py-2 text-sm"
                  >
                    <span className="text-fg">
                      {new Date(s.date).toLocaleString("en-NG", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <Badge tone={s.status === "open" ? "success" : "muted"}>
                      {s.status === "open" ? "Open" : "Booked"}
                    </Badge>
                  </li>
                ))
              ) : (
                <li className="text-sm text-fg-muted">
                  No public slots yet — request a custom time.
                </li>
              )}
            </ul>
          </div>
        </aside>
      </Section>
    </>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {label}
    </span>
  );
}

function FeeRow({ label, value }: { label: string; value?: number }) {
  if (value === undefined || value === 0) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg">{formatCurrencyNGNFull(value)}</span>
    </div>
  );
}