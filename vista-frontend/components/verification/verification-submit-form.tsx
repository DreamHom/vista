"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import { submitVerificationAction } from "@/lib/actions/verification";
import type { VerificationTrack } from "@/lib/api/types";
import type { ActionState } from "@/lib/actions/listings";

interface Props {
  track: VerificationTrack;
  /** Required when track === "PROPERTY_DOCUMENTS" */
  listingId?: string;
  hint?: string;
}

export function VerificationSubmitForm({ track, listingId, hint }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(submitVerificationAction.bind(null, track), undefined);

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
          {state.message ??
            "Submitted. We&rsquo;ll let you know within 1–3 business days."}
        </div>
      ) : null}

      {listingId ? (
        <Input type="hidden" name="listingId" defaultValue={listingId} />
      ) : null}

      <Field
        label="Document URLs"
        hint={
          hint ??
          "One link per line — upload to a private folder (Drive, Dropbox, S3) and paste shareable URLs."
        }
      >
        <Textarea
          name="documentUrls"
          rows={4}
          placeholder={`https://drive.google.com/...\nhttps://drive.google.com/...`}
          required
        />
      </Field>

      <Field label="A note (optional)">
        <Input
          name="note"
          placeholder="Anything you want the reviewer to know."
        />
      </Field>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="md"
          disabled={pending}
          trailingIcon={<Icon.ArrowRight size={14} />}
        >
          {pending ? "Submitting…" : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}
