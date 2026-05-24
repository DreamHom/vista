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
import { Textarea } from "@/components/ui/textarea";

export function AssignmentDeclineDialog({
  open,
  onOpenChange,
  listingTitle,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingTitle: string;
  pending?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const trimmed = reason.trim();
  const valid = trimmed.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decline assignment invite</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                You are declining management of <span className="font-medium text-foreground">{listingTitle}</span>.
                The owner is notified and can invite another agent.
              </p>
              <p>A short reason is required and is stored on the assignment row.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. At capacity this month / outside my coverage area"
          maxLength={1000}
          aria-invalid={!valid && reason.length > 0}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={pending || !valid}
            onClick={() => onConfirm(trimmed)}
          >
            {pending ? "Declining…" : "Decline invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
