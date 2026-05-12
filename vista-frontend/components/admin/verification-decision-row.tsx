"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import {
  approveVerificationAction,
  rejectVerificationAction,
} from "@/lib/actions/verification";
import { formatRelativeTime } from "@/lib/utils";
import type { VerificationResponse } from "@/lib/api/types";

const TRACK_LABEL: Record<VerificationResponse["track"], string> = {
  OWNER_IDENTITY: "Owner identity",
  AGENT_CREDENTIALS: "Agent credentials",
  PROPERTY_DOCUMENTS: "Property documents",
  APPLICANT_IDENTITY: "Applicant identity",
};

export function VerificationDecisionRow({
  item,
}: {
  item: VerificationResponse;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [decided, setDecided] = useState<"approved" | "rejected" | null>(null);

  function approve() {
    setError(null);
    startTransition(async () => {
      const result = await approveVerificationAction(item.id);
      if (result.ok) setDecided("approved");
      else setError(result.error);
    });
  }

  function reject() {
    if (!reason.trim()) {
      setError("Provide a reason.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectVerificationAction(item.id, reason.trim());
      if (result.ok) setDecided("rejected");
      else setError(result.error);
    });
  }

  if (decided) {
    return (
      <li className="flex items-center gap-4 p-5 opacity-70">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success">
          <Icon.Check size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fg truncate">
            {item.subject ?? item.submittedByName ?? item.submittedBy}
          </p>
          <p className="text-xs text-fg-muted">
            {decided === "approved" ? "Approved." : "Rejected."}
          </p>
        </div>
      </li>
    );
  }

  return (
    <li className="p-5">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Icon.Shield size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-fg truncate">
              {item.subject ?? item.submittedByName ?? item.submittedBy}
            </p>
            <Badge tone="muted">{TRACK_LABEL[item.track]}</Badge>
          </div>
          <p className="text-xs text-fg-muted">
            {item.documents.length} document
            {item.documents.length === 1 ? "" : "s"} · submitted{" "}
            {formatRelativeTime(item.submittedAt)}
          </p>
          {item.documents.length > 0 ? (
            <ul className="mt-1 flex flex-wrap gap-2 text-xs">
              {item.documents.map((d, i) => (
                <li key={i}>
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-elevated px-2 py-0.5 text-fg-muted hover:text-brand"
                    >
                      <Icon.Doc size={10} /> {d.name}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-elevated px-2 py-0.5 text-fg-muted">
                      <Icon.Doc size={10} /> {d.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={approve}
            disabled={pending}
            leadingIcon={<Icon.Check size={14} />}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReject((s) => !s)}
            disabled={pending}
            leadingIcon={<Icon.X size={14} />}
          >
            Reject
          </Button>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
      {showReject ? (
        <div className="mt-4 ml-13 rounded-2xl border border-border bg-bg-sunken/40 p-4">
          <Field label="Reason (shown to the submitter)">
            <Textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. ID expired; please re-submit a current one."
            />
          </Field>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowReject(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={reject}
              disabled={pending}
            >
              {pending ? "Submitting…" : "Confirm reject"}
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
