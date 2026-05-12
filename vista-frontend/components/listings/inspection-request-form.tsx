"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import type { SlotResponse } from "@/lib/api/types";
import { requestInspectionAction } from "@/lib/actions/inspections";
import type { ActionState } from "@/lib/actions/listings";

interface Props {
  listingId: string;
  openSlots: SlotResponse[];
}

export function InspectionRequestForm({ listingId, openSlots }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(requestInspectionAction.bind(null, listingId), undefined);

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

      {openSlots.length === 0 ? (
        <div className="rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
          No open slots yet. Use the message section once it&rsquo;s
          available, or save the listing — we&rsquo;ll ping you when new slots
          open.
        </div>
      ) : (
        <Field label="Pick an open slot">
          <Select name="slotId" defaultValue={openSlots[0]?.id ?? ""} required>
            {openSlots.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.startsAt).toLocaleString("en-NG", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · {s.durationMins} mins
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="A note for the host (optional)">
        <Textarea
          name="note"
          placeholder="Share what matters to you — kids, pets, work-from-home setup, move-in date."
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLink href={`/listings/${listingId}`} variant="ghost">
          Cancel
        </ButtonLink>
        <Button
          size="lg"
          type="submit"
          disabled={pending || openSlots.length === 0}
          trailingIcon={<Icon.ArrowRight size={16} />}
        >
          {pending ? "Requesting…" : "Request inspection"}
        </Button>
      </div>
    </form>
  );
}
