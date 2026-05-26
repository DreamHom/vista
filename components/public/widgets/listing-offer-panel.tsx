"use client";

/**
 * Inline "Make an offer" surface on `/listings/[id]`.
 *
 * Mirrors the listing-slot-picker affordance: applicants see the form,
 * owners/agents see a muted role note, guests see a sign-in CTA. No modal —
 * the form expands inline below the listing meta block. Submission goes to
 * Haven's `POST /offers` (see lib/applicant-dashboard.ts:submitOffer); the
 * SSE notifications stream invalidates the applicant-offers query when the
 * owner counters or accepts, so the user can stay on the listing page and
 * still see status updates flow into /dashboard/offers.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, HandCoins } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import { submitOffer } from "@/lib/applicant-dashboard";
import {
  formatGroupedIntegerInput,
  formatNaira,
  parseGroupedNumberInput,
} from "@/lib/format";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

const MESSAGE_MAX_LENGTH = 5000;

interface ListingOfferPanelProps {
  listingId: string;
  listingTitle: string;
  listingStatus: "LIVE" | "PAUSED" | "CLOSED" | "TAKEN_DOWN";
  askingPriceNgn: number;
  term: "RENT" | "SALE";
  ownerId: string;
  agentId?: string | null;
}

type ConfirmedOffer = {
  id: number;
  amount: number;
};

export function ListingOfferPanel({
  listingId,
  listingTitle,
  listingStatus,
  askingPriceNgn,
  term,
  ownerId,
  agentId,
}: ListingOfferPanelProps) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const role = hydrated && isAuthenticated ? user?.role : undefined;
  const isApplicant = role === "APPLICANT";
  const userIdString = user?.id?.toString();
  const isListingOwner = userIdString != null && userIdString === ownerId;
  const isListingAgent = userIdString != null && agentId != null && userIdString === agentId;
  const isOwnerOrAgent = role === "OWNER" || role === "AGENT" || role === "ADMIN" || isListingOwner || isListingAgent;
  const canOffer = hydrated && isApplicant && !isListingOwner && listingStatus === "LIVE";

  const [amountInput, setAmountInput] = useState("");
  const [message, setMessage] = useState("");
  const [intent, setIntent] = useState<"RENT" | "BUY" | "RENT_TO_BUY">(term === "RENT" ? "RENT" : "BUY");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [conflictOfferId, setConflictOfferId] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedOffer | null>(null);

  const numericListingId = useMemo(() => {
    const n = Number(listingId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [listingId]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!numericListingId) throw new Error("Invalid listing reference.");
      const amount = parseGroupedNumberInput(amountInput);
      if (amount == null || amount <= 0) {
        const err = new Error("Enter a valid Naira amount.");
        err.name = "LocalValidationError";
        throw err;
      }
      return submitOffer({
        listingId: numericListingId,
        amount,
        message,
        intent,
      });
    },
    onSuccess: async (offer) => {
      setConfirmed({ id: offer.id, amount: offer.amount });
      setAmountInput("");
      setMessage("");
      setAmountError(null);
      setConflictOfferId(null);
      toast.success("Offer sent. The owner has been notified.");
      await queryClient.invalidateQueries({ queryKey: ["applicant-offers", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", user?.id] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.name === "LocalValidationError") {
        setAmountError(error.message);
        return;
      }
      if (error instanceof ApiError) {
        // 401 is handled globally by SessionExpiredListener (lib/auth-refresh).
        if (error.status === 400) {
          const detail = error.problem?.detail ?? "";
          if (/amount/i.test(detail) || /price/i.test(detail)) {
            setAmountError(apiErrorMessage(error, "Haven rejected that amount."));
            return;
          }
          toast.error(apiErrorMessage(error, "Some details on that offer didn't pass validation."));
          return;
        }
        if (error.status === 403) {
          toast.error(
            isListingOwner
              ? "You can't make an offer on your own listing."
              : "Only applicant accounts can submit offers.",
          );
          return;
        }
        if (error.status === 404) {
          toast.error("This listing is no longer available.");
          return;
        }
        if (error.status === 409) {
          // Haven returns the existing offer's ID in the problem detail when
          // it can; we surface a deep link either way.
          const existingId = extractExistingOfferId(error.problem?.detail) ?? null;
          setConflictOfferId(existingId);
          return;
        }
        if (error.status === 422) {
          toast.error(apiErrorMessage(error, "Haven couldn't accept that offer right now."));
          return;
        }
      }
      toast.error(error instanceof Error ? error.message : "We couldn't submit that offer.");
    },
  });

  function handleAmountChange(value: string) {
    setAmountInput(formatGroupedIntegerInput(value));
    if (amountError) setAmountError(null);
    if (conflictOfferId !== null) setConflictOfferId(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    submitMutation.mutate();
  }

  // ─── Render branches ────────────────────────────────────────────────

  if (listingStatus !== "LIVE") {
    return (
      <PanelShell>
        <PanelHeader>Make an offer</PanelHeader>
        <p className="text-sm text-muted-foreground">
          {listingStatusCopy(listingStatus)}
        </p>
      </PanelShell>
    );
  }

  // Owners and agents of THIS listing don't see the panel at all — they're not
  // the audience and the noise is worse than the disclosure value.
  if (isListingOwner || isListingAgent) return null;

  if (confirmed) {
    return (
      <PanelShell>
        <div className="flex items-start gap-3">
          <div className="bg-secondary p-2">
            <Check className="h-4 w-4 text-foreground" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold tracking-tight text-foreground">
              Offer of {formatNaira(confirmed.amount)} sent
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The owner of {listingTitle} has been notified. We'll update you here and in <span className="font-medium text-foreground">My offers</span> when they respond.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/dashboard/offers?offerId=${confirmed.id}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-10")}
          >
            View My offers
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10"
            onClick={() => setConfirmed(null)}
          >
            Make another adjustment
          </Button>
        </div>
      </PanelShell>
    );
  }

  if (hydrated && !isAuthenticated) {
    return (
      <PanelShell>
        <PanelHeader>Make an offer</PanelHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Asking price is {formatNaira(askingPriceNgn)}{term === "RENT" ? " / year" : ""}. Sign in as an applicant to propose your number.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-10")}
          >
            Sign in
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(`/listings/${listingId}`)}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10")}
          >
            Create account
          </Link>
        </div>
      </PanelShell>
    );
  }

  if (hydrated && isOwnerOrAgent && !isApplicant) {
    return (
      <PanelShell>
        <PanelHeader>Make an offer</PanelHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Owner and agent accounts can't submit offers. Switch to an applicant account if you want to propose a price.
        </p>
      </PanelShell>
    );
  }

  if (!canOffer) {
    // Still hydrating; render a quiet placeholder to avoid layout shift.
    return (
      <PanelShell>
        <div className="h-20 animate-pulse bg-muted/40" aria-hidden />
      </PanelShell>
    );
  }

  return (
    <PanelShell>
      <PanelHeader>Make an offer</PanelHeader>
      <p className="text-sm text-muted-foreground">
        Asking price is {formatNaira(askingPriceNgn)}{term === "RENT" ? " / year" : ""}. Propose your number, and the owner can accept, decline, or counter.
      </p>

      {conflictOfferId !== null ? (
        <div className="mt-4 border border-border bg-secondary/30 p-3 text-sm text-foreground">
          <p className="font-medium">You already have a pending offer on this listing.</p>
          <p className="mt-1 text-muted-foreground">
            One pending offer per listing at a time. Wait for the owner's response or cancel the existing one.
          </p>
          <Link
            href={conflictOfferId > 0 ? `/dashboard/offers?offerId=${conflictOfferId}` : "/dashboard/offers"}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 h-9")}
          >
            View existing offer
          </Link>
        </div>
      ) : null}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="offer-amount" className="block text-sm font-medium text-foreground">
            Your offer
          </label>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground tabular-nums"
            >
              ₦
            </span>
            <Input
              id="offer-amount"
              inputMode="numeric"
              autoComplete="off"
              className="pl-7 tabular-nums"
              value={amountInput}
              onChange={(event) => handleAmountChange(event.target.value)}
              placeholder={formatNaira(askingPriceNgn).replace("₦", "")}
              invalid={Boolean(amountError)}
              aria-describedby={amountError ? "offer-amount-error" : undefined}
              disabled={submitMutation.isPending}
            />
          </div>
          {amountError ? (
            <p id="offer-amount-error" className="text-xs text-destructive">
              {amountError}
            </p>
          ) : null}
        </div>

        {term === "RENT" ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Intent</legend>
            <p className="text-xs text-muted-foreground">
              Most rent offers stay rent. Flag rent-to-buy only if the owner has said it's on the table.
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "RENT", label: "Rent" },
                  { value: "RENT_TO_BUY", label: "Rent to buy" },
                ] as const
              ).map((option) => {
                const active = intent === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setIntent(option.value)}
                    disabled={submitMutation.isPending}
                    aria-pressed={active}
                    className={cn(
                      "border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="offer-message" className="block text-sm font-medium text-foreground">
            Note to the owner <span className="ml-1 text-xs font-normal text-muted-foreground">Optional</span>
          </label>
          <Textarea
            id="offer-message"
            rows={3}
            maxLength={MESSAGE_MAX_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="A short note can help: closing timeline, viewing notes, anything that justifies your number."
            disabled={submitMutation.isPending}
          />
          {message.length > 0 ? (
            <p className="text-right text-xs text-muted-foreground tabular-nums">
              {message.length} / {MESSAGE_MAX_LENGTH}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="submit"
            disabled={submitMutation.isPending || amountInput.trim().length === 0}
            className="h-10"
          >
            <HandCoins className="h-4 w-4" aria-hidden />
            {submitMutation.isPending ? "Sending offer…" : "Send offer"}
          </Button>
          <p className="text-xs text-muted-foreground">
            One pending offer per listing. You can cancel from My offers.
          </p>
        </div>
      </form>
    </PanelShell>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="make-offer"
      className="scroll-mt-24 border border-border bg-card p-6 md:p-7"
      aria-label="Make an offer"
    >
      {children}
    </section>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 text-xl font-semibold tracking-tight">{children}</h2>;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function listingStatusCopy(status: "LIVE" | "PAUSED" | "CLOSED" | "TAKEN_DOWN") {
  switch (status) {
    case "PAUSED":
      return "The owner has paused this listing. Offers reopen when it's live again.";
    case "CLOSED":
      return "This listing has closed. The deal is already done.";
    case "TAKEN_DOWN":
      return "This listing was taken down and isn't accepting offers.";
    default:
      return "Offers aren't open on this listing yet.";
  }
}

/**
 * Best-effort parse of haven's 409 problem detail to recover the existing
 * offer's id. Format isn't guaranteed; if we can't find a number, the user
 * still gets a deep link to the offers index.
 */
function extractExistingOfferId(detail: string | undefined): number | null {
  if (!detail) return null;
  const match = detail.match(/(?:offer\s*#?|\boffer\s+id\s*[:=]?)\s*(\d+)/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}
