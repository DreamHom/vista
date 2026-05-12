"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { updateMyProfileAction } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/listings";
import type { MeProfileResponse } from "@/lib/api/types";

export function AccountProfileForm({
  profile,
  includePreferences = false,
}: {
  profile: MeProfileResponse;
  includePreferences?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    updateMyProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.ok === false ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p role="status" className="text-sm text-success">
          {state.message ?? "Profile updated."}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Display name">
          <Input name="displayName" defaultValue={profile.displayName ?? ""} />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={profile.phone ?? ""} />
        </Field>
      </div>

      {includePreferences ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Budget min">
            <Input
              name="budgetMin"
              type="number"
              min={0}
              defaultValue={String(profile.budgetMin ?? "")}
            />
          </Field>
          <Field label="Budget max">
            <Input
              name="budgetMax"
              type="number"
              min={0}
              defaultValue={String(profile.budgetMax ?? "")}
            />
          </Field>
          <Field label="Preferred city">
            <Input name="city" defaultValue={profile.city ?? ""} />
          </Field>
          <Field label="Intent">
            <Select name="intent" defaultValue={profile.intent ?? "RENT"}>
              <option value="RENT">Rent</option>
              <option value="SALE">Buy</option>
            </Select>
          </Field>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
