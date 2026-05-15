"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  changeMyPassword,
  deleteMyAccount,
  updateMyProfileBasics,
} from "@/lib/applicant-dashboard";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getOwnerProfileData,
  readOwnerNotificationPreferences,
  saveOwnerNotificationPreferences,
} from "@/lib/owner-dashboard";
import { useAuth } from "@/lib/use-auth";
import { DashboardPageIntro, ErrorPanel, LoadingPanel, SectionCard, SettingsToggle } from "@/components/dashboard/applicant-ui";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

import { FieldLabel } from "./owner-page-primitives";

type NotificationPrefs = typeof DEFAULT_NOTIFICATION_PREFERENCES;

export function OwnerSettingsPage() {
  const { user, clear } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preferences, setPreferences] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [prefsReady, setPrefsReady] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["owner-profile", user?.id],
    queryFn: () => getOwnerProfileData(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setEmail(profileQuery.data.privateProfile.email ?? "");
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (!user?.id || !profileQuery.data || prefsReady) return;
    const raw = profileQuery.data.privateProfile.notificationPreferences;
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
        setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed });
      } catch {
        setPreferences(readOwnerNotificationPreferences(user.id));
      }
    } else {
      setPreferences(readOwnerNotificationPreferences(user.id));
    }
    setPrefsReady(true);
  }, [prefsReady, profileQuery.data, user?.id]);

  const prefsMutation = useMutation({
    mutationFn: (next: NotificationPrefs) => updateMyProfileBasics({ notificationPreferences: JSON.stringify(next) }),
    onError: () => {
      toast.error("Could not sync preferences to the server. They are still saved in this browser.");
    },
  });

  const emailMutation = useMutation({
    mutationFn: () => updateMyProfileBasics({ email }),
    onSuccess: () => toast.success("Email updated."),
    onError: () => toast.error("We couldn't update your email."),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changeMyPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated. Sign in again on any other devices.");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: () => toast.error("We couldn't change your password."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMyAccount(),
    onSuccess: async () => {
      toast.success("Account closed.");
      clear();
      router.replace("/login");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We could not close your account.");
    },
  });

  if (profileQuery.isLoading) return <LoadingPanel label="Loading owner settings..." />;
  if (profileQuery.error) {
    return <ErrorPanel body="We couldn't load your settings." onRetry={() => profileQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Account controls"
        title="Settings"
        description="Security, notifications, and account closure for your owner workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard title="Account" description="Update the email address attached to this owner account.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Email</FieldLabel>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Button onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending}>
              {emailMutation.isPending ? "Saving..." : "Save email"}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Change password" description="Use your current password once, then set the new one you want enforced.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Current password</FieldLabel>
              <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </div>
            <div className="space-y-2">
              <FieldLabel>New password</FieldLabel>
              <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </div>
            <Button
              onClick={() => passwordMutation.mutate()}
              disabled={passwordMutation.isPending || !currentPassword || !newPassword}
            >
              {passwordMutation.isPending ? "Updating..." : "Change password"}
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Notification preferences"
        description="Saved to your DreamHomes account. We also keep a copy in this browser if the network request fails."
      >
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted/15 px-4 py-1 sm:px-5 sm:py-1.5">
          <SettingsToggle
            title="Inspection updates"
            description="Important inspection activity and slot movement."
            checked={preferences.inspectionUpdates}
            onCheckedChange={(next) => {
              if (!user?.id) return;
              const updated = { ...preferences, inspectionUpdates: next };
              setPreferences(updated);
              saveOwnerNotificationPreferences(user.id, updated);
              prefsMutation.mutate(updated);
            }}
          />
          <SettingsToggle
            title="Offer updates"
            description="Offer submissions, responses, and counters."
            checked={preferences.offerUpdates}
            onCheckedChange={(next) => {
              if (!user?.id) return;
              const updated = { ...preferences, offerUpdates: next };
              setPreferences(updated);
              saveOwnerNotificationPreferences(user.id, updated);
              prefsMutation.mutate(updated);
            }}
          />
          <SettingsToggle
            title="Platform announcements"
            description="Product and trust-program updates from DreamHomes."
            checked={preferences.platformAnnouncements}
            onCheckedChange={(next) => {
              if (!user?.id) return;
              const updated = { ...preferences, platformAnnouncements: next };
              setPreferences(updated);
              saveOwnerNotificationPreferences(user.id, updated);
              prefsMutation.mutate(updated);
            }}
          />
          <SettingsToggle
            title="Email notifications"
            description="Mirror important events to your inbox when enabled."
            checked={preferences.email}
            onCheckedChange={(next) => {
              if (!user?.id) return;
              const updated = { ...preferences, email: next };
              setPreferences(updated);
              saveOwnerNotificationPreferences(user.id, updated);
              prefsMutation.mutate(updated);
            }}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Delete account"
        description="Soft-delete on DreamHomes: your session ends immediately and your email can be reused after anonymisation."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            This closes your account on the server. Listings and workspace data tied to this login will no longer be
            available from this account.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your DreamHomes account?</DialogTitle>
                <DialogDescription>
                  This uses the account closure API. You will be signed out immediately after it succeeds.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Keep account</Button>
                </DialogClose>
                <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                  {deleteMutation.isPending ? "Closing…" : "Confirm delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SectionCard>
    </div>
  );
}
