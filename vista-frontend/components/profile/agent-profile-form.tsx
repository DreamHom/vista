"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { updateAgentProfileAction } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/listings";
import type { MeProfileResponse } from "@/lib/api/types";

export function AgentProfileForm({ profile }: { profile: MeProfileResponse }) {
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    updateAgentProfileAction,
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
          {state.message ?? "Agent profile updated."}
        </p>
      ) : null}

      <Field label="Headline">
        <Input name="headline" defaultValue={profile.headline ?? ""} />
      </Field>
      <Field label="Bio">
        <Textarea name="bio" rows={5} defaultValue={profile.bio ?? ""} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Areas you cover" hint="Comma-separated">
          <Input
            name="areasCovered"
            defaultValue={(profile.areasCovered ?? []).join(", ")}
          />
        </Field>
        <Field label="Specialisations" hint="Comma-separated">
          <Input
            name="specializations"
            defaultValue={(profile.specializations ?? []).join(", ")}
          />
        </Field>
        <Field label="Languages" hint="Comma-separated">
          <Input
            name="languages"
            defaultValue={(profile.languages ?? []).join(", ")}
          />
        </Field>
        <Field label="Fee percent">
          <Input name="feePercent" defaultValue={String(profile.feePercent ?? "")} />
        </Field>
      </div>
      <Field label="License number">
        <Input name="licenseNumber" defaultValue={profile.licenseNumber ?? ""} />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save public profile"}
        </Button>
      </div>
    </form>
  );
}
