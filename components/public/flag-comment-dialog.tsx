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

const MAX_REASON = 512;

export function FlagCommentDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending?: boolean;
  onSubmit: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const overLimit = reason.length > MAX_REASON;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a comment</DialogTitle>
          <DialogDescription>
            What is wrong with this comment? We share your note with moderators only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="flag-comment-reason">Reason (optional)</Label>
          <Textarea
            id="flag-comment-reason"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="What's wrong with this comment? (optional)"
            maxLength={MAX_REASON + 20}
          />
          {overLimit ? (
            <p className="text-xs text-destructive">Keep your note under {MAX_REASON} characters.</p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="primary"
            disabled={pending || overLimit}
            onClick={() => onSubmit(reason.trim() || undefined)}
          >
            {pending ? "Submitting…" : "Submit flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
