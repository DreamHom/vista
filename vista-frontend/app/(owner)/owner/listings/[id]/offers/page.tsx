import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import {
  getApplicant,
  getInspectionsFor,
  getLeadsFor,
  getOffersFor,
  getListing,
} from "@/lib/mock-data";
import { formatCurrencyNGNFull, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Offers" };

export default async function ListingOffersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const listingOffers = getOffersFor(listing.id);
  const listingLeads = getLeadsFor(listing.id);
  const listingInspections = getInspectionsFor(listing.id);

  return (
    <>
      <PageHeader
        title={`Offers · ${listing.title}`}
        description="Owner has the final say. If an agent is assigned, they present with their recommendation."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active={`/owner/listings/${listing.id}/offers`}
          items={[
            { href: `/owner/listings/${listing.id}`, label: "Overview" },
            { href: `/owner/listings/${listing.id}/leads`, label: "Leads", count: listingLeads.length },
            { href: `/owner/listings/${listing.id}/inspections`, label: "Inspections", count: listingInspections.length },
            { href: `/owner/listings/${listing.id}/offers`, label: "Offers", count: listingOffers.length },
          ]}
        />

        <div className="grid gap-6">
          {listingOffers.length === 0 && (
            <Card>
              <CardBody className="text-center text-sm text-fg-muted">
                No offers yet. Listings with verified docs receive offers ~3× faster.
              </CardBody>
            </Card>
          )}
          {listingOffers.map((o) => {
            const applicant = getApplicant(o.applicantId);
            return (
              <Card key={o.id}>
                <CardHeader
                  title={
                    <div className="flex items-center gap-3">
                      {applicant && (
                        <Avatar name={applicant.name} src={applicant.avatar} size={36} />
                      )}
                      <span>{applicant?.name ?? "Applicant"}</span>
                    </div>
                  }
                  description={`${o.terms} · submitted ${formatRelativeTime(o.createdAt)}`}
                  action={
                    <Badge
                      tone={
                        o.status === "accepted"
                          ? "success"
                          : o.status === "countered"
                            ? "warn"
                            : o.status === "rejected"
                              ? "danger"
                              : "brand"
                      }
                    >
                      {o.status}
                    </Badge>
                  }
                />
                <CardBody>
                  <ul className="rounded-xl border border-border divide-y divide-border">
                    {o.history.map((h, i) => (
                      <li key={i} className="flex items-start justify-between gap-4 p-4">
                        <div className="flex items-start gap-3">
                          <span
                            className={
                              "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold " +
                              (h.by === "applicant"
                                ? "bg-bg-sunken text-fg"
                                : h.by === "owner"
                                  ? "bg-brand text-brand-fg"
                                  : "bg-accent text-accent-fg")
                            }
                          >
                            {h.by === "applicant" ? "A" : h.by === "owner" ? "OW" : "AG"}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-fg">
                              {formatCurrencyNGNFull(h.amount)}
                            </p>
                            {h.note && (
                              <p className="mt-0.5 text-xs text-fg-muted">{h.note}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-fg-subtle">{formatRelativeTime(h.at)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" leadingIcon={<Icon.Check size={14} />}>
                      Accept latest
                    </Button>
                    <Button variant="outline" leadingIcon={<Icon.Coin size={14} />}>
                      Counter
                    </Button>
                    <Button variant="ghost" leadingIcon={<Icon.X size={14} />}>
                      Reject
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
