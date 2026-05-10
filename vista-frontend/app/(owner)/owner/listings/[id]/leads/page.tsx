import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import {
  getApplicant,
  getLeadsFor,
  getInspectionsFor,
  getOffersFor,
  getListing,
} from "@/lib/mock-data";
import { LEAD_TEMPERATURES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const listingLeads = getLeadsFor(listing.id);
  const listingInspections = getInspectionsFor(listing.id);
  const listingOffers = getOffersFor(listing.id);

  const tempTone = (t: string) =>
    t === "hot" ? "danger" : t === "warm" ? "warn" : "muted";

  return (
    <>
      <PageHeader
        title={`Leads · ${listing.title}`}
        description="Lead temperature shifts as applicants act. Saved → Inspection requested → Offer in."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active={`/owner/listings/${listing.id}/leads`}
          items={[
            { href: `/owner/listings/${listing.id}`, label: "Overview" },
            { href: `/owner/listings/${listing.id}/leads`, label: "Leads", count: listingLeads.length },
            { href: `/owner/listings/${listing.id}/inspections`, label: "Inspections", count: listingInspections.length },
            { href: `/owner/listings/${listing.id}/offers`, label: "Offers", count: listingOffers.length },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {LEAD_TEMPERATURES.map((t) => {
            const count = listingLeads.filter((l) => l.temperature === t.id).length;
            return (
              <div key={t.id} className="rounded-2xl border border-border bg-bg-elevated p-5">
                <div className="flex items-center justify-between">
                  <Badge tone={tempTone(t.id) as never}>{t.label}</Badge>
                  <span className="text-xs text-fg-subtle">{t.description}</span>
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">{count}</p>
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader title="All leads" description="Sorted by most recent activity." />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {listingLeads.map((lead) => {
                const applicant = getApplicant(lead.applicantId);
                if (!applicant) return null;
                return (
                  <li key={lead.id} className="flex items-center gap-4 p-5 hover:bg-bg-sunken/40">
                    <Avatar name={applicant.name} src={applicant.avatar} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-fg truncate">{applicant.name}</p>
                        {applicant.trustBadge && (
                          <Badge tone="verified">
                            <Icon.ShieldCheck size={10} />
                            Trusted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-fg-muted">
                        {applicant.intent === "rent" ? "Renting" : "Buying"} · {applicant.city} · Source: {lead.source}
                      </p>
                    </div>
                    <Badge tone={tempTone(lead.temperature) as never}>{lead.temperature}</Badge>
                    <span className="text-xs text-fg-subtle whitespace-nowrap">
                      {formatRelativeTime(lead.lastActivityAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
