"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarClock, CheckCheck, HandCoins, MessageSquareMore } from "lucide-react";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
} from "@/components/dashboard/applicant-ui";
import {
  getNotificationHref,
  listNotifications,
  type NotificationResponse,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/applicant-dashboard";
import { notificationDisplayCopy } from "@/lib/notification-display";
import { notificationCategory, formatDateTime } from "@/components/dashboard/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { toast } from "@/components/ui/toast";

type NotificationFilter = "all" | "inspections" | "offers" | "general";

const FILTERS: Array<{ value: NotificationFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "inspections", label: "Inspections" },
  { value: "offers", label: "Offers" },
  { value: "general", label: "General" },
];

function NotificationIcon({ notification }: { notification: NotificationResponse }) {
  const category = notificationCategory(notification.kind);

  if (category === "inspections") {
    return <CalendarClock className="h-4 w-4" aria-hidden />;
  }
  if (category === "offers") {
    return <HandCoins className="h-4 w-4" aria-hidden />;
  }
  if (notification.kind === "COMMENT_POSTED" || notification.kind === "REVIEW_RECEIVED") {
    return <MessageSquareMore className="h-4 w-4" aria-hidden />;
  }
  return <Bell className="h-4 w-4" aria-hidden />;
}

export function ApplicantNotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const notificationsQuery = useQuery({
    queryKey: ["applicant-notifications", user?.id],
    queryFn: () => listNotifications({ size: 60 }),
    enabled: Boolean(user?.id),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applicant-notifications", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["unread-notification-count", user?.id] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't mark that notification as read.");
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: (result) => {
      toast.success(`${result.marked} notification${result.marked === 1 ? "" : "s"} marked as read.`);
      void queryClient.invalidateQueries({ queryKey: ["applicant-notifications", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-dashboard-overview", user?.id] });
      queryClient.setQueryData<number>(["unread-notification-count", user?.id], 0);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't mark all notifications as read.");
    },
  });

  const filteredNotifications = useMemo(() => {
    const items = notificationsQuery.data?.items ?? [];
    if (filter === "all") return items;
    return items.filter((item) => notificationCategory(item.kind) === filter);
  }, [filter, notificationsQuery.data?.items]);

  if (notificationsQuery.isLoading) {
    return <LoadingPanel label="Loading your notifications..." />;
  }

  if (notificationsQuery.isError) {
    return (
      <ErrorPanel
        body={notificationsQuery.error instanceof Error ? notificationsQuery.error.message : "We couldn't load your notifications."}
        onRetry={() => void notificationsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Notifications"
        title="Notifications"
        description="Everything Haven has sent your way, with a quick path back to the relevant booking, offer, or profile page."
        actions={
          <Button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            <CheckCheck className="h-4 w-4" aria-hidden />
            Mark all as read
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={
              filter === option.value
                ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                : "rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyPanel
          title="No notifications here yet"
          body="As inspections, offers, and trust updates happen on your account, they’ll appear in this inbox."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const isUnread = !notification.readAt;
            const copy = notificationDisplayCopy(notification);

            return (
              <div
                key={notification.id}
                className={`rounded-3xl border px-5 py-5 ${isUnread ? "border-primary/30 bg-primary/5" : "border-border bg-white"}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary">
                      <NotificationIcon notification={notification} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium uppercase tracking-eyebrow text-muted-foreground">
                          {copy.title}
                        </p>
                        {isUnread ? (
                          <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">
                            Unread
                          </span>
                        ) : null}
                      </div>
                      <p className="text-base leading-7 text-foreground">
                        {copy.body.trim()
                          ? copy.body
                          : "Open this update to jump back into the relevant activity."}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {isUnread ? (
                      <Button
                        variant="outline"
                        onClick={() => markReadMutation.mutate(notification.id)}
                        disabled={markReadMutation.isPending}
                      >
                        Mark read
                      </Button>
                    ) : null}
                    <Link href={getNotificationHref(notification, "APPLICANT")} className={buttonVariants({ size: "md" })}>
                      Open
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-3xl border border-border bg-white px-6 py-5 text-sm leading-7 text-muted-foreground">
        DreamHomes also keeps your live dashboard shortcuts up to date. If you’d rather continue your search than manage the inbox, jump back into{" "}
        <Link href="/dream-ai" className="font-medium text-primary hover:text-primary/80">
          Dream AI
        </Link>{" "}
        or browse fresh inventory on{" "}
        <Link href="/listings" className="font-medium text-primary hover:text-primary/80">
          Browse Listings
        </Link>.
      </div>
    </div>
  );
}
