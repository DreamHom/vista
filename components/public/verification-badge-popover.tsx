"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LEAVE_MS = 200;

export type VerificationBadgePopoverAlign = "start" | "end";

export function VerificationBadgeWithPopover({
  label,
  align = "end",
  className,
}: {
  label: string;
  align?: VerificationBadgePopoverAlign;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const cancelLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelLeave();
    leaveTimer.current = setTimeout(() => setOpen(false), LEAVE_MS);
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => {
        cancelLeave();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelLeave();
        setOpen(true);
      }}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="inline-flex cursor-help rounded-md border-0 bg-transparent p-0 text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${label}, more about verification`}
      >
        <Badge variant="default" className="gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {label}
        </Badge>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Verification on DreamHomes"
          className={cn(
            "absolute top-full z-[60] mt-2 w-[min(100vw-2rem,18.5rem)] border border-border bg-popover p-3 text-left text-popover-foreground shadow-md",
            align === "end" ? "right-0" : "left-0",
          )}
          onMouseEnter={cancelLeave}
          onMouseLeave={scheduleClose}
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            Verified labels mean we completed a specific trust check at a point in time. They help you prioritise listings; they do not replace your own inspection, legal advice, or contract review.
          </p>
          <ul className="mt-3 space-y-2 text-xs font-medium text-foreground">
            <li>
              <Link href="/verified" className="underline decoration-primary/40 underline-offset-2 hover:text-primary">
                What each badge means
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="underline decoration-primary/40 underline-offset-2 hover:text-primary">
                How DreamHomes works
              </Link>
            </li>
            <li>
              <Link
                href="/terms#verification-badges"
                className="underline decoration-primary/40 underline-offset-2 hover:text-primary"
              >
                Legal limits (Terms)
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
