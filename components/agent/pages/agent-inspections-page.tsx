"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus } from "lucide-react";

import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  SectionCard,
} from "@/components/dashboard/applicant-ui";
import { formatDate } from "@/components/dashboard/utils";
import { InspectionSlotCreateDialog } from "@/components/inspection/inspection-slot-create-dialog";
import { InspectionTabFilters } from "@/components/inspection/inspection-tab-filters";
import { WorkspaceInspectionCard } from "@/components/inspection/workspace-inspection-card";
import { Button } from "@/components/ui/button";
import { listAgentManagedListings, listAgentWorkspaceInspections } from "@/lib/agent-dashboard";
import { agentHasOperationalAccess } from "@/lib/assignment-lifecycle";
import {
  readWorkspaceInspectionNotes,
  saveInspectionServerState,
  saveWorkspaceInspectionNote,
  workspaceInspectionTab,
} from "@/lib/workspace-inspections";
import { useAuth } from "@/lib/use-auth";

export function AgentInspectionsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const queryClient = useQueryClient();
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [tab, setTab] = useState("pending");
  const [calendarView, setCalendarView] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const inspectionsQuery = useQuery({
    queryKey: ["agent-workspace-inspections", userId],
    queryFn: () => listAgentWorkspaceInspections(userId),
    enabled: userId > 0,
  });

  const managedListingsQuery = useQuery({
    queryKey: ["agent-managed-listings"],
    queryFn: listAgentManagedListings,
    enabled: userId > 0,
  });

  const slotListingOptions = useMemo(
    () =>
      (managedListingsQuery.data ?? [])
        .filter((item) => agentHasOperationalAccess(item.assignment.status) && item.listing)
        .map((item) => ({
          id: item.assignment.listingId,
          title: item.listing?.title ?? `Listing #${item.assignment.listingId}`,
        })),
    [managedListingsQuery.data],
  );

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["agent-workspace-inspections", userId] });
  };

  if (inspectionsQuery.isLoading) return <LoadingPanel label="Loading inspection activity..." />;
  if (inspectionsQuery.isError || !inspectionsQuery.data) {
    return (
      <ErrorPanel
        body="We couldn't load your inspection queue right now."
        onRetry={() => void inspectionsQuery.refetch()}
      />
    );
  }

  const items = inspectionsQuery.data.filter((item) => workspaceInspectionTab(item) === tab);

  const groups = items.reduce<Record<string, typeof items>>((accumulator, item) => {
    const key = item.slot ? formatDate(item.slot.startsAt) : formatDate(item.requestedAt);
    accumulator[key] = [...(accumulator[key] ?? []), item];
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
      <InspectionSlotCreateDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        listings={slotListingOptions}
        queryKeysToInvalidate={[["agent-managed-listings"], ["agent-workspace-inspections", userId]]}
      />

      <DashboardPageIntro
        eyebrow="Inspection workspace"
        title="Inspections"
        description="Confirmed visits on your accepted listings. Reschedule, complete, or cancel from Haven when the slot time allows."
        actions={
          <Button variant="outline" onClick={() => setCalendarView((current) => !current)}>
            <CalendarDays className="mr-2 h-4 w-4" aria-hidden />
            {calendarView ? "List view" : "Calendar view"}
          </Button>
        }
      />

      <SectionCard
        title="Inspection slots"
        description="Publish bookable windows on accepted listings."
        action={
          <Button
            type="button"
            onClick={() => setSlotDialogOpen(true)}
            className="shrink-0 gap-2"
            disabled={slotListingOptions.length === 0}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Publish times
          </Button>
        }
      >
        {slotListingOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Accept a listing assignment first. Only accepted listings can receive new inspection slots.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {slotListingOptions.length} listing{slotListingOptions.length === 1 ? "" : "s"} ready for new times.
          </p>
        )}
      </SectionCard>

      <InspectionTabFilters
        value={tab}
        onChange={setTab}
        options={[
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Completed", value: "completed" },
          { label: "Declined / cancelled", value: "cancelled" },
        ]}
      />

      {items.length === 0 ? (
        <EmptyPanel
          title="No inspections in this tab"
          body="Booking requests on your managed listings appear here with Haven status and visit windows."
        />
      ) : calendarView ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(groups).map(([date, group]) => (
            <SectionCard key={date} title={date} description={`${group.length} visit${group.length === 1 ? "" : "s"}.`}>
              <div className="space-y-3">
                {group.map((item) => (
                  <div key={item.inspection.id} className="border border-border bg-secondary/40 px-4 py-4">
                    <p className="text-sm font-medium text-foreground">{item.listing?.title ?? "Managed listing"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.applicantName}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <WorkspaceInspectionCard
              key={item.inspection.id}
              item={item}
              role="agent"
              note={notes[item.inspection.id] ?? ""}
              onNoteChange={(value) => {
                const next = { ...notes, [item.inspection.id]: value };
                setNotes(next);
                saveWorkspaceInspectionNote(userId, item.inspection.id, value);
              }}
              onRefresh={refresh}
              onPersistInspection={(inspection) => {
                saveInspectionServerState(userId, inspection);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
