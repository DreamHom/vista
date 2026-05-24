"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileUp,
  ImagePlus,
  MapPin,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  changeMyPassword,
  getNotificationHref,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  respondToOffer,
  updateMyProfileBasics,
} from "@/lib/applicant-dashboard";
import {
  counterOwnerOffer,
  createInspectionSlot,
  createOwnerListing,
  createOwnerProperty,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_OWNER_PROFILE_DRAFT,
  DEFAULT_PROPERTY_DRAFT,
  getOwnerDashboardOverview,
  getOwnerProfileData,
  getOwnerPropertyManagement,
  inviteAgentToListing,
  listOwnerAssignments,
  listOwnerComments,
  listOwnerInspectionItems,
  listOwnerLeads,
  listOwnerListings,
  listOwnerOffers,
  listOwnerProperties,
  readInspectionNotes,
  readOwnerNotificationPreferences,
  readOwnerProfileDraft,
  readOwnerPropertyDraft,
  removeListingComment,
  replyToListingComment,
  revokeAgentAssignment,
  saveInspectionNote,
  saveInspectionStatus,
  saveOwnerNotificationPreferences,
  saveOwnerProfileDraft,
  saveOwnerPropertyDraft,
  searchAssignableAgents,
  submitOwnerIdentityVerification,
  submitPropertyDocumentsVerification,
  toggleLeadShortlist,
  updateOwnerListing,
  uploadOwnerListingPhoto,
  type AgentListingResponse,
  type CommentResponse,
  type OwnerManagedProperty,
  type OwnerProfileDraft,
  type OwnerPropertyFormDraft,
} from "@/lib/owner-dashboard";
import { useAuth } from "@/lib/use-auth";
import { nextStatusForOwnerAction } from "@/lib/listing-lifecycle";
import { isListingStaleConflict, ownerListingErrorMessage } from "@/lib/owner-listing-errors";
import { formatNaira } from "@/lib/format";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  SectionCard,
  SettingsToggle,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import {
  firstName,
  formatDate,
  formatDateTime,
  getGreeting,
  offerStatusLabel,
  offerStatusVariant,
} from "@/components/dashboard/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { OwnerPropertyCard } from "./owner-page-primitives";

export function OwnerPropertiesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const propertiesQuery = useQuery({
    queryKey: ["owner-properties", user?.id],
    queryFn: () => listOwnerProperties(100),
    enabled: !!user?.id,
  });

  const toggleListingMutation = useMutation({
    mutationFn: async (item: OwnerManagedProperty) => {
      if (!item.listing) return;
      const action = item.listing.status === "PAUSED" ? "resume" : "pause";
      const nextStatus = nextStatusForOwnerAction(item.listing.status, action);
      if (!nextStatus) return;
      await updateOwnerListing(item.listing.id, {
        status: nextStatus,
        version: item.listing.version,
      });
    },
    onSuccess: () => {
      toast.success("Listing availability updated.");
      void queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    },
    onError: (error, item) => {
      toast.error(ownerListingErrorMessage(error, "We couldn't update that listing right now."));
      if (isListingStaleConflict(error)) {
        void queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      }
    },
  });

  if (propertiesQuery.isLoading) return <LoadingPanel label="Loading your properties..." />;
  if (propertiesQuery.error) {
    return <ErrorPanel body="We couldn't load your properties from Haven." onRetry={() => propertiesQuery.refetch()} />;
  }

  const items = propertiesQuery.data!.items;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Property portfolio"
        title="My Properties"
        description="Each card is a property (the address). The badge shows this property's current listing offer when one exists."
        actions={
          <Link href="/owner/properties/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden />
              Add New Property
            </Button>
          </Link>
        }
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <OwnerPropertyCard
              key={item.property.id}
              item={item}
              onPause={
                item.listing
                  ? () => toggleListingMutation.mutate(item)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="You haven't added any properties yet"
          body="Start with the basic property record, then publish a listing, upload photos, and submit the documents that strengthen trust."
          ctaLabel="Add your first property"
          ctaHref="/owner/properties/new"
        />
      )}
    </div>
  );
}

