import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CompactListingTile,
  EmptyHint,
  OwnerIdentity,
  VerificationBadge,
} from "@/components/public/public-components";
import { getListingsForOwner, getOwnerById } from "@/lib/seed/public-data";
import { truncateMetaDescription } from "@/lib/seo-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const owner = await getOwnerById(id);
  if (!owner) {
    return { title: "Owner", robots: { index: false, follow: true } };
  }

  const description = truncateMetaDescription(`Public owner profile for ${owner.name} on DreamHomes.`);

  return {
    title: owner.name,
    description,
    alternates: { canonical: `/owners/${id}` },
    openGraph: {
      title: owner.name,
      description,
      url: `/owners/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: owner.name,
      description,
    },
  };
}

export default async function OwnerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getOwnerById(id);
  if (!owner) notFound();

  const listings = await getListingsForOwner(owner.id);

  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <OwnerIdentity owner={owner} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total active listings" value={String(listings.length)} />
          <Stat label="Verified status" value={owner.verified ? "Owner Verified" : "Verification pending"} />
          <Stat label="Review count" value={String(owner.reviewCount)} />
          <Stat label="Closed deals" value={String(owner.closedDealCount ?? 0)} />
        </div>
        {!owner.verified ? (
          <div className="mt-4">
            <VerificationBadge verified={false} label="Owner verification pending" />
          </div>
        ) : null}
      </section>

      <section className="mt-8 space-y-6">
        <section className="border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Listed properties</h2>
            <p className="text-sm text-muted-foreground">
              Public contact is handled through individual listings, not this profile.
            </p>
          </div>
          <div className="mt-5 grid gap-4">
            {listings.length ? (
              listings.map((listing) => <CompactListingTile key={listing.id} listing={listing} />)
            ) : (
              <EmptyHint
                title="No live public listings for this owner right now."
                body="The owner may be between listings, paused, or working through verification and publishing steps."
              />
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4">
      <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
