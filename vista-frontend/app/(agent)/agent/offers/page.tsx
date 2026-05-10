import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { offers, listings, getApplicant } from "@/lib/mock-data";
import { formatCurrencyNGNFull, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Agent · offers" };

export default function AgentOffersPage() {
  return (
    <>
      <PageHeader
        title="Offers I'm presenting"
        description="You recommend, the owner decides. Add notes to help the call go faster."
      />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        {offers.map((o) => {
          const l = listings.find((li) => li.id === o.listingId)!;
          const applicant = getApplicant(o.applicantId);
          const last = o.history[o.history.length - 1];
          return (
            <Card key={o.id}>
              <CardHeader
                title={
                  <div>
                    <p className="text-sm font-semibold">{applicant?.name}</p>
                    <p className="text-xs font-normal text-fg-muted">
                      on <Link href={`/listings/${l.id}`} className="hover:text-brand">{l.title}</Link>
                    </p>
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
                <div className="mt-4 rounded-xl bg-bg-sunken/50 p-3 text-xs text-fg-muted border border-border">
                  <span className="font-semibold text-fg">Your recommendation: </span>
                  Strong applicant, Moniepoint pre-approved. Consider accepting at ₦6.3M.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button leadingIcon={<Icon.Coin size={14} />}>Counter for owner</Button>
                  <Button variant="outline" leadingIcon={<Icon.Chat size={14} />}>Message owner</Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
