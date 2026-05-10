import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { ListingCard } from "@/components/listings/listing-card";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { listings, inspections, offers } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const recommended = listings.slice(0, 3);
const myInspections = inspections.slice(0, 2);
const myOffers = offers.slice(0, 1);

export default function ApplicantDashboardPage() {
  return (
    <>
      <PageHeader
        title="Hi Daniel — pick up where you left off."
        description="Your saved homes, scheduled inspections and live offers in one calm place."
        actions={
          <ButtonLink href="/listings" trailingIcon={<Icon.ArrowRight size={16} />}>
            Browse listings
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Saved" value="8" delta="+2 this week" tone="positive" icon={<Icon.Bookmark size={14} />} />
          <Stat label="Inspections" value="2" delta="1 this Thursday" icon={<Icon.Calendar size={14} />} />
          <Stat label="Open offers" value="1" delta="counter received" tone="positive" icon={<Icon.Coin size={14} />} />
          <Stat label="Messages" value="3" delta="2 unread" tone="positive" icon={<Icon.Chat size={14} />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Recommended for you" description="Based on your saves and Dream AI sessions." />
            <CardBody>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {recommended.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Upcoming inspections" />
              <CardBody className="space-y-4">
                {myInspections.map((ins) => {
                  const l = listings.find((li) => li.id === ins.listingId);
                  return (
                    <div key={ins.id} className="rounded-xl border border-border bg-bg-sunken/40 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-fg">{l?.title}</p>
                        <Badge tone={ins.status === "booked" ? "success" : "warn"}>{ins.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-fg-muted">
                        {new Date(ins.date).toLocaleString("en-NG", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Active offers" />
              <CardBody className="space-y-3">
                {myOffers.map((o) => {
                  const l = listings.find((li) => li.id === o.listingId);
                  return (
                    <div key={o.id} className="rounded-xl border border-border bg-bg-sunken/40 p-4">
                      <p className="text-sm font-semibold text-fg">{l?.title}</p>
                      <p className="mt-1 text-xs text-fg-muted">
                        Status: <span className="font-medium text-fg">{o.status}</span> ·{" "}
                        {formatRelativeTime(o.history[o.history.length - 1].at)}
                      </p>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
