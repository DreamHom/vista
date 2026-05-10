import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { getListing } from "@/lib/mock-data";
import { formatCurrencyNGNFull } from "@/lib/utils";

export const metadata: Metadata = { title: "Submit an offer" };

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const ask =
    listing.purpose === "rent" ? listing.fees.rent ?? 0 : listing.fees.price ?? 0;

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
        The owner has the final say on every offer. If an agent is assigned, they&rsquo;ll
        present your offer with their recommendation — but the call is the owner&rsquo;s.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form className="rounded-3xl border border-border bg-bg-elevated p-8 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={listing.purpose === "rent" ? "Your rent offer (per year)" : "Your offer"}
              hint={`Asking: ${formatCurrencyNGNFull(ask)}`}
            >
              <Input type="number" defaultValue={ask} />
            </Field>
            <Field label={listing.purpose === "rent" ? "Term length" : "Closing window"}>
              <Select defaultValue="standard">
                {listing.purpose === "rent" ? (
                  <>
                    <option value="standard">12 months</option>
                    <option value="long">24 months (negotiable)</option>
                    <option value="short">6 months (premium)</option>
                  </>
                ) : (
                  <>
                    <option value="standard">6 weeks</option>
                    <option value="fast">3 weeks (cash)</option>
                    <option value="patient">12 weeks (mortgage approval)</option>
                  </>
                )}
              </Select>
            </Field>
          </div>

          <Field
            label="Payment plan"
            hint="Single payment is what most owners prefer; ask politely if you need a split."
          >
            <Select defaultValue="single">
              <option value="single">Single upfront payment</option>
              <option value="quarterly">Quarterly</option>
              <option value="half">Twice a year</option>
              <option value="monthly">Monthly (with Moniepoint)</option>
            </Select>
          </Field>

          <Field label="Move-in / closing date">
            <Input type="date" />
          </Field>

          <Field label="Conditions (optional)">
            <Textarea placeholder="e.g. subject to satisfactory inspection, mortgage approval, painting before move-in." />
          </Field>

          <div className="rounded-xl bg-accent-soft p-4">
            <p className="text-sm font-semibold text-accent-fg">
              <Icon.Sparkles size={14} className="inline mr-1.5 -mt-0.5" />
              Want to finance this with Moniepoint?
            </p>
            <p className="mt-1 text-sm text-accent-fg/80">
              We can attach a soft pre-approval to your offer so the owner knows the money
              moves. Adds about 30 seconds.
            </p>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-accent-fg">
              <input type="checkbox" className="h-4 w-4 accent-accent" defaultChecked />
              Attach Moniepoint pre-approval
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <ButtonLink href={`/listings/${listing.id}`} variant="ghost">
              Cancel
            </ButtonLink>
            <Button variant="accent" size="lg" trailingIcon={<Icon.ArrowRight size={16} />}>
              Submit offer
            </Button>
          </div>
        </form>

        <aside className="rounded-3xl border border-border bg-bg-elevated p-6 h-fit">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            How negotiation works
          </p>
          <ul className="mt-4 space-y-3 text-sm text-fg-muted">
            <li className="flex gap-3">
              <Icon.Check size={14} className="mt-1 text-success" />
              <p>Both sides can counter. Every counter is logged with a timestamp.</p>
            </li>
            <li className="flex gap-3">
              <Icon.Check size={14} className="mt-1 text-success" />
              <p>Agent (if assigned) presents your offer with their recommendation.</p>
            </li>
            <li className="flex gap-3">
              <Icon.Check size={14} className="mt-1 text-success" />
              <p>Owner has the final say. Accept, reject or counter — done in-platform.</p>
            </li>
            <li className="flex gap-3">
              <Icon.Check size={14} className="mt-1 text-success" />
              <p>Offers can be withdrawn any time before acceptance.</p>
            </li>
          </ul>
        </aside>
      </div>
    </Section>
  );
}