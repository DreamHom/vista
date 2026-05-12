import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { OfferForm } from "@/components/listings/offer-form";
import * as Listings from "@/lib/api/listings";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import { formatCurrencyNGNFull } from "@/lib/utils";

export const metadata: Metadata = { title: "Submit an offer" };

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  if (!token) {
    redirect(`/login?next=/listings/${id}/offer`);
  }

  const listing = await Listings.getListing(id).catch((err) => {
    if (err instanceof HavenError && err.status === 404) notFound();
    throw err;
  });

  const purpose = listing.purpose === "RENT" ? "rent" : "sale";
  const ask =
    purpose === "rent" ? (listing.fees.rent ?? 0) : (listing.fees.price ?? 0);

  return (
    <Section className="py-12 max-w-4xl">
      <Link
        href={`/listings/${listing.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        ← Back to listing
      </Link>

      <Badge tone="accent" className="mt-6 mb-3">
        Submit an offer
      </Badge>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
        Make the move on {listing.title}.
      </h1>
      <p className="mt-3 text-fg-muted max-w-2xl">
        The owner has the final say on every offer. If an agent is assigned,
        they&rsquo;ll present your offer with their recommendation — but the
        call is the owner&rsquo;s.
      </p>
      <p className="mt-2 text-sm text-fg-subtle">
        Asking: <strong>{formatCurrencyNGNFull(ask)}</strong>
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <OfferForm
          listingId={listing.id}
          purpose={purpose}
          askingPrice={ask}
        />

        <aside className="rounded-3xl border border-border bg-bg-elevated p-6 h-fit">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            How negotiation works
          </p>
          <ul className="mt-4 space-y-3 text-sm text-fg-muted">
            {[
              "Both sides can counter. Every counter is logged with a timestamp.",
              "Agent (if assigned) presents your offer with their recommendation.",
              "Owner has the final say. Accept, reject or counter — done in-platform.",
              "Accepting your offer auto-declines siblings — no surprises, no double sales.",
              "Every counter or decision is logged as a new step in the negotiation chain.",
            ].map((text) => (
              <li key={text} className="flex gap-3">
                <Icon.Check size={14} className="mt-1 text-success" />
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Section>
  );
}
