"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { OwnerListingAgentPanel } from "@/components/assignments/owner-listing-agent-panel";
import {
  getOwnerPropertyManagement,
  submitPropertyDocumentsVerification,
  updateOwnerListing,
} from "@/lib/owner-dashboard";
import { nextStatusForOwnerAction, type OwnerListingStatusAction } from "@/lib/listing-lifecycle";
import { isListingStaleConflict, ownerListingErrorMessage } from "@/lib/owner-listing-errors";
import { useAuth } from "@/lib/use-auth";
import { formatGroupedIntegerInput, formatStoredGroupedInteger, parseGroupedNumberInput } from "@/lib/format";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
import { ListingHistoryPanel } from "@/components/owner/listing-history-panel";
import { ListingStatusControls } from "@/components/owner/listing-status-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

import { FieldLabel, PropertyThumbnail, propertyImageUrl } from "./owner-page-primitives";

export function OwnerPropertyDetailPage({ propertyId }: { propertyId: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editState, setEditState] = useState({
    title: "",
    headline: "",
    description: "",
    askingPrice: "",
    handoverDate: "",
  });
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);
  const [pendingStatusAction, setPendingStatusAction] = useState<OwnerListingStatusAction | null>(null);

  const detailQuery = useQuery({
    queryKey: ["owner-property", user?.id, propertyId],
    queryFn: () => getOwnerPropertyManagement(propertyId, user!.id),
    enabled: !!user?.id,
  });

  const listing = detailQuery.data?.listingBundle?.listing ?? null;

  useEffect(() => {
    if (!listing) return;
    setEditState({
      title: listing.title ?? "",
      headline: listing.headline ?? "",
      description: listing.description ?? "",
      askingPrice: formatStoredGroupedInteger(String(listing.askingPrice ?? "")),
      handoverDate: listing.handoverDate ?? "",
    });
  }, [listing]);

  async function invalidatePropertyQueries() {
    await queryClient.invalidateQueries({ queryKey: ["owner-property", user?.id, propertyId] });
    await queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
  }

  function handleListingError(error: unknown, fallback: string) {
    toast.error(ownerListingErrorMessage(error, fallback));
    if (isListingStaleConflict(error)) {
      void detailQuery.refetch();
    }
  }

  const saveListingMutation = useMutation({
    mutationFn: async () => {
      if (!listing) return;
      await updateOwnerListing(listing.id, {
        title: editState.title,
        headline: editState.headline,
        description: editState.description,
        askingPrice: parseGroupedNumberInput(editState.askingPrice) ?? 0,
        handoverDate: editState.handoverDate || undefined,
        version: listing.version,
      });
    },
    onSuccess: async () => {
      toast.success("Listing offer details saved.");
      await invalidatePropertyQueries();
    },
    onError: (error) => handleListingError(error, "We couldn't save those listing changes."),
  });

  const statusMutation = useMutation({
    mutationFn: async (action: OwnerListingStatusAction) => {
      if (!listing) return;
      const nextStatus = nextStatusForOwnerAction(listing.status, action);
      if (!nextStatus) return;
      await updateOwnerListing(listing.id, { status: nextStatus, version: listing.version });
    },
    onMutate: (action) => {
      setPendingStatusAction(action);
    },
    onSuccess: async () => {
      toast.success("Listing availability updated.");
      setPendingStatusAction(null);
      await invalidatePropertyQueries();
    },
    onError: (error) => {
      setPendingStatusAction(null);
      handleListingError(error, "We couldn't change listing availability.");
    },
  });

  const verificationMutation = useMutation({
    mutationFn: async () => {
      if (verificationFiles.length === 0) return;
      await submitPropertyDocumentsVerification(propertyId, verificationFiles);
    },
    onSuccess: async () => {
      toast.success("Property verification documents submitted.");
      setVerificationFiles([]);
      await invalidatePropertyQueries();
    },
    onError: (error) => toast.error(ownerListingErrorMessage(error, "We couldn't submit the property documents just yet.")),
  });

  if (detailQuery.isLoading) return <LoadingPanel label="Loading property workspace..." />;
  if (detailQuery.error) {
    return <ErrorPanel body="We couldn't load this property workspace." onRetry={() => detailQuery.refetch()} />;
  }

  const data = detailQuery.data!;
  const detail = data.listingBundle?.detail ?? null;
  const listingLocked = listing?.status === "TAKEN_DOWN";

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Property workspace"
        title={data.property.address}
        description="The property is the long-lived address record. The listing is this offer (price, rent or sale, availability). Edit each in the right place."
        actions={
          <Link href="/owner/properties">
            <Button variant="outline">Back to properties</Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard
          title="Property record"
          description="Facts that stay true between tenants: address, type, rooms, verification."
        >
          <div className="space-y-5">
            <div className="h-64 w-full overflow-hidden border border-border">
              <PropertyThumbnail
                url={detail?.photos?.[0]?.url ?? propertyImageUrl({ listingDetail: detail })}
                alt={data.property.address}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Address</p>
                <p className="mt-2 text-sm font-medium text-foreground">{data.property.address}</p>
              </div>
              <div className="border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Type</p>
                <p className="mt-2 text-sm font-medium text-foreground">{data.property.type.replaceAll("_", " ")}</p>
              </div>
              <div className="border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Bedrooms / baths</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {data.property.bedrooms ?? "—"} bed · {data.property.bathrooms ?? "—"} bath
                </p>
              </div>
              <div className="border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Property verification</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {data.propertyVerification?.status ?? "Not submitted"}
                </p>
              </div>
            </div>

            {listing ? (
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard label="Views" value={String(listing.viewCount ?? 0)} hint="On the active listing." />
                <MetricCard label="Offers" value={String(data.offers.length)} hint="Tied to this listing." />
                <MetricCard label="Comments" value={String(data.comments.length)} hint="Public Q&A." />
                <MetricCard
                  label="Inspection slots"
                  value={String(detail?.slots.length ?? 0)}
                  hint="Open or claimed on this listing."
                />
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Current listing offer"
          description={
            listing
              ? "Marketing and commercial terms for this availability. Use availability controls below for pause or close."
              : "Publish a listing to attach rent or sale terms to this property."
          }
        >
          {listing ? (
            <div className="space-y-5">
              <ListingStatusControls
                listing={listing}
                onAction={(action) => statusMutation.mutate(action)}
                pendingAction={pendingStatusAction}
                disabled={statusMutation.isPending || saveListingMutation.isPending}
              />

              <div className="space-y-4">
                <div className="space-y-2">
                  <FieldLabel>Listing title</FieldLabel>
                  <Input
                    value={editState.title}
                    disabled={listingLocked}
                    onChange={(event) => setEditState((current) => ({ ...current, title: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Headline</FieldLabel>
                  <Input
                    value={editState.headline}
                    disabled={listingLocked}
                    onChange={(event) => setEditState((current) => ({ ...current, headline: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    rows={6}
                    value={editState.description}
                    disabled={listingLocked}
                    onChange={(event) => setEditState((current) => ({ ...current, description: event.target.value }))}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>Asking price</FieldLabel>
                    <div className="relative">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground tabular-nums"
                      >
                        ₦
                      </span>
                      <Input
                        inputMode="numeric"
                        className="pl-7 tabular-nums"
                        value={editState.askingPrice}
                        disabled={listingLocked}
                        onChange={(event) =>
                          setEditState((current) => ({
                            ...current,
                            askingPrice: formatGroupedIntegerInput(event.target.value),
                          }))
                        }
                        placeholder="8,500,000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Handover date</FieldLabel>
                    <Input
                      type="date"
                      value={editState.handoverDate}
                      disabled={listingLocked}
                      onChange={(event) => setEditState((current) => ({ ...current, handoverDate: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => saveListingMutation.mutate()}
                    disabled={listingLocked || saveListingMutation.isPending || statusMutation.isPending}
                  >
                    {saveListingMutation.isPending ? "Saving..." : "Save offer details"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => detailQuery.refetch()}>
                    Refresh from server
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyPanel
              title="No listing on this property yet"
              body="Add a listing to set price, rent or sale type, and visibility. The property record stays; each new offer is a new listing row."
              ctaLabel="Create listing"
              ctaHref={`/owner/properties/new?propertyId=${propertyId}`}
            />
          )}
        </SectionCard>
      </div>

      {data.listingHistory.length > 0 ? (
        <ListingHistoryPanel propertyId={propertyId} history={data.listingHistory} />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard title="Property verification" description="Documents tied to the property, not a single listing offer.">
          <div className="space-y-4">
            <div className="border border-border bg-secondary/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                Current status: {data.propertyVerification?.status ?? "Not submitted"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.propertyVerification?.decidedAt
                  ? `Decision recorded ${formatDateTime(data.propertyVerification.decidedAt)}.`
                  : "Upload ownership documents to verify this property for applicants."}
              </p>
            </div>
            <div className="space-y-2">
              <FieldLabel>Resubmit property documents</FieldLabel>
              <Input type="file" multiple onChange={(event) => setVerificationFiles(Array.from(event.target.files ?? []))} />
            </div>
            <Button
              onClick={() => verificationMutation.mutate()}
              disabled={verificationMutation.isPending || verificationFiles.length === 0}
            >
              {verificationMutation.isPending ? "Submitting..." : "Submit documents"}
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Agent on this listing"
          description="One pending invite and one active agent at a time — withdraw or revoke before switching."
        >
          {listing ? (
            <OwnerListingAgentPanel
              listingId={listing.id}
              listingTitle={listing.title ?? `Listing #${listing.id}`}
              listingLocation={data.property.address}
              propertyHref={`/owner/properties/${propertyId}`}
              assignments={data.assignments}
              onChanged={async () => {
                await invalidatePropertyQueries();
                await queryClient.invalidateQueries({ queryKey: ["owner-assignments"] });
              }}
            />
          ) : (
            <EmptyPanel
              title="Create a listing before assigning an agent"
              body="Agent invitations attach to a listing offer, not the bare property row."
              ctaLabel="Create listing"
              ctaHref={`/owner/properties/new?propertyId=${propertyId}`}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
