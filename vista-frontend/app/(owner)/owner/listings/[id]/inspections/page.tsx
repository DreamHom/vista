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

export const metadata: Metadata = { title: "Inspections" };

const tone = (s: string) =>
  s === "booked" ? "success" : s === "completed" ? "muted" : s === "no_show" ? "danger" : s === "cancelled" ? "warn" : "brand";

export default async function ListingInspectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const listingInspections = getInspectionsFor(listing.id);
  const listingLeads = getLeadsFor(listing.id);
  const listingOffers = getOffersFor(listing.id);

  return (
    <>
      <PageHeader
        title={`Inspections · ${listing.title}`}
        description="Manage open slots, confirm bookings, log post-inspection notes."
        actions={<Button leadingIcon={<Icon.Plus size={14} />}>Add slot</Button>}
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <PillTabs
          active={`/owner/listings/${listing.id}/inspections`}
          items={[
            { href: `/owner/listings/${listing.id}`, label: "Overview" },
            { href: `/owner/listings/${listing.id}/leads`, label: "Leads", count: listingLeads.length },
            { href: `/owner/listings/${listing.id}/inspections`, label: "Inspections", count: listingInspections.length },
            { href: `/owner/listings/${listing.id}/offers`, label: "Offers", count: listingOffers.length },
          ]}
        />

        <Card>
          <CardHeader title="All slots" description="Conflict prevention is on — two applicants can't book the same time." />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {listingInspections.map((ins) => {
                const applicant = ins.applicantId ? getApplicant(ins.applicantId) : undefined;
                return (
                  <li key={ins.id} className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-14 flex-col items-center justify-center rounded-xl bg-bg-sunken text-center">
                      <span className="text-[11px] uppercase tracking-wide text-fg-subtle">
                        {new Date(ins.date).toLocaleString("en-NG", { month: "short" })}
                      </span>
                      <span className="text-lg font-semibold text-fg">
                        {new Date(ins.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-fg">
                        {new Date(ins.date).toLocaleString("en-NG", {
                          weekday: "long",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}· {ins.durationMins} mins
                      </p>
                      {applicant ? (
                        <div className="mt-1 flex items-center gap-2 text-xs text-fg-muted">
                          <Avatar name={applicant.name} src={applicant.avatar} size={20} />
                          {applicant.name}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-fg-muted">Open slot</p>
                      )}
                      {ins.notes && (
                        <p className="mt-2 text-xs italic text-fg-muted">&ldquo;{ins.notes}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={tone(ins.status) as never}>{ins.status.replace("_", " ")}</Badge>
                      {ins.status === "booked" && <Button size="sm" variant="outline">Reschedule</Button>}
                      {ins.status === "completed" && <Button size="sm" variant="outline">Edit notes</Button>}
                    </div>
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
