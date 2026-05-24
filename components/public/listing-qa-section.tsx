"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { deleteComment, flagListingComment, postListingComment } from "@/lib/engagement";
import { engagementErrorMessage } from "@/lib/engagement-lifecycle";
import { invalidatePublicListingCache, type ListingComment } from "@/lib/seed/public-data";
import { useAuth } from "@/lib/use-auth";

export function ListingQaSection({
  listingId,
  ownerId,
  agentId,
  comments: initialComments,
}: {
  listingId: string;
  ownerId: string;
  agentId: string | null;
  comments: ListingComment[];
}) {
  const router = useRouter();
  const { hydrated, isAuthenticated, user } = useAuth();
  const [draft, setDraft] = useState("");
  const numericListingId = Number(listingId);

  const refresh = () => {
    invalidatePublicListingCache(listingId);
    router.refresh();
  };

  const postMutation = useMutation({
    mutationFn: (body: string) => postListingComment(numericListingId, body),
    onSuccess: () => {
      setDraft("");
      toast.success("Question posted on the listing.");
      refresh();
    },
    onError: (error) => toast.error(engagementErrorMessage(error, "We couldn't post your question.")),
  });

  const flagMutation = useMutation({
    mutationFn: ({ commentId, reason }: { commentId: number; reason?: string }) =>
      flagListingComment(numericListingId, commentId, reason),
    onSuccess: () => toast.success("Thanks — our team will review this comment."),
    onError: (error) => toast.error(engagementErrorMessage(error, "We couldn't flag that comment.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      toast.success("Comment removed.");
      refresh();
    },
    onError: (error) => toast.error(engagementErrorMessage(error, "We couldn't remove that comment.")),
  });

  const showComposer = hydrated && isAuthenticated && user;

  return (
    <section className="border border-border bg-card p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Public Q&amp;A</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions and answers appear in order — replies are separate posts, not nested threads.
          </p>
        </div>
        {!showComposer ? (
          <Link href={`/signup?next=/listings/${listingId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Sign up to ask
          </Link>
        ) : null}
      </div>

      {showComposer ? (
        <form
          className="mt-5 space-y-3 border border-border bg-secondary/20 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const body = draft.trim();
            if (!body) return;
            postMutation.mutate(body);
          }}
        >
          <label className="block text-sm font-medium text-foreground" htmlFor={`listing-qa-${listingId}`}>
            Ask a question
          </label>
          <Textarea
            id={`listing-qa-${listingId}`}
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Is it pet-friendly? What's included in the service charge?"
            maxLength={4000}
          />
          <Button type="submit" disabled={postMutation.isPending || !draft.trim()}>
            {postMutation.isPending ? "Posting…" : "Post question"}
          </Button>
        </form>
      ) : null}

      <div className="mt-5 space-y-4">
        {initialComments.length ? (
          initialComments.map((comment) => {
            const commentId = Number(comment.id);
            const isAuthor = user?.id != null && comment.authorUserId === user.id;
            const isListingOwner = user?.id != null && String(user.id) === ownerId;
            const isAssignedAgent = user?.id != null && agentId != null && String(user.id) === agentId;
            const canModerate =
              user?.id != null &&
              (isAuthor || isListingOwner || isAssignedAgent || user.role === "ADMIN");

            const menuItems = [];
            if (showComposer && !isAuthor) {
              menuItems.push({
                id: "flag",
                label: "Flag for moderation",
                description: "Report spam or abuse. Duplicate flags are ignored.",
                onSelect: () => flagMutation.mutate({ commentId }),
              });
            }
            if (canModerate) {
              menuItems.push({
                id: "delete",
                label: "Remove comment",
                description: "Soft-deletes from public view; kept for audit.",
                destructive: true,
                onSelect: () => deleteMutation.mutate(commentId),
              });
            }

            return (
              <article key={comment.id} className="border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{comment.authorName}</p>
                    <Badge variant="outline">{comment.authorRole}</Badge>
                    <span className="text-sm text-muted-foreground">{comment.date}</span>
                  </div>
                  {menuItems.length > 0 ? (
                    <InspectionMoreMenu
                      menuLabel="Comment actions"
                      triggerLabel="Comment actions"
                      disabled={flagMutation.isPending || deleteMutation.isPending}
                      items={menuItems}
                    />
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{comment.body}</p>
              </article>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No public questions yet on this listing.</p>
        )}
      </div>
    </section>
  );
}
