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
  cancelInspection,
  fetchListingBookingPhotos,
  fetchListingBookingSlots,
  fetchListingBookingSummary,
  listInspections,
  requestInspection,
  type EnrichedInspection,
  type SlotResponse,
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
import { ApiError } from "@/lib/api";
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
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
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

  const openSlots = useMemo(() => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    return (slotsQuery.data ?? [])
      .filter((slot) => new Date(slot.startsAt).getTime() >= cutoff)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [slotsQuery.data]);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, SlotResponse[]>();
    for (const slot of openSlots) {
      const day = slot.startsAt.slice(0, 10);
      const list = map.get(day) ?? [];
      list.push(slot);
      map.set(day, list);
    }
    return [...map.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [openSlots]);

  const dayHeading = useMemo(
    () =>
      new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" }),
    [],
  );

  const bookMutation = useMutation({
    mutationFn: () => requestInspection({ slotId: selectedSlotId!, notes: notes.trim() || undefined }),
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
          toast.error("That slot was just taken. Pick another time.");
          void slotsQuery.refetch();
          setSelectedSlotId(null);
          return;
        }
        if (error.status === 403) {
          toast.error("This action is only available for applicant accounts.");
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
      ) : openSlots.length === 0 ? (
        <div className="mt-6">
          <EmptyPanel
            title="No open slots right now"
            body="Ask the owner to publish new times, or check back later."
            ctaLabel="Open listing"
            ctaHref={`/listings/${listingId}`}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <p className="text-sm font-medium text-foreground">Choose a time</p>
          {slotsByDay.map(([day, slots]) => (
            <div key={day}>
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                {dayHeading.format(new Date(`${day}T12:00:00`))}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const active = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50",
                      )}
                    >
                      {timeFormatter.format(new Date(slot.startsAt))}
                      {" – "}
                      {timeFormatter.format(new Date(slot.endsAt))}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-2">
        <Label htmlFor="inspection-notes">Notes for the host (optional)</Label>
        <Textarea
          id="inspection-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={5000}
          placeholder="e.g. two people attending, approximate arrival"
          rows={3}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="primary"
          disabled={selectedSlotId == null || bookMutation.isPending}
          onClick={() => bookMutation.mutate()}
        >
          {bookMutation.isPending ? "Booking…" : "Confirm inspection"}
        </Button>
        <Link href={`/listings/${listingId}`} className={buttonVariants({ variant: "outline", size: "md" })}>
          Back to listing
        </Link>
      </div>
    </SectionCard>
  );
}

function InspectionCard({
  item,
  tab,
  onCancel,
  cancelling,
}: {
  item: EnrichedInspection;
  tab: InspectionTab;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const counterpartName = item.listing?.agent?.name ?? item.listing?.owner.name ?? "DreamHomes host";
  const fallback = fallbackListingPhoto(
    `${item.listing?.id ?? item.slot?.listingId ?? item.inspection.id}-${item.listing?.title ?? "inspection-listing"}`,
    { w: 540, ratio: "4:3" },
  );

  return (
    <div className="rounded-3xl border border-border bg-white px-5 py-5">
      <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
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
              label={item.inspection.status}
              variant={inspectionStatusVariant(item.inspection.status)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Host</p>
              <p className="mt-2 font-medium text-foreground">{counterpartName}</p>
            </div>
            <div className="rounded-2xl border border-border px-4 py-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Notes</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.inspection.notes?.trim() || "No extra notes added to this booking."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {tab === "upcoming" ? (
              <>
                <Button variant="outline" onClick={onCancel} disabled={cancelling}>
                  <XCircle className="h-4 w-4" aria-hidden />
                  Cancel booking
                </Button>
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
    mutationFn: (inspectionId: number) => cancelInspection(inspectionId),
    onSuccess: () => {
      toast.success("Inspection cancelled.");
      void queryClient.invalidateQueries({ queryKey: ["applicant-inspections", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", user?.id] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't cancel this inspection.");
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

  return (
    <div className="space-y-6">
      {bookingHeader}

      <DashboardPageIntro
        eyebrow="Inspections"
        title="My inspections"
        description="Keep every booking in view, add confirmed visits to your calendar, and quickly recover if a slot changes."
      />

      <SectionCard title="Inspection tabs" description="Switch between your upcoming, past, and cancelled bookings.">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(TAB_LABELS) as InspectionTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  : "rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              }
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
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
              onCancel={() => cancelMutation.mutate(item.inspection.id)}
              cancelling={cancelMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
