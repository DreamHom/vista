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

import { PrototypeNotice, OwnerPropertyCard } from "./owner-page-primitives";

export function OwnerDashboardHome() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["owner-dashboard", user?.id],
    queryFn: () => getOwnerDashboardOverview(user!.id),
    enabled: !!user?.id,
  });

  if (query.isLoading) return <LoadingPanel label="Loading your owner workspace..." />;
  if (query.error) {
    return (
      <ErrorPanel
        body="We couldn't load your owner dashboard from Haven just yet."
        onRetry={() => query.refetch()}
      />
    );
  }

  const data = query.data!;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Owner control centre"
        title={`${getGreeting()}, ${firstName(user?.fullName)}`}
        description="Track every property, every incoming lead, and every trust signal from one calm owner workspace."
        actions={
          <>
            <Link href="/owner/properties/new">
              <Button>
                <Plus className="h-4 w-4" aria-hidden />
                Add property
              </Button>
            </Link>
            <Link href="/owner/verification">
              <Button variant="outline">Review verification</Button>
            </Link>
          </>
        }
      />

      {data.showVerificationBanner ? (
        <PrototypeNotice
          title="Complete owner verification to unlock stronger trust signals."
          body="Identity verification helps applicants and agents take your listings seriously. Submit your documents and keep every property moving with less friction."
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Properties" value={String(data.totalProperties)} hint="Registered under your account." />
        <MetricCard label="Active Listings" value={String(data.activeListings)} hint="Live listings currently visible." tone="accent" />
        <MetricCard label="Pending Inspection Requests" value={String(data.pendingInspectionRequests)} hint="Notification-backed requests awaiting attention." />
        <MetricCard label="New Offers" value={String(data.newOffers)} hint="Open offers that still need your response." />
        <MetricCard label="Unread Notifications" value={String(data.unreadNotifications)} hint="Fresh platform updates since your last check." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SectionCard
          title="Properties overview"
          description="Your latest registered properties and their current listing posture."
          action={
            <Link href="/owner/properties">
              <Button variant="outline">See all properties</Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {data.propertiesOverview.length > 0 ? (
              data.propertiesOverview.map((item) => <OwnerPropertyCard key={item.property.id} item={item} />)
            ) : (
              <EmptyPanel
                title="No properties registered yet"
                body="Create your first property to start publishing listings, inviting agents, and collecting serious demand."
                ctaLabel="Add a property"
                ctaHref="/owner/properties/new"
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="The latest platform events across your listings."
        >
          <div className="space-y-4">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/70 bg-secondary/40 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <StatusBadge label={formatDateTime(item.occurredAt)} variant="outline" />
                </div>
                <div className="mt-3">
                  <Link href={item.href} className="text-sm font-medium text-primary hover:underline">
                    Open detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

