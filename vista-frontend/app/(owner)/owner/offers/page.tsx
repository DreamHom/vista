import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { offers, listings, getApplicant } from "@/lib/mock-data";
import { formatCurrencyNGNFull, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "All offers" };

export default function OwnerOffersPage() {
  return (
    <>
      <PageHeader title="All offers" description="Active negotiations across every listing in your portfolio." />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        {offers.map((o) => {
          const l = listings.find((li) => li.id === o.listingId)!;
          const applicant = getApplicant(o.applicantId);
          const last = o.history[o.history.length - 1];
          return (
            <Card key={o.id}>
              <CardHeader
                title={
                  <div className="flex items-center gap-3">
                    {applicant && <Avatar name={applicant.name} src={applicant.avatar} size={32} />}
                    <div>
                      <p className="text-sm font-semibold">{applicant?.name}</p>
                      <p className="text-xs font-normal text-fg-muted">
                        on <Link href={`/owner/listings/${l.id}`} className="hover:text-brand">{l.title}</Link>
                      </p>
                    </div>
                  </div>
                }
                action={
                  <Badge tone={o.status === "accepted" ? "success" : o.status === "countered" ? "warn" : o.status === "rejected" ? "danger" : "brand"}>
                    {o.status}
                  </Badge>
                }
              />
              <CardBody>
                <p className="text-2xl font-semibold tracking-tight text-fg">
                  {formatCurrencyNGNFull(last.amount)}
                </p>
                <p className="text-xs text-fg-muted">
                  Last move {formatRelativeTime(last.at)} · {o.terms}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button leadingIcon={<Icon.Check size={14} />}>Accept</Button>
                  <Button variant="outline" leadingIcon={<Icon.Coin size={14} />}>Counter</Button>
                  <Button variant="ghost">Reject</Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
