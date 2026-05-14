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

import { FieldLabel, FieldHint } from "./owner-page-primitives";

export function OwnerProfilePage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<OwnerProfileDraft>(DEFAULT_OWNER_PROFILE_DRAFT);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const profileQuery = useQuery({
    queryKey: ["owner-profile", user?.id],
    queryFn: () => getOwnerProfileData(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user) {
      setDraft(readOwnerProfileDraft(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (!profileQuery.data) return;
    setFullName(profileQuery.data.privateProfile.fullName ?? "");
    setPhone(profileQuery.data.privateProfile.phone ?? "");
  }, [profileQuery.data]);

  const saveBasicsMutation = useMutation({
    mutationFn: () => updateMyProfileBasics({ fullName, phone }),
    onSuccess: async (profile) => {
      toast.success("Profile basics updated.");
      setUser({
        id: profile.userId,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
      });
      await queryClient.invalidateQueries({ queryKey: ["owner-profile", user?.id] });
    },
    onError: () => toast.error("We couldn't update those profile fields."),
  });

  if (profileQuery.isLoading) return <LoadingPanel label="Loading your owner profile..." />;
  if (profileQuery.error) {
    return <ErrorPanel body="We couldn't load your owner profile." onRetry={() => profileQuery.refetch()} />;
  }

  const profile = profileQuery.data!;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Owner identity"
        title="Profile"
        description="Keep your public owner presence trustworthy, with clear basics and real responsiveness signals."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionCard title="Public profile preview" description="How applicants and agents experience your owner profile today.">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-secondary">
                {draft.profilePhotoDataUrl ? (
                  <img src={draft.profilePhotoDataUrl} alt={profile.publicProfile.fullName} className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-7 w-7 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{profile.publicProfile.fullName}</p>
                <p className="text-sm text-muted-foreground">DreamHomes owner</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {draft.bio || "Add a short owner bio so applicants understand your style, preferred communication rhythm, and the kind of properties you manage."}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Response rate</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{profile.responseRate}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Average response time</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {profile.averageResponseHours !== null ? `${profile.averageResponseHours}h` : "Not enough offer history yet"}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Edit owner profile" description="Live fields are saved to Haven. Bio and photo remain local prototype fields until dedicated endpoints land.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Full name</FieldLabel>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Phone</FieldLabel>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Bio</FieldLabel>
              <Textarea
                rows={4}
                value={draft.bio}
                onChange={(event) => {
                  const next = { ...draft, bio: event.target.value };
                  setDraft(next);
                  if (user) saveOwnerProfileDraft(user.id, next);
                }}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Photo</FieldLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file || !user) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const next = { ...draft, profilePhotoDataUrl: String(reader.result ?? "") };
                    setDraft(next);
                    saveOwnerProfileDraft(user.id, next);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <FieldHint>Stored locally for now. Haven does not yet expose owner avatar upload.</FieldHint>
            </div>
            <Button onClick={() => saveBasicsMutation.mutate()} disabled={saveBasicsMutation.isPending}>
              {saveBasicsMutation.isPending ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Reviews received" description="Recent feedback from completed DreamHomes relationships.">
        <div className="space-y-4">
          {profile.reviews.length > 0 ? (
            profile.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{review.reviewerName}</p>
                  <StatusBadge label={`${review.rating}/5`} variant="outline" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(review.date)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Reviews will appear here once completed deals start closing on-platform.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

