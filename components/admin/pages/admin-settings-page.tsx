"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, ShieldAlert } from "lucide-react";
import {
  approveListing,
  approveVerification,
  clearAdminCommentFlag,
  DEFAULT_ADMIN_ADS_STATE,
  DEFAULT_ADMIN_PLATFORM_SETTINGS,
  deleteComment,
  dismissListingReport,
  getAdminAnalyticsWorkspace,
  getAdminDashboardOverview,
  listAdminAuditLogs,
  listAdminListings,
  listAdminModerationComments,
  listAdminReports,
  listAdminUsers,
  listAdminVerifications,
  readAdminAdsState,
  readAdminPlatformSettings,
  reactivateUser,
  rejectVerification,
  resolveListingReport,
  saveAdminAdsState,
  saveAdminPlatformSettings,
  suspendUser,
  takeDownListing,
  type VerificationQueueType,
} from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel, MetricCard, SectionCard, SettingsToggle, StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatDate, formatDateTime } from "@/components/dashboard/utils";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { FieldLabel, PrototypeNotice } from "./admin-page-primitives";

export function AdminSettingsPage() {
  const [settings, setSettings] = useState(() => readAdminPlatformSettings() ?? DEFAULT_ADMIN_PLATFORM_SETTINGS);
  const adminsQuery = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => listAdminUsers({ role: "ADMIN", size: 50 }),
  });

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Platform settings"
        description="Control operational defaults, trust requirements, and read-only seeded admin account visibility."
      />

      <PrototypeNotice
        title="Platform settings are currently staged locally"
        body="Haven doesn’t yet expose a configuration endpoint for commissions, SLAs, or verification requirements. These controls keep the final admin experience reviewable now."
      />

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
              <Input
                value={String(settings.defaultCommissionRate)}
                onChange={(event) => setSettings((current) => ({ ...current, defaultCommissionRate: Number(event.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Owner response SLA (hours)</FieldLabel>
              <Input
                value={String(settings.ownerResponseSlaHours)}
                onChange={(event) => setSettings((current) => ({ ...current, ownerResponseSlaHours: Number(event.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Inspection conflict buffer (minutes)</FieldLabel>
              <Input
                value={String(settings.inspectionConflictBufferMinutes)}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, inspectionConflictBufferMinutes: Number(event.target.value || 0) }))
                }
              />
            </div>
            <Button
              onClick={() => {
                saveAdminPlatformSettings(settings);
                toast.success("Platform settings saved locally.");
              }}
            >
              Save settings
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
