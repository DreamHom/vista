"use client";

import { useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import {
  approveListingAction,
  takedownListingAction,
} from "@/lib/actions/admin";

interface Props {
  listingId: string;
}

export function AdminListingActions({ listingId }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showTakedown, setShowTakedown] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    setError(null);
    startTransition(async () => {
      const result = await approveListingAction(listingId);
      if (!result.ok) setError(result.error);
    });
  }

  function takedown() {
    if (!reason.trim()) {
      setError("Provide a reason.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await takedownListingAction(listingId, reason.trim());
      if (result.ok) {
        setShowTakedown(false);
        setReason("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-2">
      <div className="inline-flex gap-1.5">
        <ButtonLink size="sm" variant="ghost" href={`/listings/${listingId}`}>
          View
        </ButtonLink>
        <Button
          size="sm"
          variant="outline"
          onClick={approve}
          disabled={pending}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowTakedown((s) => !s)}
          disabled={pending}
        >
          Take down
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
      {showTakedown ? (
        <div className="w-72 rounded-2xl border border-border bg-bg-elevated p-3 text-left">
          <Field label="Reason (sent to owner & agent)">
            <Textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate listing, photos don't match address."
            />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTakedown(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={takedown}
              disabled={pending}
            >
              {pending ? "Submitting…" : "Confirm take down"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
