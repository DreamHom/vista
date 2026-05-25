"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { FlagCommentDialog } from "@/components/public/flag-comment-dialog";
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
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [flagTargetId, setFlagTargetId] = useState<number | null>(null);
  const [flaggedSession, setFlaggedSession] = useState<Set<number>>(() => new Set());
  const numericListingId = Number(listingId);

  const refresh = () => {
    invalidatePublicListingCache(listingId);
    router.refresh();
  };

  const postMutation = useMutation({
    mutationFn: ({ body, parentCommentId }: { body: string; parentCommentId?: number }) =>
      postListingComment(numericListingId, body, parentCommentId),
    onSuccess: (_data, variables) => {
      if (variables.parentCommentId != null) {
        setReplyDrafts((state) => {
          const next = { ...state };
          delete next[String(variables.parentCommentId)];
          return next;
        });
        toast.success("Reply posted.");
      } else {
        setDraft("");
        toast.success("Question posted on the listing.");
      }
      refresh();
    },
    onError: (error) => toast.error(engagementErrorMessage(error, "We couldn't post your comment.")),
  });

  const flagMutation = useMutation({
    mutationFn: ({ commentId, reason }: { commentId: number; reason?: string }) =>
      flagListingComment(numericListingId, commentId, reason),
    onSuccess: (_data, variables) => {
      setFlaggedSession((current) => new Set(current).add(variables.commentId));
      setFlagTargetId(null);
      toast.success("Reported. We'll review this comment.");
    },
    onError: (error) => {
      const message = engagementErrorMessage(error, "We couldn't flag that comment.");
      if (message.toLowerCase().includes("409") || message.toLowerCase().includes("already")) {
        toast.message("You've already flagged this comment. We're reviewing it.");
      } else {
        toast.error(message);
      }
    },
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
  const canReply = useMemo(
    () =>
      user?.id != null &&
      (String(user.id) === ownerId || (agentId != null && String(user.id) === agentId) || user.role === "ADMIN"),
    [user, ownerId, agentId],
  );

  function renderCommentRow(comment: ListingComment, depth = 0) {
    const commentId = Number(comment.id);
    const isAuthor = user?.id != null && comment.authorUserId === user.id;
    const isListingOwner = user?.id != null && String(user.id) === ownerId;
    const isAssignedAgent = user?.id != null && agentId != null && String(user.id) === agentId;
    const canModerate =
      user?.id != null &&
      (isAuthor || isListingOwner || isAssignedAgent || user.role === "ADMIN");
    const alreadyFlagged = flaggedSession.has(commentId);

    const menuItems = [];
    if (showComposer && !isAuthor) {
      menuItems.push({
        id: "flag",
        label: alreadyFlagged ? "Already flagged" : "Flag this comment",
        description: "Report spam or abuse. Duplicate flags are ignored.",
        onSelect: () => {
          if (!alreadyFlagged) setFlagTargetId(commentId);
        },
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

    const replyDraft = replyDrafts[comment.id] ?? "";

    return (
      <article
        key={comment.id}
        className={depth > 0 ? "ml-4 border-l border-border pl-4 md:ml-6 md:pl-5" : "border border-border p-4"}
      >
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
              disabled={flagMutation.isPending || deleteMutation.isPending || alreadyFlagged}
              items={menuItems}
            />
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{comment.body}</p>

        {comment.replies.map((reply) => (
          <div key={reply.id} className="mt-4 ml-4 border-l border-border pl-4 md:ml-6 md:pl-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{reply.authorName}</p>
              <Badge variant="outline">{reply.authorRole}</Badge>
              <span className="text-sm text-muted-foreground">{reply.date}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reply.body}</p>
          </div>
        ))}

        {canReply && depth === 0 ? (
          <form
            className="mt-4 space-y-2 border border-border bg-secondary/15 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              const body = replyDraft.trim();
              if (!body) return;
              postMutation.mutate({ body, parentCommentId: commentId });
            }}
          >
            <label className="text-sm font-medium text-foreground" htmlFor={`reply-${comment.id}`}>
              Reply to this question
            </label>
            <Textarea
              id={`reply-${comment.id}`}
              rows={2}
              value={replyDraft}
              onChange={(event) =>
                setReplyDrafts((state) => ({ ...state, [comment.id]: event.target.value }))
              }
              placeholder="Answer the applicant directly."
              maxLength={4000}
            />
            <Button type="submit" size="sm" disabled={postMutation.isPending || !replyDraft.trim()}>
              {postMutation.isPending ? "Posting…" : "Post reply"}
            </Button>
          </form>
        ) : null}
      </article>
    );
  }

  return (
    <section className="border border-border bg-card p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Public Q&amp;A</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions stay on the listing. Owners and agents reply in-thread so each thread stays readable.
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
            postMutation.mutate({ body });
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
          initialComments.map((comment) => renderCommentRow(comment))
        ) : (
          <p className="text-sm text-muted-foreground">No public questions yet on this listing.</p>
        )}
      </div>

      <FlagCommentDialog
        open={flagTargetId != null}
        onOpenChange={(open) => {
          if (!open) setFlagTargetId(null);
        }}
        pending={flagMutation.isPending}
        onSubmit={(reason) => {
          if (flagTargetId != null) flagMutation.mutate({ commentId: flagTargetId, reason });
        }}
      />
    </section>
  );
}
