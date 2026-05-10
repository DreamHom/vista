import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { leads, listings, getApplicant } from "@/lib/mock-data";
import { LEAD_TEMPERATURES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "All leads" };

const tempTone = (t: string) => (t === "hot" ? "danger" : t === "warm" ? "warn" : "muted");

export default function AllLeadsPage() {
  return (
    <>
      <PageHeader
        title="All leads · across listings"
        description="Roll-up of every applicant interacting with your portfolio. Hot first."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {LEAD_TEMPERATURES.map((t) => {
            const c = leads.filter((l) => l.temperature === t.id).length;
            return (
              <div key={t.id} className="rounded-2xl border border-border bg-bg-elevated p-5">
                <Badge tone={tempTone(t.id) as never}>{t.label}</Badge>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">{c}</p>
                <p className="text-xs text-fg-subtle">{t.description}</p>
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader title="Recent leads" description="Sorted by last activity." />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {leads.map((l) => {
                const applicant = getApplicant(l.applicantId);
                const listing = listings.find((li) => li.id === l.listingId);
                if (!applicant || !listing) return null;
                return (
                  <li key={l.id} className="flex items-center gap-4 p-5">
                    <Avatar name={applicant.name} src={applicant.avatar} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-fg truncate">{applicant.name}</p>
                      <p className="text-xs text-fg-muted truncate">
                        Looking at <Link href={`/owner/listings/${listing.id}`} className="hover:text-brand">{listing.title}</Link>
                      </p>
                    </div>
                    <Badge tone={tempTone(l.temperature) as never}>{l.temperature}</Badge>
                    <span className="text-xs text-fg-subtle whitespace-nowrap">
                      {formatRelativeTime(l.lastActivityAt)}
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
