"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeAgentPassword,
  DEFAULT_AGENT_NOTIFICATION_PREFERENCES,
  getAgentProfileWorkspace,
  readAgentNotificationPreferences,
  saveAgentNotificationPreferences,
  updateAgentProfile,
  type AgentNotificationPreferences,
} from "@/lib/agent-dashboard";
import { deleteMyAccount, updateMyProfileBasics } from "@/lib/applicant-dashboard";
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

import { FieldLabel } from "./agent-page-primitives";

export function AgentSettingsPage() {
  const { user, clear, setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = user?.id ?? 0;

  const profileQuery = useQuery({
    queryKey: ["agent-profile-workspace", userId],
    queryFn: () => getAgentProfileWorkspace(userId),
    enabled: userId > 0,
  });

  const [preferences, setPreferences] = useState<AgentNotificationPreferences>(DEFAULT_AGENT_NOTIFICATION_PREFERENCES);
  const [prefsReady, setPrefsReady] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (profileQuery.data) {
      setEmail(profileQuery.data.privateProfile.email ?? "");
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (!userId || !profileQuery.data || prefsReady) return;
    const raw = profileQuery.data.privateProfile.notificationPreferences;
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw) as Partial<AgentNotificationPreferences>;
        setPreferences({ ...DEFAULT_AGENT_NOTIFICATION_PREFERENCES, ...parsed });
      } catch {
        setPreferences(readAgentNotificationPreferences(userId));
      }
    } else {
      setPreferences(readAgentNotificationPreferences(userId));
    }
    setPrefsReady(true);
  }, [prefsReady, profileQuery.data, userId]);

  const prefsMutation = useMutation({
    mutationFn: (next: AgentNotificationPreferences) =>
      updateMyProfileBasics({ notificationPreferences: JSON.stringify(next) }),
    onError: () => {
      toast.error("Could not sync preferences to the server. They are still saved in this browser.");
    },
  });

  const emailMutation = useMutation({
    mutationFn: (nextEmail: string) => updateAgentProfile({ email: nextEmail }),
    onSuccess: async (result) => {
      setUser({
        id: result.userId,
        fullName: result.fullName,
        email: result.email,
        role: result.role,
      });
      toast.success("Email updated.");
      await queryClient.invalidateQueries({ queryKey: ["agent-profile-workspace", userId] });
    },
    onError: () => toast.error("We couldn't update your email."),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changeAgentPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated. Sign in again on any other active devices.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: () => toast.error("We couldn't update your password."),
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

  if (profileQuery.isLoading) return <LoadingPanel label="Loading settings..." />;
  if (profileQuery.isError || !profileQuery.data) {
    return <ErrorPanel body="We couldn’t load your settings right now." onRetry={() => void profileQuery.refetch()} />;
  }

  const liveEmail = email || profileQuery.data.privateProfile.email || "";

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Agent settings"
        title="Settings"
        description="Update your account email, change your password, and control notification preferences."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Account access" description="Change your sign-in email and password.">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Email</FieldLabel>
              <Input value={liveEmail} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Button disabled={emailMutation.isPending} onClick={() => emailMutation.mutate(liveEmail)}>
              {emailMutation.isPending ? "Updating..." : "Change email"}
            </Button>

            <div className="grid gap-4 border-t border-border pt-4">
              <div className="space-y-2">
                <FieldLabel>Current password</FieldLabel>
                <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>New password</FieldLabel>
                <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>Confirm new password</FieldLabel>
                <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </div>
              <Button
                variant="outline"
                disabled={passwordMutation.isPending}
                onClick={() => {
                  if (newPassword !== confirmPassword) {
                    toast.error("New password and confirmation do not match.");
                    return;
                  }
                  passwordMutation.mutate();
                }}
              >
                {passwordMutation.isPending ? "Updating..." : "Change password"}
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Notification preferences"
          description="Saved to your DreamHomes account. We also keep a copy in this browser if the network request fails."
        >
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted/15 px-4 py-1 sm:px-5 sm:py-1.5">
            <SettingsToggle
              title="Inspection requests"
              description="Get nudged when new inspection activity lands on your managed listings."
              checked={preferences.inspectionRequests}
              onCheckedChange={(next) => {
                const updated = { ...preferences, inspectionRequests: next };
                setPreferences(updated);
                if (userId) saveAgentNotificationPreferences(userId, updated);
                prefsMutation.mutate(updated);
              }}
            />
            <SettingsToggle
              title="Offer activity"
              description="Receive alerts when offer threads move."
              checked={preferences.offerActivity}
              onCheckedChange={(next) => {
                const updated = { ...preferences, offerActivity: next };
                setPreferences(updated);
                if (userId) saveAgentNotificationPreferences(userId, updated);
                prefsMutation.mutate(updated);
              }}
            />
            <SettingsToggle
              title="Owner activity"
              description="Track assignment handshakes and owner-related workflow updates."
              checked={preferences.ownerActivity}
              onCheckedChange={(next) => {
                const updated = { ...preferences, ownerActivity: next };
                setPreferences(updated);
                if (userId) saveAgentNotificationPreferences(userId, updated);
                prefsMutation.mutate(updated);
              }}
            />
            <SettingsToggle
              title="Verification updates"
              description="Keep credential approval and request outcomes visible."
              checked={preferences.verificationUpdates}
              onCheckedChange={(next) => {
                const updated = { ...preferences, verificationUpdates: next };
                setPreferences(updated);
                if (userId) saveAgentNotificationPreferences(userId, updated);
                prefsMutation.mutate(updated);
              }}
            />
            <SettingsToggle
              title="Email notifications"
              description="Mirror important events to your inbox when enabled."
              checked={preferences.email}
              onCheckedChange={(next) => {
                const updated = { ...preferences, email: next };
                setPreferences(updated);
                if (userId) saveAgentNotificationPreferences(userId, updated);
                prefsMutation.mutate(updated);
              }}
            />
            <SettingsToggle
              title="In-app notifications"
              description="Keep in-product alerts active."
              checked={preferences.inApp}
              onCheckedChange={(next) => {
                const updated = { ...preferences, inApp: next };
                setPreferences(updated);
                if (userId) saveAgentNotificationPreferences(userId, updated);
                prefsMutation.mutate(updated);
              }}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Delete account"
        description="Soft-delete on DreamHomes: your session ends immediately and your email can be reused after anonymisation."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            This closes your agent account on the server. You will be signed out immediately after it succeeds.
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
