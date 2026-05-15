"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarClock, HandCoins, Sparkles } from "lucide-react";
import { CompactListingTile } from "@/components/public/public-components";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  SectionCard,
} from "@/components/dashboard/applicant-ui";
import { formatDateTime, firstName, getGreeting, formatInspectionWindow } from "@/components/dashboard/utils";
import { getApplicantDashboardOverview } from "@/lib/applicant-dashboard";
import { useAuth } from "@/lib/use-auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/format";

export function ApplicantDashboardHome() {
  const { user } = useAuth();
  const overviewQuery = useQuery({
    queryKey: ["applicant-dashboard-overview", user?.id],
    queryFn: () => getApplicantDashboardOverview(user!.id),
    enabled: Boolean(user?.id),
  });

  if (overviewQuery.isLoading) {
    return <LoadingPanel label="Loading your applicant dashboard..." />;
  }

  if (overviewQuery.isError) {
    return (
      <ErrorPanel
        body={overviewQuery.error instanceof Error ? overviewQuery.error.message : "We couldn't load your applicant dashboard right now."}
        onRetry={() => void overviewQuery.refetch()}
      />
    );
  }

  const overview = overviewQuery.data;

  if (!overview) {
    return <LoadingPanel label="Loading your applicant dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Overview"
        title={`${getGreeting()}, ${firstName(user?.fullName)}`}
        description="Track what you’ve saved, what you’ve booked, and where each negotiation currently stands."
        actions={
          <>
            <Link href="/listings" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Browse listings
            </Link>
            <Link href="/dream-ai" className={buttonVariants({ size: "lg" })}>
              Continue with Dream AI
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Saved Listings" value={String(overview.savedCount)} hint="Homes you’ve kept an eye on." />
        <MetricCard
          label="Upcoming Inspections"
          value={String(overview.upcomingInspectionCount)}
          hint="Next visits waiting on your calendar."
        />
        <MetricCard
          label="Active Offers"
          value={String(overview.activeOfferCount)}
          hint="Negotiations still open right now."
          tone="accent"
        />
        <MetricCard
          label="Unread Notifications"
          value={String(overview.unreadNotificationCount)}
          hint="Fresh platform updates since your last check."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          title="Recent activity"
          description="The last five actions you took on DreamHomes."
        >
          {overview.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {overview.recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border px-4 py-4 transition-colors hover:border-primary/30 hover:bg-secondary/40"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(item.occurredAt)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="No recent activity yet"
              body="Once you start saving listings, booking inspections, or making offers, the last five actions will appear here."
              ctaLabel="Browse listings"
              ctaHref="/listings"
            />
          )}
        </SectionCard>

        <div className="rounded-3xl bg-[#0c1b2a] p-6 text-white">
          <p className="text-xs uppercase tracking-eyebrow text-slate-400">Dream AI</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Continue your property search with Dream AI
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Ask for better neighbourhood fits, inspection questions, or budget guidance without starting over.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "Find me a 2 bedroom in Yaba under ₦2.5m",
              "Show safer rent options around Lekki Phase 1",
              "What should I verify before paying agency fees?",
            ].map((prompt) => (
              <div
                key={prompt}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                {prompt}
              </div>
            ))}
          </div>
          <Link
            href="/dream-ai"
            className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-6 w-full")}
          >
            Open Dream AI
            <Sparkles className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Saved listings"
          description="Your three most recent favourites."
          action={
            <Link href="/dashboard/saved" className={buttonVariants({ variant: "outline", size: "sm" })}>
              View all
            </Link>
          }
        >
          {overview.savedPreview.length > 0 ? (
            <div className="space-y-4">
              {overview.savedPreview.map((item) =>
                item.listing ? <CompactListingTile key={item.save.listingId} listing={item.listing} /> : null,
              )}
            </div>
          ) : (
            <EmptyPanel
              title="No saved listings yet"
              body="Tap save on any listing that feels promising, then compare options from one shortlist."
              ctaLabel="Browse listings"
              ctaHref="/listings"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming inspections"
          description="Your next booked property visits."
          action={
            <Link href="/dashboard/inspections" className={buttonVariants({ variant: "outline", size: "sm" })}>
              View all
            </Link>
          }
        >
          {overview.inspectionPreview.length > 0 ? (
            <div className="space-y-4">
              {overview.inspectionPreview.map((item) => (
                <div
                  key={item.inspection.id}
                  className="rounded-2xl border border-border px-4 py-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        {item.listing?.title ?? "DreamHomes inspection"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.listing?.location ?? "Location loading from Haven"}
                      </p>
                      {item.slot ? (
                        <p className="inline-flex items-center gap-2 text-sm text-foreground">
                          <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                          {formatInspectionWindow(item.slot.startsAt, item.slot.endsAt)}
                        </p>
                      ) : null}
                    </div>
                    <Link href="/dashboard/inspections" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Manage booking
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="No upcoming inspections"
              body="Book a visit on any verified listing and DreamHomes will keep the next slot here."
              ctaLabel="Find a place to inspect"
              ctaHref="/listings"
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Active offers"
        description="Negotiations still waiting on the next move."
        action={
          <Link href="/dashboard/offers" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Open offers
          </Link>
        }
      >
        {overview.offerPreview.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {overview.offerPreview.map((item) => (
              <div key={item.offer.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {item.listing?.title ?? `Listing #${item.offer.listingId}`}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.listing?.location ?? "Fetching location from Haven"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                    <HandCoins className="h-3.5 w-3.5" aria-hidden />
                    {item.offer.intent === "BUY" ? "Buy" : "Rent"}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {formatNaira(item.offer.amount)}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Bell className="h-4 w-4" aria-hidden />
                  Updated {formatDateTime(item.offer.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel
            title="No active offers yet"
            body="When you submit an offer on a listing, its latest status will stay visible here until the deal closes."
            ctaLabel="Explore listings"
            ctaHref="/listings"
          />
        )}
      </SectionCard>
    </div>
  );
}
