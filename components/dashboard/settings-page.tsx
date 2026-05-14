"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DashboardPageIntro,
  ErrorPanel,
  LoadingPanel,
  SectionCard,
  SettingsToggle,
} from "@/components/dashboard/applicant-ui";
import {
  changeMyPassword,
  getApplicantProfileData,
  readApplicantNotificationPreferences,
  saveApplicantNotificationPreferences,
  updateMyProfileBasics,
  type ApplicantNotificationPreferences,
} from "@/lib/applicant-dashboard";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
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

const DEFAULT_PREFS: ApplicantNotificationPreferences = {
  inspectionUpdates: true,
  offerUpdates: true,
  platformAnnouncements: true,
  email: true,
  inApp: true,
};

export function ApplicantSettingsPage() {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [prefsReady, setPrefsReady] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["applicant-settings-profile", user?.id],
    queryFn: () => getApplicantProfileData(user!.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (!user?.id || !profileQuery.data) return;
    setEmail(profileQuery.data.privateProfile.email ?? "");
    if (!prefsReady) {
      setPrefs(readApplicantNotificationPreferences(user.id));
      setPrefsReady(true);
    }
  }, [prefsReady, profileQuery.data, user?.id]);

  const emailMutation = useMutation({
    mutationFn: () => updateMyProfileBasics({ email }),
    onSuccess: (result) => {
      setUser({
        id: result.userId,
        email: result.email,
        fullName: result.fullName,
        role: result.role,
      });
      toast.success("Account email updated.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't update your email.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => changeMyPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't change your password.");
    },
  });

  if (profileQuery.isLoading) {
    return <LoadingPanel label="Loading your settings..." />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorPanel
        body={profileQuery.error instanceof Error ? profileQuery.error.message : "We couldn't load your settings."}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Settings"
        title="Settings"
        description="Manage your core account details now, while prototype-only preferences stay local until Haven exposes dedicated settings endpoints."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Account" description="Update your account email and password.">
          <div className="space-y-6">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                emailMutation.mutate();
              }}
            >
              <label className="space-y-2 text-sm text-muted-foreground">
                Email
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <Button type="submit" disabled={emailMutation.isPending}>
                Save email
              </Button>
            </form>

            <form
              className="space-y-4 border-t border-border pt-6"
              onSubmit={(event) => {
                event.preventDefault();
                if (newPassword !== confirmPassword) {
                  toast.error("New password and confirmation do not match.");
                  return;
                }
                passwordMutation.mutate();
              }}
            >
              <label className="space-y-2 text-sm text-muted-foreground">
                Current password
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-muted-foreground">
                  New password
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  Confirm new password
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </label>
              </div>
              <Button type="submit" disabled={passwordMutation.isPending}>
                Change password
              </Button>
            </form>
          </div>
        </SectionCard>

        <SectionCard
          title="Notification preferences"
          description="Saved locally for this prototype until Haven adds dedicated preference endpoints."
        >
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted/15 px-4 py-1 sm:px-5 sm:py-1.5">
            <SettingsToggle
              title="Inspection updates"
              description="Get notified when bookings are accepted, moved, or cancelled."
              checked={prefs.inspectionUpdates}
              onCheckedChange={(next) => {
                if (!user?.id) return;
                const updated = { ...prefs, inspectionUpdates: next };
                setPrefs(updated);
                saveApplicantNotificationPreferences(user.id, updated);
              }}
            />
            <SettingsToggle
              title="Offer updates"
              description="Stay on top of counters, acceptances, and declines."
              checked={prefs.offerUpdates}
              onCheckedChange={(next) => {
                if (!user?.id) return;
                const updated = { ...prefs, offerUpdates: next };
                setPrefs(updated);
                saveApplicantNotificationPreferences(user.id, updated);
              }}
            />
            <SettingsToggle
              title="Platform announcements"
              description="Receive product updates, verification notices, and general service messages."
              checked={prefs.platformAnnouncements}
              onCheckedChange={(next) => {
                if (!user?.id) return;
                const updated = { ...prefs, platformAnnouncements: next };
                setPrefs(updated);
                saveApplicantNotificationPreferences(user.id, updated);
              }}
            />
            <SettingsToggle
              title="Email delivery"
              description="Prefer email in addition to the in-app inbox."
              checked={prefs.email}
              onCheckedChange={(next) => {
                if (!user?.id) return;
                const updated = { ...prefs, email: next };
                setPrefs(updated);
                saveApplicantNotificationPreferences(user.id, updated);
              }}
            />
            <SettingsToggle
              title="In-app inbox"
              description="Keep updates visible inside the applicant workspace."
              checked={prefs.inApp}
              onCheckedChange={(next) => {
                if (!user?.id) return;
                const updated = { ...prefs, inApp: next };
                setPrefs(updated);
                saveApplicantNotificationPreferences(user.id, updated);
              }}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Delete account"
        description="This confirmation flow is ready, but final account deletion still needs a Haven endpoint."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            You can review the confirmation dialog now, but the final destructive request is intentionally blocked until the backend exposes a delete-account route.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your DreamHomes account?</DialogTitle>
                <DialogDescription>
                  This would remove your saved homes, inspection history, and offers from your workspace. Haven does not expose this endpoint yet, so the action remains disabled for now.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Keep account</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={() => toast.error("Delete account is waiting on backend support.")}
                  >
                    Confirm delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SectionCard>
    </div>
  );
}
