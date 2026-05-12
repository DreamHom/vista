"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import { submitOfferAction } from "@/lib/actions/offers";
import type { ActionState } from "@/lib/actions/listings";

interface Props {
  listingId: string;
  purpose: "rent" | "sale";
  askingPrice: number;
}

export function OfferForm({ listingId, purpose, askingPrice }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(submitOfferAction.bind(null, listingId), undefined);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-border bg-bg-elevated p-8 space-y-5"
    >
      {state?.ok === false ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={purpose === "rent" ? "Your rent offer (per year)" : "Your offer"}
        >
          <Input
            type="number"
            name="amount"
            min={1}
            defaultValue={askingPrice}
            required
          />
        </Field>
        <Field label={purpose === "rent" ? "Term length" : "Closing window"}>
          <Select name="termOption" defaultValue="standard">
            {purpose === "rent" ? (
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
        <Select name="paymentPlan" defaultValue="single">
          <option value="single">Single upfront payment</option>
          <option value="quarterly">Quarterly</option>
          <option value="half">Twice a year</option>
          <option value="monthly">Monthly (with Moniepoint)</option>
        </Select>
      </Field>

      <Field label="Move-in / closing date">
        <Input type="date" name="moveInDate" />
      </Field>

      <Field label="Conditions (optional)">
        <Textarea
          name="terms"
          placeholder="e.g. subject to satisfactory inspection, mortgage approval, painting before move-in."
        />
      </Field>

      <div className="rounded-xl bg-accent-soft p-4">
        <p className="text-sm font-semibold text-accent-fg">
          <Icon.Sparkles size={14} className="inline mr-1.5 -mt-0.5" />
          Want to finance this with Moniepoint?
        </p>
        <p className="mt-1 text-sm text-accent-fg/80">
          We can attach a soft pre-approval to your offer so the owner knows the
          money moves. Adds about 30 seconds.
        </p>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-accent-fg">
          <input
            type="checkbox"
            name="attachPreApproval"
            className="h-4 w-4 accent-accent"
            defaultChecked
          />
          Attach Moniepoint pre-approval
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLink href={`/listings/${listingId}`} variant="ghost">
          Cancel
        </ButtonLink>
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={pending}
          trailingIcon={<Icon.ArrowRight size={16} />}
        >
          {pending ? "Submitting…" : "Submit offer"}
        </Button>
      </div>
    </form>
  );
}
