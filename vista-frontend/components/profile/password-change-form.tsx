"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { changePasswordAction } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/listings";

export function PasswordChangeForm() {
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    changePasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok === false ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p role="status" className="text-sm text-success">
          {state.message ?? "Password updated."}
        </p>
      ) : null}

      <Field label="Current password">
        <Input name="currentPassword" type="password" required />
      </Field>
      <Field label="New password">
        <Input name="newPassword" type="password" required />
      </Field>
      <Field label="Confirm new password">
        <Input name="confirmPassword" type="password" required />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
