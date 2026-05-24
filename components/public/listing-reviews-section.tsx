"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { RatingRow } from "@/components/public/public-components";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { listOffers } from "@/lib/applicant-dashboard";
import { deleteReview, postListingReview } from "@/lib/engagement";
import { engagementErrorMessage, evaluateReviewEligibility } from "@/lib/engagement-lifecycle";
import { fetchHavenListing } from "@/lib/haven-listing";
import { invalidatePublicListingCache, type PublicReview } from "@/lib/seed/public-data";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            onClick={() => onChange(star)}
            className={cn(
              "border border-border p-2 transition-colors",
              selected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:border-primary/40",
            )}
          >
            <Star className={cn("h-4 w-4", selected && "fill-current")} aria-hidden />
            <span className="sr-only">{star} star{star === 1 ? "" : "s"}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ListingReviewsSection({
  listingId,
  ownerId,
  agentId,
  reviews: initialReviews,
}: {
  listingId: string;
  ownerId: string;
  agentId: string | null;
  reviews: PublicReview[];
}) {
  const router = useRouter();
  const { hydrated, isAuthenticated, user } = useAuth();
  const numericListingId = Number(listingId);
  const numericOwnerId = Number(ownerId);
  const numericAgentId = agentId ? Number(agentId) : null;

  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [revieweeUserId, setRevieweeUserId] = useState<number | null>(null);

  const listingQuery = useQuery({
    queryKey: ["listing-review-eligibility", listingId, user?.id],
    queryFn: () => fetchHavenListing(listingId),
    enabled: hydrated && isAuthenticated && Boolean(user?.id),
    staleTime: 30_000,
  });

  const offersQuery = useQuery({
    queryKey: ["applicant-offers-review", user?.id],
    queryFn: () => listOffers(80),
    enabled: hydrated && isAuthenticated && user?.role === "APPLICANT",
    staleTime: 60_000,
  });

  const eligibility = useMemo(() => {
    if (!user || !listingQuery.data) return null;
    return evaluateReviewEligibility({
      listingId: numericListingId,
      listingStatus: listingQuery.data.status,
      viewerUserId: user.id,
      viewerRole: user.role,
      ownerId: numericOwnerId,
      agentId: numericAgentId,
      offers: offersQuery.data?.items.map((row) => row.offer) ?? [],
      existingReviews: initialReviews,
    });
  }, [
    user,
    listingQuery.data,
    offersQuery.data?.items,
    initialReviews,
    numericListingId,
    numericOwnerId,
    numericAgentId,
  ]);

  const reviewees = eligibility?.kind === "can_post" ? eligibility.reviewees : [];
  const activeReviewee = revieweeUserId ?? reviewees[0]?.userId ?? null;

  const refresh = () => {
    invalidatePublicListingCache(listingId);
    router.refresh();
  };

  const postMutation = useMutation({
    mutationFn: () => {
      if (activeReviewee == null) throw new Error("Choose who you are reviewing.");
      return postListingReview(numericListingId, {
        revieweeUserId: activeReviewee,
        rating,
        body: body.trim(),
      });
    },
    onSuccess: () => {
      setBody("");
      toast.success("Review posted. Their profile rating updates on the next load.");
      refresh();
    },
    onError: (error) => toast.error(engagementErrorMessage(error, "We couldn't post your review.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review removed. Star averages exclude soft-deleted rows.");
      refresh();
    },
    onError: (error) => toast.error(engagementErrorMessage(error, "We couldn't remove that review.")),
  });

  const showForm = hydrated && isAuthenticated && eligibility?.kind === "can_post";

  return (
    <section id="reviews" className="scroll-mt-24 border border-border bg-card p-6 md:p-7">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Reviews from closed deals</h2>
        <p className="text-sm text-muted-foreground">
          Star ratings on owner and agent profiles come from accepted offers on closed listings. Removed reviews stay
          in the audit log but drop out of averages immediately.
        </p>
      </div>

      {showForm ? (
        <form
          className="mt-5 space-y-4 border border-border bg-secondary/20 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            postMutation.mutate();
          }}
        >
          <p className="text-sm font-medium text-foreground">Leave your review</p>
          {reviewees.length > 1 ? (
            <fieldset className="space-y-2">
              <legend className="text-sm text-muted-foreground">Who are you reviewing?</legend>
              <div className="flex flex-wrap gap-2">
                {reviewees.map((option) => (
                  <button
                    key={option.userId}
                    type="button"
                    onClick={() => setRevieweeUserId(option.userId)}
                    className={cn(
                      "border px-4 py-2 text-sm font-medium",
                      activeReviewee === option.userId
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : reviewees[0] ? (
            <p className="text-sm text-muted-foreground">Reviewing: {reviewees[0].label}</p>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Rating</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`review-body-${listingId}`}>
              Your experience
            </label>
            <Textarea
              id={`review-body-${listingId}`}
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="What went well? What should the next buyer know?"
              maxLength={2000}
            />
          </div>

          <Button type="submit" disabled={postMutation.isPending}>
            {postMutation.isPending ? "Posting…" : "Post review"}
          </Button>
        </form>
      ) : hydrated && isAuthenticated && eligibility?.kind === "blocked" ? (
        <p className="mt-5 border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
          {eligibility.message}{" "}
          <Link href="/dashboard/offers" className="font-medium text-primary hover:text-primary/80">
            View your offers
          </Link>
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        {initialReviews.length ? (
          initialReviews.map((review) => {
            const isAuthor = user?.id != null && review.reviewerUserId === user.id;
            return (
              <article key={review.id} className="border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{review.reviewerName}</p>
                    <p className="text-sm text-muted-foreground">{review.reviewerRole}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingRow rating={review.rating} reviewCount={1} />
                    {isAuthor ? (
                      <InspectionMoreMenu
                        menuLabel="Your review"
                        triggerLabel="Review actions"
                        disabled={deleteMutation.isPending}
                        items={[
                          {
                            id: "delete",
                            label: "Remove your review",
                            description: "Soft-delete — their star average updates on next profile load.",
                            destructive: true,
                            onSelect: () => deleteMutation.mutate(Number(review.id)),
                          },
                        ]}
                      />
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                <p className="mt-2 text-xs uppercase tracking-eyebrow text-muted-foreground">{review.date}</p>
              </article>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No public reviews are attached to this listing yet.</p>
        )}
      </div>
    </section>
  );
}
