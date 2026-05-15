"use client";

/**
 * In-page inspection slot picker for `/listings/[id]`.
 *
 * Previously the listing detail page just deep-linked authenticated applicants
 * out to `/dashboard/inspections?listingId=…` — a two-screen booking that lost
 * the listing context. This widget lets the same booking happen inline:
 *
 *   • Guest                        → preview slots, sign-up CTA
 *   • Applicant w/ open slots      → pick a day → pick a slot → optional notes → book
 *   • Applicant w/ no open slots   → tap "Request a custom time" → write a note → posts as a public comment on the listing so the owner can create a matching slot
 *   • Owner / agent of the listing → informational only, no booking
 *
 * Visual language matches the listing detail style: hairline borders, square
 * surfaces, eyebrow labels, primary brand-black CTAs.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, MessageSquare, Sparkles } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/use-auth";
import { ApiError } from "@/lib/api";
import { postListingComment, requestInspection } from "@/lib/applicant-dashboard";
import { cn } from "@/lib/utils";

export interface SlotInput {
  id: string;
  startsAt: string;
  endsAt: string;
}

interface ListingSlotPickerProps {
  listingId: string;
  /** Open slots; pre-filtered upstream is fine, we re-filter to be safe. */
  slots: SlotInput[];
  /** When provided, hides booking UI for the listing's own owner/agent. */
  ownerId?: string;
  agentId?: string | null;
}

const dayFormatter = new Intl.DateTimeFormat("en-NG", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-NG", {
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Group future-only slots by ISO day. Past slots are filtered out using a
 * 5-minute grace window (matches what the dashboard inspections page does)
 * so a slot that just started doesn't disappear mid-booking.
 */
function groupByDay(slots: SlotInput[]) {
  const cutoff = Date.now() - 5 * 60 * 1000;
  const upcoming = slots
    .filter((slot) => new Date(slot.startsAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const map = new Map<string, SlotInput[]>();
  for (const slot of upcoming) {
    const key = slot.startsAt.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(slot);
    map.set(key, list);
  }
  return [...map.entries()].sort(([left], [right]) => left.localeCompare(right));
}

export function ListingSlotPicker({
  listingId,
  slots,
  ownerId,
  agentId,
}: ListingSlotPickerProps) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const grouped = useMemo(() => groupByDay(slots), [slots]);
  const upcomingCount = grouped.reduce((sum, [, items]) => sum + items.length, 0);

  // Role gates the experience, but we keep all hooks above this line so order
  // is stable across renders (React requires it).
  const role = hydrated && isAuthenticated ? user?.role : undefined;
  const isOwnerOrAgent =
    role === "OWNER" || role === "AGENT" || role === "ADMIN" ||
    user?.id?.toString() === ownerId ||
    (agentId != null && user?.id?.toString() === agentId);
  const isApplicant = role === "APPLICANT";

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!selectedSlotId) throw new Error("Pick a slot first.");
      return requestInspection({
        slotId: Number(selectedSlotId),
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Inspection requested. You'll see it on My Inspections.");
      void queryClient.invalidateQueries({ queryKey: ["applicant-inspections"] });
      setSelectedSlotId(null);
      setNotes("");
      // Drop the user on their inspections workspace so they can see the new
      // entry pending owner acceptance.
      router.push(`/dashboard/inspections?listingId=${encodeURIComponent(listingId)}`);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          toast.error("That slot was just taken. Pick another time.");
          router.refresh();
          setSelectedSlotId(null);
          return;
        }
        if (error.status === 403) {
          toast.error("Only applicant accounts can book inspections.");
          return;
        }
        if (error.status === 401) {
          toast.error("Please sign in again to complete booking.");
          return;
        }
      }
      toast.error(error instanceof Error ? error.message : "We couldn't book this slot.");
    },
  });

  const requestMutation = useMutation({
    mutationFn: () => {
      const body = fallbackMessage.trim();
      if (!body) throw new Error("Add a short note so the owner can respond.");
      return postListingComment(listingId, `🗓️ Custom inspection request: ${body}`);
    },
    onSuccess: () => {
      toast.success("Request sent. The owner will reply with available times.");
      setFallbackMessage("");
      setFallbackOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't send that request.");
    },
  });

  return (
    <section
      id="schedule-inspection"
      className="scroll-mt-24 border border-border bg-card p-6 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
            Schedule a visit
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            {upcomingCount === 0
              ? "No slots yet; ask for a time"
              : upcomingCount === 1
                ? "1 open inspection slot"
                : `${upcomingCount} open inspection slots`}
          </h2>
        </div>
        {isApplicant && upcomingCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 border border-border bg-secondary px-2.5 py-1 text-[11px] uppercase tracking-eyebrow text-muted-foreground">
            <Sparkles className="h-3 w-3" aria-hidden />
            One-tap booking
          </span>
        ) : null}
      </div>

      {/* OWNER / AGENT viewing their own listing → informational only */}
      {hydrated && isOwnerOrAgent ? (
        <div className="mt-6 border border-dashed border-border p-4 text-sm text-muted-foreground">
          You manage this listing. Applicants will book the slots you create from{" "}
          <Link
            href={role === "AGENT" ? "/agent/inspections" : "/owner/inspections"}
            className="font-medium text-primary hover:text-primary/80"
          >
            Inspection slots
          </Link>
          .
        </div>
      ) : null}

      {/* Has slots → tile picker (guest preview if not signed in) */}
      {!isOwnerOrAgent && upcomingCount > 0 ? (
        <div className="mt-6 space-y-5">
          {grouped.map(([day, slotsForDay]) => (
            <div key={day}>
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                {dayFormatter.format(new Date(`${day}T00:00:00`))}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {slotsForDay.map((slot) => {
                  const active = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        if (!isApplicant) return;
                        setSelectedSlotId(active ? null : slot.id);
                      }}
                      disabled={!isApplicant || bookMutation.isPending}
                      aria-pressed={active}
                      className={cn(
                        "group flex flex-col items-start gap-1 border px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary/30 text-foreground hover:bg-secondary",
                        !isApplicant && "cursor-default hover:bg-secondary/30",
                      )}
                    >
                      <span className="text-xs uppercase tracking-eyebrow opacity-70">
                        {new Date(slot.startsAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="font-medium tabular-nums">
                        {timeFormatter.format(new Date(slot.startsAt))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Applicant booking strip */}
          {isApplicant && selectedSlotId ? (
            <div className="mt-6 space-y-3 border-t border-border pt-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                  Optional note for the owner
                </span>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything they should know: pets, group size, accessibility needs."
                  rows={3}
                  className="mt-2"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Booking sends the request to the owner. You'll see it under{" "}
                  <Link href="/dashboard/inspections" className="text-primary hover:text-primary/80">
                    My inspections
                  </Link>
                  .
                </p>
                <Button
                  type="button"
                  onClick={() => bookMutation.mutate()}
                  disabled={bookMutation.isPending}
                  size="lg"
                  className="h-11 gap-2"
                >
                  <Check className="h-4 w-4" aria-hidden />
                  {bookMutation.isPending ? "Booking…" : "Book this slot"}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Guest preview footer */}
          {hydrated && !isAuthenticated ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <p className="text-sm text-muted-foreground">
                Sign in as an applicant to book a slot directly from this page.
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/login?next=${encodeURIComponent(`/listings/${listingId}#schedule-inspection`)}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10")}
                >
                  Log in
                </Link>
                <Link
                  href={`/signup?next=${encodeURIComponent(`/listings/${listingId}#schedule-inspection`)}`}
                  className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-10")}
                >
                  Create account
                </Link>
              </div>
            </div>
          ) : null}

          {/* Wrong-role footer (signed in as owner / agent / admin browsing) */}
          {isApplicant ? null : hydrated && isAuthenticated && !isOwnerOrAgent ? (
            <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
              Inspection bookings are reserved for applicant accounts. Switch profiles to book.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* No slots → applicant can ping the owner publicly */}
      {!isOwnerOrAgent && upcomingCount === 0 ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The owner hasn't published inspection slots yet. You can drop a public
            note with your preferred time; they'll create a matching slot and
            confirm.
          </p>

          {hydrated && isApplicant ? (
            fallbackOpen ? (
              <div className="space-y-3 border border-border p-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                    Preferred time + a short note
                  </span>
                  <Textarea
                    value={fallbackMessage}
                    onChange={(e) => setFallbackMessage(e.target.value)}
                    placeholder="e.g. Saturday afternoon, anytime after 2 PM. Coming with my partner."
                    rows={3}
                    className="mt-2"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFallbackOpen(false);
                      setFallbackMessage("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => requestMutation.mutate()}
                    disabled={requestMutation.isPending || !fallbackMessage.trim()}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    {requestMutation.isPending ? "Sending…" : "Send request"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setFallbackOpen(true)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <CalendarClock className="h-4 w-4" aria-hidden />
                Request a custom time
              </Button>
            )
          ) : hydrated && !isAuthenticated ? (
            <Link
              href={`/signup?next=${encodeURIComponent(`/listings/${listingId}#schedule-inspection`)}`}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "gap-2")}
            >
              <CalendarClock className="h-4 w-4" aria-hidden />
              Create an account to request a time
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
