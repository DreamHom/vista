import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/icons";
import { CommentsSection } from "@/components/listings/comments-section";
import { ReviewsSection } from "@/components/listings/reviews-section";
import { SaveButton } from "@/components/listings/save-button";
import * as Listings from "@/lib/api/listings";
import * as Inspections from "@/lib/api/inspections";
import * as Comments from "@/lib/api/comments";
import * as Reviews from "@/lib/api/reviews";
import * as Users from "@/lib/api/users";
import * as Saves from "@/lib/api/saves";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import { getSessionUser } from "@/lib/api/session-user";
import { listingFromApi } from "@/lib/api/adapters";
import {
  publicProfileAgentVerified,
  publicProfileDisplayName,
  publicProfileId,
} from "@/lib/api/public-profile";
import {
  formatCurrencyNGN,
  formatCurrencyNGNFull,
} from "@/lib/utils";
import type {
  CommentResponse,
  PhotoResponse,
  PublicUserProfile,
  ReviewResponse,
  SlotResponse,
} from "@/lib/api/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const api = await Listings.getListing(id);
    return {
      title: api.title,
      description: api.description.slice(0, 150),
    };
  } catch {
    return { title: "Listing" };
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let photos: PhotoResponse[] = [];
  let comments: CommentResponse[] = [];
  let reviews: ReviewResponse[] = [];
  let slots: SlotResponse[] = [];
  let ownerProfile: PublicUserProfile | null = null;
  let agentProfile: PublicUserProfile | null = null;

  const apiListing = await Listings.getListing(id).catch((err) => {
    if (err instanceof HavenError && err.status === 404) notFound();
    throw err;
  });

  [photos, comments, reviews, slots] = await Promise.all([
    Listings.getListingPhotos(id).catch(() => []),
    Comments.listListingComments(id).catch(() => []),
    Reviews.listListingReviews(id).catch(() => []),
    Inspections.listListingSlots(id).catch(() => []),
  ]);

  ownerProfile = await Users.getUserProfile(apiListing.ownerId).catch(
    () => null,
  );
  if (apiListing.agentId) {
    agentProfile = await Users.getUserProfile(apiListing.agentId).catch(
      () => null,
    );
  }

  const listing = listingFromApi(apiListing, photos);
  const token = await getToken();
  const me = token ? await getSessionUser() : null;
  let initiallySaved = false;
  if (token) {
    try {
      const saves = await Saves.listMySaves(token);
      initiallySaved = saves.content.some((s) => String(s.listingId) === apiListing.id);
    } catch {
      // not fatal
    }
  }

  const fees = listing.fees;
  const allInRent =
    (fees.rent ?? 0) +
    (fees.caution ?? 0) +
    (fees.serviceCharge ?? 0) +
    (fees.agencyFee ?? 0) +
    (fees.legalFee ?? 0);

  const openSlots = slots.filter(
    (s) => s.status === "OPEN" || s.status === "BOOKED",
  );

  return (
    <>
      <Section className="pt-6">
        <nav className="text-sm text-fg-subtle">
          <Link href="/" className="hover:text-fg">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/listings" className="hover:text-fg">
            Listings
          </Link>
          <span className="mx-2">/</span>
          <span className="text-fg">{listing.title}</span>
        </nav>
      </Section>

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

      <Section className="py-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={listing.purpose === "rent" ? "brand" : "accent"}>
              {listing.purpose === "rent" ? "For rent" : "For sale"}
            </Badge>
            {listing.ownerVerified && <VerifiedBadge kind="owner" />}
            {listing.documentsVerified && <VerifiedBadge kind="documents" />}
            {!listing.ownerVerified && !listing.documentsVerified && (
              <Badge tone="warn">
                Unverified — request docs before booking
              </Badge>
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
            <Stat
              icon={<Icon.Bed size={14} />}
              label={
                listing.bedrooms === 0
                  ? "Studio"
                  : `${listing.bedrooms} bedrooms`
              }
            />
            <Stat
              icon={<Icon.Bath size={14} />}
              label={`${listing.bathrooms} bathrooms`}
            />
            <Stat icon={<Icon.Building size={14} />} label={listing.type} />
            <Stat
              icon={<Icon.Eye size={14} />}
              label={`${listing.views.toLocaleString()} views`}
            />
            <Stat
              icon={<Icon.Heart size={14} />}
              label={`${listing.saves} saves`}
            />
          </div>

          <div className="mt-8 prose-content">
            <h2 className="text-xl font-semibold text-fg">About this place</h2>
            <p className="mt-3 text-fg-muted leading-relaxed">
              {listing.description}
            </p>
          </div>

          {listing.highlights.length > 0 ? (
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
          ) : null}

          {listing.amenities.length > 0 ? (
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
          ) : null}

          <CommentsSection
            listingId={listing.id}
            comments={comments}
            canPost={!!token}
          />

          <ReviewsSection
            listingId={listing.id}
            reviews={reviews}
            currentUserId={me ? String(me.id) : undefined}
            canPost={!!token}
          />
        </div>

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
                <span className="text-base font-normal text-fg-subtle">
                  /yr
                </span>
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
              <SaveButton
                listingId={listing.id}
                initialSaved={initiallySaved}
                authed={!!token}
              />
            </div>

            <div className="mt-5 rounded-xl bg-brand-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                Moniepoint financing
              </p>
              <p className="mt-1.5 text-sm text-fg">
                Apply for a home loan in 3 minutes — pre-approval comes back the
                same day.
              </p>
              <Link
                href="#"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
              >
                Check eligibility <Icon.ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Listed by
            </p>
            {agentProfile ? (
              <Link
                href={`/agents/${publicProfileId(agentProfile)}`}
                className="mt-3 flex items-start gap-3 group"
              >
                <Avatar
                  name={publicProfileDisplayName(agentProfile)}
                  size={48}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg group-hover:text-brand">
                    {publicProfileDisplayName(agentProfile)}
                  </p>
                  <p className="text-xs text-fg-muted">
                    {publicProfileAgentVerified(agentProfile)
                      ? "Verified agent"
                      : "Agent"}
                    {typeof agentProfile.averageRating === "number"
                      ? ` · ${agentProfile.averageRating.toFixed(1)}★`
                      : ""}
                  </p>
                </div>
              </Link>
            ) : ownerProfile ? (
              <div className="mt-3 flex items-start gap-3">
                <Avatar
                  name={publicProfileDisplayName(ownerProfile)}
                  size={48}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">
                    {publicProfileDisplayName(ownerProfile)}
                  </p>
                  <p className="text-xs text-fg-muted">
                    Self-managing owner
                    {ownerProfile.identityVerifiedAt ? " · verified" : ""}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-bg-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Open inspection slots
            </p>
            <ul className="mt-3 space-y-2">
              {openSlots.length ? (
                openSlots.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-bg-sunken/40 px-3 py-2 text-sm"
                  >
                    <span className="text-fg">
                      {new Date(s.startsAt).toLocaleString("en-NG", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <Badge tone={s.status === "OPEN" ? "success" : "muted"}>
                      {s.status === "OPEN" ? "Open" : "Booked"}
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

function Stat({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
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
