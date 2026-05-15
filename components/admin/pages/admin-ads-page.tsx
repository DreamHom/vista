"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_ADMIN_PLATFORM_SETTINGS,
  fetchAdminPlatformSettings,
  listAdminAdCampaigns,
  patchAdminAdCampaign,
  patchAdminPlatformSettings,
  type AdCampaignRow,
  type AdCampaignStatus,
} from "@/lib/admin-dashboard";
import { DashboardPageIntro, EmptyPanel, ErrorPanel, LoadingPanel, SectionCard, StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
import { Button } from "@/components/ui/button";
import { CommaIntegerInput } from "@/components/ui/comma-number-input";
import { toast } from "@/components/ui/toast";
import { FieldLabel } from "./admin-page-primitives";

function formatMinorToNgn(minorUnits: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(minorUnits / 100);
}

function statusVariant(status: AdCampaignStatus): "success" | "warning" | "secondary" | "outline" {
  if (status === "ACTIVE" || status === "APPROVED") return "success";
  if (status === "PENDING_REVIEW" || status === "DRAFT") return "warning";
  if (status === "REJECTED") return "outline";
  return "secondary";
}

export function AdminAdsPage() {
  const queryClient = useQueryClient();
  const [featuredAgentDailyRate, setFeaturedAgentDailyRate] = useState(DEFAULT_ADMIN_PLATFORM_SETTINGS.featuredAgentDailyRate);
  const [featuredListingDailyRate, setFeaturedListingDailyRate] = useState(DEFAULT_ADMIN_PLATFORM_SETTINGS.featuredListingDailyRate);

  const settingsQuery = useQuery({
    queryKey: ["admin-platform-settings"],
    queryFn: fetchAdminPlatformSettings,
  });

  const campaignsQuery = useQuery({
    queryKey: ["admin-ad-campaigns"],
    queryFn: listAdminAdCampaigns,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setFeaturedAgentDailyRate(settingsQuery.data.settings.featuredAgentDailyRate);
      setFeaturedListingDailyRate(settingsQuery.data.settings.featuredListingDailyRate);
    }
  }, [settingsQuery.data]);

  const patchCampaignMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdCampaignStatus }) => patchAdminAdCampaign(id, status),
    onSuccess: async () => {
      toast.success("Campaign updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-ad-campaigns"] });
    },
    onError: () => toast.error("We couldn't update that campaign."),
  });

  const saveRatesMutation = useMutation({
    mutationFn: () => {
      const base = settingsQuery.data?.settings ?? DEFAULT_ADMIN_PLATFORM_SETTINGS;
      return patchAdminPlatformSettings({
        ...base,
        featuredAgentDailyRate,
        featuredListingDailyRate,
      });
    },
    onSuccess: async () => {
      toast.success("Reference pricing saved to platform settings.");
      await queryClient.invalidateQueries({ queryKey: ["admin-platform-settings"] });
    },
    onError: () => toast.error("We couldn't save pricing."),
  });

  if (campaignsQuery.isLoading) return <LoadingPanel label="Loading ad campaigns..." />;
  if (campaignsQuery.isError || !campaignsQuery.data) {
    return <ErrorPanel body="We couldn’t load ad campaigns right now." onRetry={() => void campaignsQuery.refetch()} />;
  }

  const campaigns = campaignsQuery.data;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Admin console"
        title="Ads management"
        description="Review sponsor campaigns from Haven and keep reference featured-pricing fields in platform settings."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Ad campaigns" description="Lifecycle actions use the Haven admin ad-campaign endpoints.">
          {campaigns.length === 0 ? (
            <EmptyPanel title="No campaigns" body="When sponsors submit campaigns for review, they will appear here." />
          ) : (
            <div className="space-y-3">
              {campaigns.map((row: AdCampaignRow) => (
                <div key={row.id} className="border border-border bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{row.title || `Campaign #${row.id}`}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.body || "—"}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Sponsor #{row.sponsorUserId} · Budget {formatMinorToNgn(row.budgetCents)} · Updated {formatDateTime(row.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge label={row.status.replaceAll("_", " ")} variant={statusVariant(row.status)} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {row.status === "PENDING_REVIEW" ? (
                      <>
                        <Button size="sm" onClick={() => patchCampaignMutation.mutate({ id: row.id, status: "APPROVED" })}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => patchCampaignMutation.mutate({ id: row.id, status: "REJECTED" })}>
                          Reject
                        </Button>
                      </>
                    ) : null}
                    {row.status === "APPROVED" ? (
                      <Button size="sm" onClick={() => patchCampaignMutation.mutate({ id: row.id, status: "ACTIVE" })}>
                        Mark active
                      </Button>
                    ) : null}
                    {row.status === "ACTIVE" ? (
                      <Button size="sm" variant="outline" onClick={() => patchCampaignMutation.mutate({ id: row.id, status: "PAUSED" })}>
                        Pause
                      </Button>
                    ) : null}
                    {row.status === "PAUSED" ? (
                      <Button size="sm" onClick={() => patchCampaignMutation.mutate({ id: row.id, status: "ACTIVE" })}>
                        Resume
                      </Button>
                    ) : null}
                    {row.status === "DRAFT" ? (
                      <p className="text-xs text-muted-foreground">Draft: waiting for sponsor to submit for review.</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Reference featured pricing"
          description="Stored in Haven platform settings (flat JSON keys) for product copy and internal estimates — not a billing engine."
        >
          <div className="space-y-4">
            {settingsQuery.isError ? (
              <ErrorPanel body="Could not load current platform settings for pricing." onRetry={() => void settingsQuery.refetch()} />
            ) : null}
            <div className="space-y-2">
              <FieldLabel>Featured agent cost per day (₦)</FieldLabel>
              <CommaIntegerInput value={featuredAgentDailyRate} onChange={setFeaturedAgentDailyRate} min={0} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Featured listing cost per day (₦)</FieldLabel>
              <CommaIntegerInput value={featuredListingDailyRate} onChange={setFeaturedListingDailyRate} min={0} />
            </div>
            <Button onClick={() => saveRatesMutation.mutate()} disabled={saveRatesMutation.isPending || settingsQuery.isLoading}>
              {saveRatesMutation.isPending ? "Saving…" : "Save pricing"}
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Campaign statuses" description="Quick reference for Haven lifecycle values.">
        <p className="text-sm text-muted-foreground">
          DRAFT → PENDING_REVIEW → APPROVED or REJECTED → ACTIVE or PAUSED → ENDED. Vista sends PATCH with the target status only; invalid
          transitions return 400/409 from the API.
        </p>
      </SectionCard>
    </div>
  );
}
