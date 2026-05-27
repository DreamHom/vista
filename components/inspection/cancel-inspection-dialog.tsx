"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_REASON = 200;

export function CancelInspectionDialog({
  open,
  onOpenChange,
  windowLabel,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  windowLabel: string;
  pending?: boolean;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const trimmed = reason.trim();
  const overLimit = reason.length > MAX_REASON;
  const canSubmit = trimmed.length > 0 && !overLimit && !pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel inspection</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                We will let the other party know you are cancelling{" "}
                <strong className="text-foreground">{windowLabel}</strong>.
              </p>
              <p>Please give them a brief reason.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="cancel-inspection-reason">Reason for cancelling</Label>
          <Textarea
            id="cancel-inspection-reason"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. work emergency, slot conflict, no longer interested"
            maxLength={MAX_REASON + 20}
          />
          <p className="text-xs text-muted-foreground">
            {reason.length} / {MAX_REASON}
            {overLimit ? (
              <span className="text-destructive"> — shorten to {MAX_REASON} characters or fewer.</span>
            ) : null}
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Keep inspection
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={() => onSubmit(trimmed)}
          >
            {pending ? "Cancelling…" : "Cancel inspection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
