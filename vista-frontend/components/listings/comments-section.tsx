"use client";

import { useActionState, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import { formatRelativeTime } from "@/lib/utils";
import type { CommentResponse } from "@/lib/api/types";
import {
  postCommentAction,
  deleteCommentAction,
} from "@/lib/actions/comments";
import type { ActionState } from "@/lib/actions/listings";

interface Props {
  listingId: string;
  comments: CommentResponse[];
  canPost: boolean;
}

export function CommentsSection({ listingId, comments, canPost }: Props) {
  const [optimistic, setOptimistic] = useState(comments);
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    postCommentAction.bind(null, listingId),
    undefined,
  );

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-fg">
          Public questions ({optimistic.length})
        </h2>
        <Badge tone="muted">
          Comments stay public · keeps everyone honest
        </Badge>
      </div>

      <div className="mt-6 space-y-4">
        {optimistic.length === 0 ? (
          <p className="text-sm text-fg-muted">
            No questions yet — be the first to ask.
          </p>
        ) : null}
        {optimistic.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-border bg-bg-elevated p-5"
          >
            <div className="flex items-start gap-3">
              <Avatar
                name={c.authorName}
                src={c.authorAvatarUrl}
                size={36}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg">
                  {c.authorName}{" "}
                  <span className="text-xs font-normal text-fg-subtle">
                    · {c.authorRole.toLowerCase()}
                  </span>
                </p>
                <p className="text-xs text-fg-subtle">
                  {formatRelativeTime(c.createdAt)}
                </p>
                <p className="mt-2 text-sm text-fg leading-relaxed">
                  {c.body}
                </p>
              </div>
              {canPost ? (
                <button
                  type="button"
                  aria-label="Delete comment"
                  onClick={async () => {
                    setOptimistic((prev) =>
                      prev.filter((x) => x.id !== c.id),
                    );
                    const result = await deleteCommentAction(c.id, listingId);
                    if (!result.ok) {
                      // Restore on failure
                      setOptimistic(comments);
                    }
                  }}
                  className="text-fg-subtle hover:text-danger"
                >
                  <Icon.Trash size={14} />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {canPost ? (
        <form
          action={formAction}
          className="mt-6 rounded-2xl border border-dashed border-border bg-bg-elevated/60 p-5"
        >
          {state?.ok === false ? (
            <p
              role="alert"
              className="mb-3 text-sm text-danger"
            >
              {state.error}
            </p>
          ) : null}
          {state?.ok === true ? (
            <p
              role="status"
              className="mb-3 text-sm text-success"
            >
              Posted. Thanks for asking — others will benefit.
            </p>
          ) : null}
          <Textarea
            name="body"
            placeholder="What would you like to know? E.g. Is the rent negotiable for a longer lease?"
            required
            rows={3}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-fg-subtle">
              Comments are public. Owners and agents can reply but not start
              threads.
            </p>
            <Button
              type="submit"
              size="md"
              disabled={pending}
              trailingIcon={<Icon.ArrowRight size={14} />}
            >
              {pending ? "Posting…" : "Post question"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-bg-elevated/60 p-5">
          <p className="text-sm text-fg-muted">
            Questions stay public so future applicants benefit. Owners and
            agents can reply — but cannot post comments themselves.
          </p>
          <div className="mt-3 flex gap-2">
            <ButtonLink href="/login" variant="outline" size="sm">
              Sign in to ask
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
