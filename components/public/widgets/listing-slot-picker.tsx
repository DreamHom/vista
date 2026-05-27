"use client";

/**
 * Calendly-style inspection booking on `/listings/[id]`.
 * Applicants pick a published day, then a time window, then confirm in one step.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, ChevronDown, MessageSquare } from "lucide-react";

import { InspectionSlotBookingCalendar } from "@/components/inspection/inspection-slot-booking-calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/use-auth";
import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import { inspectionSlotClaimErrorMessage } from "@/lib/inspection-slot-errors";
import { fetchListingBookingSlots, postListingComment, requestInspection } from "@/lib/applicant-dashboard";
import {
  formatSlotBookingLabel,
  groupInspectionSlotsByDay,
  type InspectionSlotInput,
  toInspectionSlotInputs,
  upcomingInspectionSlots,
} from "@/lib/inspection-slots";
import { cn } from "@/lib/utils";

export type SlotInput = InspectionSlotInput;

interface ListingSlotPickerProps {
  listingId: string;
  slots: SlotInput[];
  ownerId?: string;
  agentId?: string | null;
}

export function ListingSlotPicker({ listingId, slots, ownerId, agentId }: ListingSlotPickerProps) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const slotsQuery = useQuery({
    queryKey: ["listing-open-slots", listingId],
    queryFn: async () => toInspectionSlotInputs(await fetchListingBookingSlots(listingId)),
    initialData: slots,
    enabled: Boolean(listingId),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const role = hydrated && isAuthenticated ? user?.role : undefined;
      const applicant = role === "APPLICANT";
      if (!applicant) return false;
      const data = query.state.data ?? slots;
      return upcomingInspectionSlots(data).length > 0 ? 30_000 : false;
    },
  });

  const liveSlots = slotsQuery.data ?? slots;
  const upcoming = useMemo(() => upcomingInspectionSlots(liveSlots), [liveSlots]);
  const grouped = useMemo(() => groupInspectionSlotsByDay(liveSlots), [liveSlots]);
  const upcomingCount = upcoming.length;

  const role = hydrated && isAuthenticated ? user?.role : undefined;
  const isOwnerOrAgent =
    role === "OWNER" ||
    role === "AGENT" ||
    role === "ADMIN" ||
    user?.id?.toString() === ownerId ||
    (agentId != null && user?.id?.toString() === agentId);
  const isApplicant = role === "APPLICANT";
  const canBook = hydrated && isApplicant;

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [bookedSlotLabel, setBookedSlotLabel] = useState<string | null>(null);

  const selectedSlot = useMemo(
    () => upcoming.find((slot) => slot.id === selectedSlotId) ?? null,
    [upcoming, selectedSlotId],
  );

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!selectedSlot) throw new Error("Pick a time first.");
      return requestInspection({
        slotId: Number(selectedSlot.id),
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      const label = selectedSlot ? formatSlotBookingLabel(selectedSlot) : null;
      const claimedSlotId = selectedSlot?.id ?? null;
      void queryClient.invalidateQueries({ queryKey: ["applicant-inspections"] });
      // Optimistically drop the slot we just claimed from this listing's
      // picker cache so it disappears immediately, even before haven's next
      // `/listings/{id}/slots` response confirms. Then queue a real refetch
      // to reconcile with the server (catches the case where another
      // applicant claimed a different slot between our renders).
      if (claimedSlotId != null) {
        queryClient.setQueryData<typeof liveSlots>(
          ["listing-open-slots", listingId],
          (prev) => (prev ?? liveSlots).filter((slot) => slot.id !== claimedSlotId),
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["listing-open-slots", listingId] });
      setBookedSlotLabel(label);
      setSelectedSlotId(null);
      setNotes("");
      setNotesOpen(false);
      toast.success("Visit requested. The owner will confirm your slot.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          toast.error(inspectionSlotClaimErrorMessage(error));
          setSelectedSlotId(null);
          void slotsQuery.refetch();
          return;
        }
        if (error.status === 422) {
          toast.error(
            apiErrorMessage(error, "You already have a request on this listing. Check My inspections."),
          );
          setSelectedSlotId(null);
          return;
        }
        if (error.status === 403) {
          toast.error("Only applicant accounts can book inspections.");
          return;
        }
        // 401s are handled globally: lib/api.ts attempts a refresh-and-retry;
        // if that fails, the AUTH_EXPIRED_EVENT listener in app-providers
        // clears the session and routes to /login. We deliberately don't
        // toast here so the user only sees one signal.
      }
      toast.error(inspectionSlotClaimErrorMessage(error));
    },
  });

  const requestMutation = useMutation({
    mutationFn: () => {
      const body = fallbackMessage.trim();
      if (!body) throw new Error("Add a short note so the owner can respond.");
      return postListingComment(listingId, `Custom inspection request: ${body}`);
    },
    onSuccess: () => {
      toast.success("Request sent. The owner can add matching slots on their calendar.");
      setFallbackMessage("");
      setFallbackOpen(false);
      router.refresh();
    },
    onError: (error) => toast.error(apiErrorMessage(error, "We couldn't send that request.")),
  });

  return (
    <section id="schedule-inspection" className="scroll-mt-24 border border-border bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Schedule a visit</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            {upcomingCount === 0 ? "No open times yet" : "Pick a time that works for you"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            The owner published fixed windows on their calendar. Choose a day, tap a time, and send your request in
            one step, like Calendly.
          </p>
        </div>
      </div>

      {bookedSlotLabel ? (
        <div className="mt-6 border border-border bg-secondary/30 p-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold tracking-tight text-foreground">Request sent</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                You asked to visit on{" "}
                <span className="font-medium text-foreground">{bookedSlotLabel}</span>. The owner will confirm. Track
                it under My inspections.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/inspections"
                  className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-10")}
                >
                  View My inspections
                </Link>
                {upcomingCount > 0 ? (
                  <Button type="button" variant="outline" size="sm" className="h-10" onClick={() => setBookedSlotLabel(null)}>
                    Book another time
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!bookedSlotLabel && hydrated && isOwnerOrAgent ? (
        <div className="mt-6 space-y-4">
          <div className="border border-dashed border-border p-4 text-sm text-muted-foreground">
            You manage this listing. Add bookable windows from{" "}
            <Link
              href={role === "AGENT" ? "/agent/inspections" : "/owner/inspections"}
              className="font-medium text-accent hover:underline"
            >
              Inspection slots
            </Link>
            . Applicants only see the times you publish.
          </div>
          {upcomingCount > 0 ? (
            <div className="border border-border bg-secondary/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                Open slots ({upcomingCount})
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {upcoming.map((slot) => (
                  <li key={slot.id} className="border border-border bg-card px-3 py-2">
                    {formatSlotBookingLabel(slot)}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No open slots are published on this listing yet.</p>
          )}
        </div>
      ) : null}

      {!bookedSlotLabel && !isOwnerOrAgent && upcomingCount > 0 ? (
        <div className="mt-6 space-y-4">
          <InspectionSlotBookingCalendar
            slots={liveSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
            interactive={canBook}
          />

          <p className="text-xs text-muted-foreground">
            Each time is exclusive. If two people tap the same slot, Haven keeps the first claim and returns an
            error to the other.
          </p>

          {canBook && selectedSlot ? (
            <div className="border border-border bg-secondary/20 p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <CalendarClock className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span className="text-muted-foreground">Your visit</span>
                <span className="font-semibold text-foreground">{formatSlotBookingLabel(selectedSlot)}</span>
              </div>

              <button
                type="button"
                className="mt-3 flex w-full items-center justify-between gap-2 border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary/50"
                onClick={() => setNotesOpen((open) => !open)}
                aria-expanded={notesOpen}
              >
                <span>Add a note for the owner (optional)</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", notesOpen && "rotate-180")} aria-hidden />
              </button>

              {notesOpen ? (
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Pets, group size, parking, accessibility needs."
                  rows={3}
                  className="mt-2"
                />
              ) : null}

              <Button
                type="button"
                size="lg"
                className="mt-4 h-12 w-full gap-2 sm:w-auto sm:min-w-[14rem]"
                disabled={bookMutation.isPending}
                onClick={() => bookMutation.mutate()}
              >
                <Check className="h-4 w-4" aria-hidden />
                {bookMutation.isPending ? "Sending request…" : "Request this visit"}
              </Button>
            </div>
          ) : null}

          {hydrated && !isAuthenticated ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-secondary/30 p-4">
              <p className="text-sm text-muted-foreground">Sign in as an applicant to book a published time.</p>
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

          {hydrated && isAuthenticated && !isOwnerOrAgent && !isApplicant ? (
            <p className="text-sm text-muted-foreground">Inspection bookings are for applicant accounts.</p>
          ) : null}

          {canBook && !selectedSlot ? (
            <p className="text-center text-sm text-muted-foreground">
              {grouped.length} day{grouped.length === 1 ? "" : "s"} with open times · select a slot to continue
            </p>
          ) : null}
        </div>
      ) : null}

      {!bookedSlotLabel && !isOwnerOrAgent && upcomingCount === 0 ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The owner has not published inspection times yet. Ask for a window you prefer; they can add matching slots
            to their calendar.
          </p>

          {hydrated && isApplicant ? (
            fallbackOpen ? (
              <div className="space-y-3 border border-border p-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                    When works for you?
                  </span>
                  <Textarea
                    value={fallbackMessage}
                    onChange={(event) => setFallbackMessage(event.target.value)}
                    placeholder="e.g. Saturday after 2 PM. Two people visiting."
                    rows={3}
                    className="mt-2"
                  />
                </label>
                <div className="flex flex-wrap justify-end gap-2">
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
                    disabled={requestMutation.isPending || !fallbackMessage.trim()}
                    onClick={() => requestMutation.mutate()}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    {requestMutation.isPending ? "Sending…" : "Send request"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" size="lg" className="gap-2" onClick={() => setFallbackOpen(true)}>
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
