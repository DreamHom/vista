"use client";

import { useActionState, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import { formatRelativeTime } from "@/lib/utils";
import type { ReviewResponse } from "@/lib/api/types";
import type { ActionState } from "@/lib/actions/listings";
import { deleteReviewAction, postReviewAction } from "@/lib/actions/reviews";

interface Props {
  listingId: string;
  reviews: ReviewResponse[];
  currentUserId?: string;
  canPost: boolean;
}

export function ReviewsSection({
  listingId,
  reviews,
  currentUserId,
  canPost,
}: Props) {
  const [optimistic, setOptimistic] = useState(reviews);
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    postReviewAction.bind(null, listingId),
    undefined,
  );

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-fg">
          Reviews ({optimistic.length})
        </h2>
        <Badge tone="muted">Post-deal trust signals</Badge>
      </div>

      <div className="mt-6 space-y-4">
        {optimistic.length === 0 ? (
          <p className="text-sm text-fg-muted">
            No reviews yet. Completed deals turn into proof here.
          </p>
        ) : null}
        {optimistic.map((review) => {
          const canDelete = currentUserId === review.authorId;
          return (
            <div
              key={review.id}
              className="rounded-2xl border border-border bg-bg-elevated p-5"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  name={review.authorName}
                  src={review.authorAvatarUrl}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <p className="font-medium text-fg">{review.authorName}</p>
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Icon.Star size={12} />
                      {review.rating}
                    </span>
                    <span className="text-fg-subtle">·</span>
                    <span className="text-xs text-fg-subtle">
                      {formatRelativeTime(review.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-fg">{review.body}</p>
                </div>
                {canDelete ? (
                  <button
                    type="button"
                    aria-label="Delete review"
                    className="text-fg-subtle hover:text-danger"
                    onClick={async () => {
                      setOptimistic((prev) => prev.filter((x) => x.id !== review.id));
                      const result = await deleteReviewAction(listingId, review.id);
                      if (!result.ok) {
                        setOptimistic(reviews);
                      }
                    }}
                  >
                    <Icon.Trash size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {canPost ? (
        <form
          action={formAction}
          className="mt-6 rounded-2xl border border-dashed border-border bg-bg-elevated/60 p-5"
        >
          {state?.ok === false ? (
            <p role="alert" className="mb-3 text-sm text-danger">
              {state.error}
            </p>
          ) : null}
          {state?.ok === true ? (
            <p role="status" className="mb-3 text-sm text-success">
              {state.message ?? "Review submitted."}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
            <Field label="Rating">
              <Select name="rating" defaultValue="5" required>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Bad</option>
              </Select>
            </Field>
            <Field
              label="Your review"
              hint="The backend will only accept this if you completed a qualified deal on this listing."
            >
              <Textarea
                name="body"
                rows={4}
                placeholder="What was the process like? Be fair, specific, and useful."
                required
              />
            </Field>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-fg-subtle">
              Reviews are tied to accepted deals and help the next person trust the process.
            </p>
            <Button
              type="submit"
              size="md"
              disabled={pending}
              trailingIcon={<Icon.ArrowRight size={14} />}
            >
              {pending ? "Submitting…" : "Leave review"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-bg-elevated/60 p-5">
          <p className="text-sm text-fg-muted">
            Reviews are available after a completed deal. Sign in to see whether you are eligible
            to leave one.
          </p>
          <div className="mt-3">
            <ButtonLink href="/login" variant="outline" size="sm">
              Sign in
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
