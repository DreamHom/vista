import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { InspectionRequestForm } from "@/components/listings/inspection-request-form";
import * as Listings from "@/lib/api/listings";
import * as Inspections from "@/lib/api/inspections";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "Request an inspection" };

export default async function InspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  if (!token) {
    redirect(`/login?next=/listings/${id}/inspect`);
  }

  const listing = await Listings.getListing(id).catch((err) => {
    if (err instanceof HavenError && err.status === 404) notFound();
    throw err;
  });
  const slots = await Inspections.listListingSlots(id).catch(() => []);
  const openSlots = slots.filter((s) => s.status === "OPEN");

  return (
    <Section className="py-12 max-w-4xl">
      <Link
        href={`/listings/${listing.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        ← Back to listing
      </Link>

      <Badge tone="brand" className="mt-6 mb-3">
        Step 1 of 2 · request a slot
      </Badge>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
        Lock in a time to see {listing.title}.
      </h1>
      <p className="mt-3 text-fg-muted max-w-2xl">
        Two applicants can&rsquo;t book the same slot — once you submit, the
        calendar blocks it. The agent will confirm within their stated response
        window.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <InspectionRequestForm
          listingId={listing.id}
          openSlots={openSlots}
        />

        <aside className="rounded-3xl border border-border bg-bg-elevated p-6 h-fit">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            What happens next
          </p>
          <ol className="mt-4 space-y-4 text-sm text-fg-muted">
            {[
              "The agent gets a real-time notification (Kafka, behind the scenes).",
              "They confirm or propose an alternative — usually within their average reply time.",
              "You get a visitor pass + directions an hour before. Show up, look around, ask questions.",
              "Post-inspection notes go on file — yours and theirs. No edits, no 'we never said that.'",
            ].map((text, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg text-xs font-semibold">
                  {idx + 1}
                </span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand-soft p-3 text-xs">
            <Icon.ShieldCheck size={14} className="text-brand" />
            <p className="text-fg">
              No-shows are tracked. Two no-shows in 60 days pause your
              inspection privileges.
            </p>
          </div>
        </aside>
      </div>
    </Section>
  );
}
