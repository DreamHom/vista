import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { getListing, getInspectionsFor } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Request an inspection" };

export default async function InspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();
  const slots = getInspectionsFor(listing.id);
  const openSlots = slots.filter((s) => s.status === "open");

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
        Two applicants can&rsquo;t book the same slot — once you submit, the calendar
        blocks it. The agent will confirm within their stated response window.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form className="rounded-3xl border border-border bg-bg-elevated p-8 space-y-5">
          <Field label="Pick an open slot">
            <Select defaultValue={openSlots[0]?.id ?? "custom"}>
              {openSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.date).toLocaleString("en-NG", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {s.durationMins} mins
                </option>
              ))}
              <option value="custom">Suggest a custom time</option>
            </Select>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Your full name">
              <Input placeholder="As on your ID" />
            </Field>
            <Field label="Phone">
              <Input placeholder="+234…" />
            </Field>
          </div>

          <Field label="A note for the host (optional)">
            <Textarea placeholder="Share what matters to you — kids, pets, work-from-home setup, move-in date." />
          </Field>

          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-soft p-4 text-sm">
            <Icon.ShieldCheck size={16} className="text-brand" />
            <p className="text-fg">
              No-shows are tracked. Two no-shows in 60 days pause your inspection privileges.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <ButtonLink href={`/listings/${listing.id}`} variant="ghost">
              Cancel
            </ButtonLink>
            <Button size="lg" trailingIcon={<Icon.ArrowRight size={16} />}>
              Request inspection
            </Button>
          </div>
        </form>

        <aside className="rounded-3xl border border-border bg-bg-elevated p-6 h-fit">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            What happens next
          </p>
          <ol className="mt-4 space-y-4 text-sm text-fg-muted">
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg text-xs font-semibold">
                1
              </span>
              <p>The agent gets a real-time notification (Kafka, behind the scenes).</p>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg text-xs font-semibold">
                2
              </span>
              <p>They confirm or propose an alternative — usually within their average reply time.</p>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg text-xs font-semibold">
                3
              </span>
              <p>You get a visitor pass + directions an hour before. Show up, look around, ask questions.</p>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg text-xs font-semibold">
                4
              </span>
              <p>Post-inspection notes go on file — yours and theirs. No edits, no &lsquo;we never said that.&rsquo;</p>
            </li>
          </ol>
        </aside>
      </div>
    </Section>
  );
}
