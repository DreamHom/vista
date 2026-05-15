"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_ADMIN_PLATFORM_SETTINGS,
  fetchAdminPlatformSettings,
  listAdminUsers,
  patchAdminPlatformSettings,
  type AdminPlatformSettings,
} from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel, SectionCard, SettingsToggle } from "@/components/dashboard/applicant-ui";
import { formatDate } from "@/components/dashboard/utils";
import { Button } from "@/components/ui/button";
import { CommaDecimalInput, CommaIntegerInput } from "@/components/ui/comma-number-input";
import { toast } from "@/components/ui/toast";
import { FieldLabel } from "./admin-page-primitives";

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["admin-platform-settings"],
    queryFn: fetchAdminPlatformSettings,
  });
  const [settings, setSettings] = useState<AdminPlatformSettings>(DEFAULT_ADMIN_PLATFORM_SETTINGS);

  useEffect(() => {
    if (settingsQuery.data) setSettings(settingsQuery.data.settings);
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: patchAdminPlatformSettings,
    onSuccess: async (data) => {
      setSettings(data.settings);
      await queryClient.invalidateQueries({ queryKey: ["admin-platform-settings"] });
      toast.success("Platform settings saved.");
    },
    onError: () => toast.error("We couldn't save platform settings."),
  });

  const adminsQuery = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => listAdminUsers({ role: "ADMIN", size: 50 }),
  });

  if (settingsQuery.isLoading) return <LoadingPanel label="Loading platform settings..." />;
  if (settingsQuery.isError || !settingsQuery.data) {
    return <ErrorPanel body="We couldn’t load platform settings right now." onRetry={() => void settingsQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Platform settings"
        description="Trust requirements and operational defaults from Haven platform configuration."
      />

      {settingsQuery.data.updatedAt ? (
        <p className="text-sm text-muted-foreground">Last updated {formatDate(settingsQuery.data.updatedAt)}</p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Verification requirements" description="Control which trust checks remain mandatory.">
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted/15 px-4 py-1 sm:px-5 sm:py-1.5">
            <SettingsToggle
              title="Owner identity required"
              description="Owners must pass identity verification before core actions unlock."
              checked={settings.ownerIdentityRequired}
              onCheckedChange={(next) => setSettings((current) => ({ ...current, ownerIdentityRequired: next }))}
            />
            <SettingsToggle
              title="Property documents required"
              description="Property badges should depend on document approval."
              checked={settings.propertyDocumentsRequired}
              onCheckedChange={(next) => setSettings((current) => ({ ...current, propertyDocumentsRequired: next }))}
            />
            <SettingsToggle
              title="Agent credentials required"
              description="Agents must clear credential review before public promotion."
              checked={settings.agentCredentialsRequired}
              onCheckedChange={(next) => setSettings((current) => ({ ...current, agentCredentialsRequired: next }))}
            />
          </div>
        </SectionCard>

        <SectionCard title="Operations defaults" description="Set product-level rates and timing expectations.">
          <div className="grid gap-4">
            <div className="space-y-2">
              <FieldLabel>Commission rate (%)</FieldLabel>
              <CommaDecimalInput
                value={settings.defaultCommissionRate}
                onChange={(next) => setSettings((current) => ({ ...current, defaultCommissionRate: next }))}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Owner response SLA (hours)</FieldLabel>
              <CommaIntegerInput
                value={settings.ownerResponseSlaHours}
                onChange={(next) => setSettings((current) => ({ ...current, ownerResponseSlaHours: next }))}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Inspection conflict buffer (minutes)</FieldLabel>
              <CommaIntegerInput
                value={settings.inspectionConflictBufferMinutes}
                onChange={(next) => setSettings((current) => ({ ...current, inspectionConflictBufferMinutes: next }))}
              />
            </div>
            <Button onClick={() => saveMutation.mutate(settings)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Admin account management" description="Read-only access to admin accounts, including seeded operators.">
        {adminsQuery.isLoading ? (
          <LoadingPanel label="Loading admin accounts..." />
        ) : adminsQuery.isError || !adminsQuery.data ? (
          <ErrorPanel body="We couldn’t load admin accounts right now." onRetry={() => void adminsQuery.refetch()} />
        ) : adminsQuery.data.items.length === 0 ? (
          <EmptyPanel title="No admin accounts found" body="Admin user records will appear here once available." />
        ) : (
          <div className="space-y-3">
            {adminsQuery.data.items.map((admin) => (
              <div key={admin.id} className="grid gap-3 border border-border bg-white px-4 py-4 sm:grid-cols-[minmax(0,1fr)_160px_160px] sm:items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">{admin.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{admin.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Joined</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{admin.joinedAt ? formatDate(admin.joinedAt) : "Unavailable"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Seeded status</p>
                  <p className="mt-2 text-base font-semibold text-foreground">Read only</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
