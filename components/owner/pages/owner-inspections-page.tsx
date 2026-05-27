"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";

import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  SectionCard,
} from "@/components/dashboard/applicant-ui";
import { InspectionSlotCreateDialog } from "@/components/inspection/inspection-slot-create-dialog";
import { InspectionTabFilters } from "@/components/inspection/inspection-tab-filters";
import { WorkspaceInspectionCard } from "@/components/inspection/workspace-inspection-card";
import { Button } from "@/components/ui/button";
import { listOwnerListings, listOwnerWorkspaceInspections } from "@/lib/owner-dashboard";
import {
  readWorkspaceInspectionNotes,
  saveInspectionServerState,
  saveWorkspaceInspectionNote,
  workspaceInspectionTab,
} from "@/lib/workspace-inspections";
import { useAuth } from "@/lib/use-auth";

export function OwnerInspectionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [tab, setTab] = useState("pending");
  const [notes, setNotes] = useState<Record<number, string>>({});

  const inspectionsQuery = useQuery({
    queryKey: ["owner-workspace-inspections", user?.id],
    queryFn: () => listOwnerWorkspaceInspections(user!.id),
    enabled: !!user?.id,
  });

  const listingsQuery = useQuery({
    queryKey: ["owner-listings", user?.id],
    queryFn: () => listOwnerListings(100),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user) setNotes(readWorkspaceInspectionNotes(user.id));
  }, [user]);

  const listingOptions = useMemo(
    () =>
      (listingsQuery.data?.items ?? []).map((item) => ({
        id: item.listing.id,
        title: item.listing.title ?? `Listing #${item.listing.id}`,
      })),
    [listingsQuery.data],
  );

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["owner-workspace-inspections", user?.id] });
    void queryClient.invalidateQueries({ queryKey: ["owner-notifications"] });
  };

  if (inspectionsQuery.isLoading || listingsQuery.isLoading) {
    return <LoadingPanel label="Loading inspection activity..." />;
  }
  if (inspectionsQuery.error || listingsQuery.error) {
    return (
      <ErrorPanel
        body="We couldn't load inspection activity from Haven."
        onRetry={() => void inspectionsQuery.refetch()}
      />
    );
  }

  const items = (inspectionsQuery.data ?? []).filter((item) => workspaceInspectionTab(item) === tab);

  return (
    <div className="space-y-6">
      <InspectionSlotCreateDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        listings={listingOptions}
        queryKeysToInvalidate={[
          ["owner-workspace-inspections", user?.id],
          ["owner-listings", user?.id],
        ]}
      />

      <DashboardPageIntro
        eyebrow="Inspection operations"
        title="Inspections"
        description="Haven status, visit windows, and actions stay on one list. Approve pending requests, then manage confirmed visits from the same card."
      />

      <SectionCard
        title="Inspection slots"
        description="Publish non-overlapping time windows per listing. Applicants claim slots in Haven; first claim wins."
        action={
          <Button type="button" onClick={() => setSlotDialogOpen(true)} className="shrink-0 gap-2">
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Publish times
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Batch mode: pick a date, select morning and afternoon windows, publish once.
        </p>
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

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <WorkspaceInspectionCard
              key={item.inspection.id}
              item={item}
              role="owner"
              note={notes[item.inspection.id] ?? ""}
              onNoteChange={(value) => {
                const next = { ...notes, [item.inspection.id]: value };
                setNotes(next);
                saveWorkspaceInspectionNote(user!.id, item.inspection.id, value);
              }}
              onRefresh={refresh}
              onPersistInspection={(inspection) => {
                saveInspectionServerState(user!.id, inspection);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <EmptyPanel
            title="No inspections in this tab"
            body="New booking requests appear under Pending. After you approve on Haven, they move to Approved with cancel and no-show actions when the slot time allows."
          />
          <div className="flex justify-center">
            <Button type="button" onClick={() => setSlotDialogOpen(true)} className="gap-2">
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Publish inspection slots
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
