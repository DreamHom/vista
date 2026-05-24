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

import { FieldLabel, NativeSelect } from "./owner-page-primitives";

export function OwnerCommentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [listingFilter, setListingFilter] = useState("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const commentsQuery = useQuery({
    queryKey: ["owner-comments", user?.id],
    queryFn: () => listOwnerComments(user!.id),
    enabled: !!user?.id,
  });

  const replyMutation = useMutation({
    mutationFn: ({ listingId, body }: { listingId: number; body: string; commentId: number }) =>
      replyToListingComment(listingId, body),
    onSuccess: async (_, variables) => {
      setReplyDrafts((state) => ({ ...state, [variables.commentId]: "" }));
      toast.success("Answer posted on the listing.");
      await queryClient.invalidateQueries({ queryKey: ["owner-comments", user?.id] });
    },
    onError: () => toast.error("We couldn't post that reply."),
  });

  const deleteMutation = useMutation({
    mutationFn: (comment: CommentResponse) => removeListingComment(comment.id),
    onSuccess: async () => {
      toast.success("Comment deleted.");
      await queryClient.invalidateQueries({ queryKey: ["owner-comments", user?.id] });
    },
    onError: () => toast.error("We couldn't delete that comment."),
  });

  if (commentsQuery.isLoading) return <LoadingPanel label="Loading listing comments..." />;
  if (commentsQuery.error) {
    return <ErrorPanel body="We couldn't load owner comments from Haven." onRetry={() => commentsQuery.refetch()} />;
  }

  const items = commentsQuery.data!;
  const filtered = items.filter((item) => listingFilter === "all" || String(item.comment.listingId) === listingFilter);
  const listingOptions = [...new Set(items.map((item) => String(item.comment.listingId)))];

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Public Q&A"
        title="Comments"
        description="Answer each question with a new public post on that listing. Q&A is flat — not threaded replies."
      />

      <div className="max-w-xs space-y-2">
        <FieldLabel>Filter by listing</FieldLabel>
        <NativeSelect value={listingFilter} onChange={(event) => setListingFilter(event.target.value)}>
          <option value="all">All listings</option>
          {listingOptions.map((value) => (
            <option key={value} value={value}>
              Listing #{value}
            </option>
          ))}
        </NativeSelect>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.comment.id} className="border-border/70 shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.authorName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.listing?.title ?? `Listing #${item.comment.listingId}`} · {formatDateTime(item.comment.createdAt)}
                    </p>
                  </div>
                  <StatusBadge label={item.listing?.property.address ?? "Public listing"} variant="outline" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item.comment.body}</p>
                <Textarea
                  rows={3}
                  value={replyDrafts[item.comment.id] ?? ""}
                  onChange={(event) =>
                    setReplyDrafts((state) => ({ ...state, [item.comment.id]: event.target.value }))
                  }
                  placeholder="Post a public answer on the listing page"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      replyMutation.mutate({
                        listingId: item.comment.listingId,
                        commentId: item.comment.id,
                        body: replyDrafts[item.comment.id] ?? "",
                      })
                    }
                    disabled={replyMutation.isPending || !(replyDrafts[item.comment.id] ?? "").trim()}
                  >
                    Post answer
                  </Button>
                  <Button variant="outline" onClick={() => deleteMutation.mutate(item.comment)} disabled={deleteMutation.isPending}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No comments in this view"
          body="Questions from applicants will show up here so you can answer them without jumping between listing pages."
          ctaLabel="Open properties"
          ctaHref="/owner/properties"
        />
      )}
    </div>
  );
}

