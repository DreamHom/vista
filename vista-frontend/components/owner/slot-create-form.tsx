"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import { createSlotAction } from "@/lib/actions/inspections";
import type { ActionState } from "@/lib/actions/listings";

interface Props {
  listingId: string;
}

export function SlotCreateForm({ listingId }: Props) {
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    createSlotAction.bind(null, listingId),
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok === false ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.error}
        </div>
      ) : null}
      {state?.ok === true ? (
        <div
          role="status"
          className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          Slot created. It is now available on the public listing page.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start time">
          <Input name="startsAt" type="datetime-local" required />
        </Field>
        <Field label="Duration">
          <Select name="durationMins" defaultValue="30" required>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </Select>
        </Field>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="md"
          disabled={pending}
          trailingIcon={<Icon.ArrowRight size={14} />}
        >
          {pending ? "Creating…" : "Create slot"}
        </Button>
      </div>
    </form>
  );
}
