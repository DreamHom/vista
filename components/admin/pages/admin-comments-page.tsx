"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteComment,
  dismissAdminCommentFlag,
  listAdminModerationComments,
  resolveAdminCommentFlag,
} from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel, StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
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
import { toast } from "@/components/ui/toast";

export function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const [listingFilter, setListingFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const query = useQuery({
    queryKey: ["admin-comments"],
    queryFn: listAdminModerationComments,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ commentId, flagId }: { commentId: string; flagId: number }) => {
      await deleteComment(commentId);
      await resolveAdminCommentFlag(flagId).catch(() => undefined);
    },
    onSuccess: async () => {
      toast.success("Comment removed and flag resolved.");
      await queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: () => toast.error("We couldn't remove that comment."),
  });

  const dismissMutation = useMutation({
    mutationFn: dismissAdminCommentFlag,
    onSuccess: async () => {
      toast.success("Flag dismissed.");
      await queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: () => toast.error("We couldn't dismiss that flag."),
  });

  const resolveMutation = useMutation({
    mutationFn: resolveAdminCommentFlag,
    onSuccess: async () => {
      toast.success("Flag resolved.");
      await queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: () => toast.error("We couldn't resolve that flag."),
  });

  if (query.isLoading) return <LoadingPanel label="Loading comment moderation queue..." />;
  if (query.isError || !query.data) {
    return <ErrorPanel body="We couldn’t load flagged comments right now." onRetry={() => void query.refetch()} />;
  }

  const items = query.data.filter((item) => {
    const listingMatch = listingFilter ? item.listingTitle.toLowerCase().includes(listingFilter.toLowerCase()) : true;
    const dateMatch = dateFilter ? item.flaggedAt.startsWith(dateFilter) : true;
    return listingMatch && dateMatch;
  });

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Comments moderation"
        description="Review user-flagged listing comments from the Haven moderation queue."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <Input value={listingFilter} onChange={(event) => setListingFilter(event.target.value)} placeholder="Filter by listing" />
        <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
      </div>

      {items.length === 0 ? (
        <EmptyPanel title="No flagged comments in this filter" body="Try another listing or date filter to inspect a different moderation slice." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.key} className="border-border shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.listingTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.listingAddress ? `${item.listingAddress} · ` : null}
                      {item.author} • {formatDateTime(item.flaggedAt)}
                    </p>
                  </div>
                  <StatusBadge label={item.flagReason} variant="warning" />
                </div>
                <p className="text-sm leading-7 text-foreground">{item.body}</p>
                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Remove comment</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove this comment?</DialogTitle>
                        <DialogDescription>This soft-deletes the comment and removes it from public reads.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate({ commentId: item.commentId, flagId: item.flagId })}
                          >
                            Confirm removal
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    disabled={resolveMutation.isPending}
                    onClick={() => resolveMutation.mutate(item.flagId)}
                  >
                    Resolve flag
                  </Button>
                  <Button
                    variant="outline"
                    disabled={dismissMutation.isPending}
                    onClick={() => dismissMutation.mutate(item.flagId)}
                  >
                    Dismiss flag
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
