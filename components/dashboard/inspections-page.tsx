/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus2, MessageSquarePlus, RefreshCcw, XCircle } from "lucide-react";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import {
  cancelInspectionWithReason,
  fetchListingBookingPhotos,
  fetchListingBookingSlots,
  fetchListingBookingSummary,
  listInspections,
  requestInspection,
  type EnrichedInspection,
} from "@/lib/applicant-dashboard";
import {
  buildCalendarHref,
  formatInspectionWindow,
  inspectionStatusVariant,
  inspectionTabFor,
} from "@/components/dashboard/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InspectionSlotBookingCalendar } from "@/components/inspection/inspection-slot-booking-calendar";
import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import { CancelInspectionDialog } from "@/components/inspection/cancel-inspection-dialog";
import { inspectionSlotClaimErrorMessage } from "@/lib/inspection-slot-errors";
import { InspectionTabFilters } from "@/components/inspection/inspection-tab-filters";
import {
  applicantCancelBlockedReason,
  applicantInspectionOutcomeLine,
  canApplicantCancelInspection,
  inspectionCancelErrorMessage,
  inspectionHavenStatusLabel,
} from "@/lib/inspection-lifecycle";
import { formatSlotBookingLabel } from "@/lib/inspection-slots";
import { formatNaira } from "@/lib/format";
import { normalizeListingRouteId } from "@/lib/seed/public-data";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { fallbackListingPhoto } from "@/lib/seed/photos";

type InspectionTab = "upcoming" | "past" | "cancelled";

const TAB_LABELS: Record<InspectionTab, string> = {
  upcoming: "Upcoming",
  past: "Past",
  cancelled: "Cancelled",
};

function EmptyInspectionState({ tab }: { tab: InspectionTab }) {
  if (tab === "upcoming") {
    return (
      <EmptyPanel
        title="No upcoming inspections"
        body="Once you book a slot from a listing page, the date, time, and host details will show up here."
        ctaLabel="Browse listings"
        ctaHref="/listings"
      />
    );
  }

  if (tab === "past") {
    return (
      <EmptyPanel
        title="No past inspections yet"
        body="Your completed visits will stay here so you can revisit details and leave reviews when the timing is right."
      />
    );
  }

  return (
    <EmptyPanel
      title="No cancelled inspections"
      body="If a booking is cancelled or declined, DreamHomes keeps it here so you can rebook quickly."
    />
  );
}

function InspectionBookingFromListing({ listingId, userId }: { listingId: string; userId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const listingQuery = useQuery({
    queryKey: ["inspection-booking-listing", listingId],
    queryFn: () => fetchListingBookingSummary(listingId),
  });

  const slotsQuery = useQuery({
    queryKey: ["inspection-booking-slots", listingId],
    queryFn: () => fetchListingBookingSlots(listingId),
  });

  const photosQuery = useQuery({
    queryKey: ["inspection-booking-photos", listingId],
    queryFn: () => fetchListingBookingPhotos(listingId),
  });

  const calendarSlots = useMemo(
    () =>
      (slotsQuery.data ?? []).map((slot) => ({
        id: String(slot.id),
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      })),
    [slotsQuery.data],
  );

  const selectedSlot = useMemo(
    () => calendarSlots.find((slot) => slot.id === selectedSlotId) ?? null,
    [calendarSlots, selectedSlotId],
  );

  const bookMutation = useMutation({
    mutationFn: () => requestInspection({ slotId: Number(selectedSlotId!), notes: notes.trim() || undefined }),
    onSuccess: () => {
      toast.success("Inspection requested.");
      void queryClient.invalidateQueries({ queryKey: ["applicant-inspections", userId] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", userId] });
      setSelectedSlotId(null);
      setNotes("");
      router.replace("/dashboard/inspections");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          toast.error(inspectionSlotClaimErrorMessage(error));
          void slotsQuery.refetch();
          setSelectedSlotId(null);
          return;
        }
        if (error.status === 403) {
          toast.error("This action is only available for applicant accounts.");
          return;
        }
        // 401 → handled globally (refresh-and-retry; on failure, AUTH_EXPIRED_EVENT
        // clears the session and routes to /login). No local toast needed.
      }
      toast.error(inspectionSlotClaimErrorMessage(error));
    },
  });

  const listing = listingQuery.data;
  const sortedPhotos = (photosQuery.data ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const heroPhoto = sortedPhotos[0]?.url ?? null;
  const fallbackHero = fallbackListingPhoto(`${listingId}-${listing?.title ?? "listing"}`, { w: 720, ratio: "4:3" });

  if (listingQuery.isLoading) {
    return (
      <SectionCard title="Book an inspection" description="Loading listing and available times…">
        <LoadingPanel label="Loading…" />
      </SectionCard>
    );
  }

  if (listingQuery.isError || !listing) {
    return (
      <SectionCard title="Book an inspection" description="We couldn't load this listing from Haven.">
        <ErrorPanel
          body={listingQuery.error instanceof Error ? listingQuery.error.message : "Listing unavailable."}
          onRetry={() => void listingQuery.refetch()}
        />
        <Link href="/listings" className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-4 inline-flex")}>
          Browse listings
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Book an inspection"
      description="Choose one of the owner's published slots. Your request is recorded immediately; the slot stops showing to other applicants once it is yours."
    >
      <div className="rounded-2xl border border-border bg-muted/30 p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-[200px]">
            <img
              src={heroPhoto ?? fallbackHero.url}
              alt={listing.title ?? "Listing"}
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-lg font-semibold tracking-tight text-foreground">{listing.title ?? "Untitled listing"}</p>
            <p className="text-sm text-muted-foreground">{listing.property.address}</p>
            <p className="text-base font-medium text-foreground">
              {formatNaira(listing.askingPrice)}
              {listing.listingType === "RENT" ? (
                <span className="text-sm font-normal text-muted-foreground"> / year</span>
              ) : null}
            </p>
            <Link href={`/listings/${listingId}`} className="inline-flex text-sm font-medium text-primary hover:text-primary/80">
              View full listing
            </Link>
          </div>
        </div>
      </div>

      {slotsQuery.isLoading ? (
        <div className="mt-6">
          <LoadingPanel label="Loading available slots…" />
        </div>
      ) : slotsQuery.isError ? (
        <div className="mt-6">
          <ErrorPanel
            body={slotsQuery.error instanceof Error ? slotsQuery.error.message : "Could not load slots."}
            onRetry={() => void slotsQuery.refetch()}
          />
        </div>
      ) : calendarSlots.length === 0 ? (
        <div className="mt-6">
          <EmptyPanel
            title="No open slots right now"
            body="Ask the owner to publish new times, or check back later."
            ctaLabel="Open listing"
            ctaHref={`/listings/${listingId}`}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <InspectionSlotBookingCalendar
            slots={calendarSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
          />

          {selectedSlot ? (
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{formatSlotBookingLabel(selectedSlot)}</span>
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="inspection-notes">Notes for the host (optional)</Label>
            <Textarea
              id="inspection-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={5000}
              placeholder="e.g. two people attending, parking needs"
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              disabled={selectedSlotId == null || bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
            >
              {bookMutation.isPending ? "Booking…" : "Request this visit"}
            </Button>
            <Link href={`/listings/${listingId}`} className={buttonVariants({ variant: "outline", size: "md" })}>
              Back to listing
            </Link>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function InspectionCard({
  item,
  tab,
  onRequestCancel,
  cancelling,
}: {
  item: EnrichedInspection;
  tab: InspectionTab;
  onRequestCancel: () => void;
  cancelling: boolean;
}) {
  const status = item.inspection.status;
  const canCancel = canApplicantCancelInspection(status);
  const blockedReason = applicantCancelBlockedReason(status);
  const counterpartName = item.listing?.agent?.name ?? item.listing?.owner.name ?? "DreamHomes host";
  const fallback = fallbackListingPhoto(
    `${item.listing?.id ?? item.slot?.listingId ?? item.inspection.id}-${item.listing?.title ?? "inspection-listing"}`,
    { w: 540, ratio: "4:3" },
  );

  return (
    <div className="border border-border bg-card px-5 py-5 shadow-none">
      <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="overflow-hidden border border-border bg-muted">
          <img
            src={item.listing?.photos[0]?.url ?? fallback.url}
            alt={item.listing?.photos[0]?.alt ?? fallback.alt ?? item.listing?.title ?? `Inspection #${item.inspection.id}`}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {item.listing?.title ?? `Inspection #${item.inspection.id}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.listing?.location ?? "Location is loading from Haven"}
              </p>
              {item.slot ? (
                <p className="text-sm text-foreground">
                  {formatInspectionWindow(item.slot.startsAt, item.slot.endsAt)}
                </p>
              ) : null}
            </div>
            <StatusBadge
              label={inspectionHavenStatusLabel(item.inspection.status)}
              variant={inspectionStatusVariant(item.inspection.status)}
            />
          </div>

          {tab === "cancelled" ? (
            <p className="border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">
              {applicantInspectionOutcomeLine(status)}
            </p>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-border px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Host</p>
              <p className="mt-2 font-medium text-foreground">{counterpartName}</p>
            </div>
            <div className="border border-border px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Notes</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.inspection.notes?.trim() || "No extra notes added to this booking."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {tab === "upcoming" ? (
              <>
                {canCancel ? (
                  <Button variant="outline" onClick={onRequestCancel} disabled={cancelling}>
                    <XCircle className="h-4 w-4" aria-hidden />
                    Cancel booking
                  </Button>
                ) : blockedReason ? (
                  <p className="text-sm text-muted-foreground">{blockedReason}</p>
                ) : null}
                <Link
                  href={buildCalendarHref(item)}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ size: "md" })}
                >
                  <CalendarPlus2 className="h-4 w-4" aria-hidden />
                  Add to Calendar
                </Link>
              </>
            ) : null}

            {tab === "past" ? (
              <Link
                href={item.listing ? `/listings/${item.listing.id}#reviews` : "/dashboard/profile"}
                className={buttonVariants({ size: "md" })}
              >
                <MessageSquarePlus className="h-4 w-4" aria-hidden />
                Leave Review
              </Link>
            ) : null}

            {tab === "cancelled" ? (
              <Link
                href={item.listing ? `/listings/${item.listing.id}` : "/listings"}
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                <RefreshCcw className="h-4 w-4" aria-hidden />
                Rebook
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplicantInspectionsPage() {
  const { user, role } = useAuth();
  const searchParams = useSearchParams();
  const fromListingId = searchParams.get("listingId");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<InspectionTab>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<EnrichedInspection | null>(null);

  const normalizedFromListing =
    fromListingId != null && fromListingId.trim() !== "" ? normalizeListingRouteId(fromListingId) : null;

  const bookingHeader =
    normalizedFromListing && role === "APPLICANT" && user?.id ? (
      <InspectionBookingFromListing listingId={normalizedFromListing} userId={user.id} />
    ) : normalizedFromListing ? (
      <SectionCard
        title="Book on the listing"
        description="Sign in as an applicant to pick an open inspection slot for this property."
      >
        <div className="flex flex-wrap gap-3">
          <Link href={`/listings/${normalizedFromListing}`} className={buttonVariants({ variant: "outline", size: "md" })}>
            View listing
          </Link>
          <Link
            href={`/login?next=${encodeURIComponent(`/dashboard/inspections?listingId=${encodeURIComponent(normalizedFromListing)}`)}`}
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Sign in
          </Link>
        </div>
      </SectionCard>
    ) : null;

  const inspectionsQuery = useQuery({
    queryKey: ["applicant-inspections", user?.id],
    queryFn: () => listInspections(50),
    enabled: Boolean(user?.id),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ inspectionId, reason }: { inspectionId: number; reason: string }) =>
      cancelInspectionWithReason(inspectionId, reason),
    onSuccess: (_data, { inspectionId }) => {
      toast.success("Inspection cancelled. The other party has been notified.");
      setCancelTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["applicant-inspections", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", user?.id] });
      const listingId = inspectionsQuery.data?.items.find((row) => row.inspection.id === inspectionId)?.listing?.id;
      if (listingId) {
        void queryClient.invalidateQueries({ queryKey: ["listing-open-slots", String(listingId)] });
      }
    },
    onError: (error) => {
      toast.error(inspectionCancelErrorMessage(error));
    },
  });

  const grouped = useMemo(() => {
    const items = inspectionsQuery.data?.items ?? [];
    return {
      upcoming: items.filter((item) => inspectionTabFor(item) === "upcoming"),
      past: items.filter((item) => inspectionTabFor(item) === "past"),
      cancelled: items.filter((item) => inspectionTabFor(item) === "cancelled"),
    };
  }, [inspectionsQuery.data?.items]);

  if (inspectionsQuery.isLoading) {
    return (
      <div className="space-y-6">
        {bookingHeader}
        <LoadingPanel label="Loading your inspections..." />
      </div>
    );
  }

  if (inspectionsQuery.isError) {
    return (
      <div className="space-y-6">
        {bookingHeader}
        <ErrorPanel
          body={inspectionsQuery.error instanceof Error ? inspectionsQuery.error.message : "We couldn't load your inspections."}
          onRetry={() => void inspectionsQuery.refetch()}
        />
      </div>
    );
  }

  const activeItems = grouped[activeTab];

  const cancelWindowLabel = cancelTarget?.slot
    ? formatInspectionWindow(cancelTarget.slot.startsAt, cancelTarget.slot.endsAt)
    : cancelTarget?.listing?.title ?? "this visit";

  return (
    <div className="space-y-6">
      {bookingHeader}

      <CancelInspectionDialog
        open={cancelTarget != null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        windowLabel={cancelWindowLabel}
        pending={cancelMutation.isPending}
        onSubmit={(reason) => {
          if (cancelTarget) cancelMutation.mutate({ inspectionId: cancelTarget.inspection.id, reason });
        }}
      />

      <DashboardPageIntro
        eyebrow="Inspections"
        title="My inspections"
        description="Keep every booking in view, add approved visits to your calendar, and quickly recover if a slot changes."
      />

      <SectionCard title="Inspection tabs" description="Switch between your upcoming, past, and cancelled bookings.">
        <InspectionTabFilters
          value={activeTab}
          onChange={(tab) => setActiveTab(tab as InspectionTab)}
          options={(Object.keys(TAB_LABELS) as InspectionTab[]).map((tab) => ({
            label: TAB_LABELS[tab],
            value: tab,
          }))}
        />
      </SectionCard>

      {activeItems.length === 0 ? (
        <EmptyInspectionState tab={activeTab} />
      ) : (
        <div className="space-y-4">
          {activeItems.map((item) => (
            <InspectionCard
              key={item.inspection.id}
              item={item}
              tab={activeTab}
              onRequestCancel={() => setCancelTarget(item)}
              cancelling={cancelMutation.isPending && cancelTarget?.inspection.id === item.inspection.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
