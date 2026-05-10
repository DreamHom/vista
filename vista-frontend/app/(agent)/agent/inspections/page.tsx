import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { inspections, listings, getApplicant } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Agent · inspections" };

const tone = (s: string) =>
  s === "booked" ? "success" : s === "completed" ? "muted" : s === "no_show" ? "danger" : s === "cancelled" ? "warn" : "brand";

export default function AgentInspectionsPage() {
  return (
    <>
      <PageHeader title="Inspections calendar" description="Every visit across every listing you manage." />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader title="All slots" />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {inspections.map((ins) => {
                const l = listings.find((li) => li.id === ins.listingId)!;
                const a = ins.applicantId ? getApplicant(ins.applicantId) : undefined;
                return (
                  <li key={ins.id} className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-14 flex-col items-center justify-center rounded-xl bg-bg-sunken text-center">
                      <span className="text-[11px] uppercase tracking-wide text-fg-subtle">
                        {new Date(ins.date).toLocaleString("en-NG", { month: "short" })}
                      </span>
                      <span className="text-lg font-semibold text-fg">{new Date(ins.date).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg">
                        <Link href={`/listings/${l.id}`} className="hover:text-brand">{l.title}</Link>
                      </p>
                      <p className="text-xs text-fg-muted">
                        {new Date(ins.date).toLocaleString("en-NG", { weekday: "long", hour: "numeric", minute: "2-digit" })}{" "}· {ins.durationMins} mins{a ? ` · with ${a.name}` : " · open slot"}
                      </p>
                    </div>
                    {a && <Avatar name={a.name} src={a.avatar} size={28} />}
                    <Badge tone={tone(ins.status) as never}>{ins.status.replace("_", " ")}</Badge>
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
