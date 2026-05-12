import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";
import * as Assignments from "@/lib/api/agent-assignments";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";
import { LEAD_TEMPERATURES } from "@/lib/constants";

export const metadata: Metadata = { title: "Leads" };

const tempTone = (t: string) => (t === "hot" ? "danger" : t === "warm" ? "warn" : "muted");

export default async function AgentLeadsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/agent/leads");

  const assignments = await Assignments.listMyAssignments(token).catch(() => []);
  const accepted = assignments.filter((a) => a.status === "ACCEPTED");
  const listingIds = [...new Set(accepted.map((a) => a.listingId))];

  const rows = (
    await Promise.all(
      listingIds.map(async (id) => {
        const api = await Listings.getListing(id).catch(() => null);
        if (!api) return null;
        const photos = await Listings.getListingPhotos(id).catch(() => []);
        return listingFromApi(api, photos);
      }),
    )
  ).filter(Boolean) as ReturnType<typeof listingFromApi>[];

  const hot = rows.filter((l) => (l.saves ?? 0) >= 5).length;
  const warm = rows.filter((l) => {
    const s = l.saves ?? 0;
    return s >= 1 && s < 5;
  }).length;
  const cold = rows.filter((l) => (l.saves ?? 0) === 0).length;

  return (
    <>
      <PageHeader
        title="Leads · assigned listings"
        description="Engagement on listings you manage for owners."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {LEAD_TEMPERATURES.map((t) => {
            const c = t.id === "hot" ? hot : t.id === "warm" ? warm : cold;
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
          <CardHeader title="Listings" description="Saves and comments as interest signals." />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {rows.length === 0 ? (
                <li className="p-5 text-sm text-fg-muted">No accepted assignments yet.</li>
              ) : (
                rows.map((l) => (
                  <li key={l.id} className="flex items-center gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-fg truncate">
                        <Link href={`/listings/${l.id}`} className="hover:text-brand">
                          {l.title}
                        </Link>
                      </p>
                      <p className="text-xs text-fg-muted">
                        {l.saves} saves · {l.inspections} inspections · {l.comments} comments
                      </p>
                    </div>
                    <Badge
                      tone={
                        (l.saves ?? 0) >= 5
                          ? "danger"
                          : (l.saves ?? 0) >= 1
                            ? "warn"
                            : "muted"
                      }
                    >
                      {(l.saves ?? 0) >= 5 ? "hot" : (l.saves ?? 0) >= 1 ? "warm" : "cold"}
                    </Badge>
                    <Link
                      href={`/listings/${l.id}`}
                      className="text-xs font-medium text-brand hover:text-brand-hover inline-flex items-center gap-1"
                    >
                      View <Icon.ArrowRight size={12} />
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
