/* eslint-disable @next/next/no-img-element */
"use client";

import { useSearchParams } from "next/navigation";
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
  listInspections,
  type EnrichedInspection,
} from "@/lib/applicant-dashboard";
import {
  buildCalendarHref,
  formatInspectionWindow,
  inspectionStatusVariant,
  inspectionTabFor,
} from "@/components/dashboard/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
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
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const fromListingId = searchParams.get("listingId");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<InspectionTab>("upcoming");

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

  const continuationCard =
    fromListingId != null && fromListingId !== "" ? (
      <SectionCard
        title="Finish booking on the listing"
        description="Choose a published slot or request a time from the property page. Messages and host details stay on that flow."
      >
        <Link href={`/listings/${fromListingId}`} className={buttonVariants({ variant: "primary", size: "md" })}>
          Open listing
        </Link>
      </SectionCard>
    ) : null;

  if (inspectionsQuery.isLoading) {
    return (
      <div className="space-y-6">
        {continuationCard}
        <LoadingPanel label="Loading your inspections..." />
      </div>
    );
  }

  if (inspectionsQuery.isError) {
    return (
      <div className="space-y-6">
        {continuationCard}
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
      {continuationCard}

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
