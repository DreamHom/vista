import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { getSessionUser } from "@/lib/api/session-user";
import { getToken } from "@/lib/api/session";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";
import { LEAD_TEMPERATURES } from "@/lib/constants";

export const metadata: Metadata = { title: "All leads" };

const tempTone = (t: string) => (t === "hot" ? "danger" : t === "warm" ? "warn" : "muted");

export default async function AllLeadsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/owner/leads");
  const token = await getToken();
  if (!token) redirect("/login?next=/owner/leads");

  const portfolio = await Listings.listAllOwnedListings(String(me.id), { page: 0, size: 100 }).catch(
    () => [],
  );
  const rows = portfolio.map((l) => listingFromApi(l));
  const hot = rows.filter((l) => (l.saves ?? 0) >= 5).length;
  const warm = rows.filter((l) => {
    const s = l.saves ?? 0;
    return s >= 1 && s < 5;
  }).length;
  const cold = rows.filter((l) => (l.saves ?? 0) === 0).length;

  return (
    <>
      <PageHeader
        title="All leads · across listings"
        description="Engagement from saves on your live listings. Open a listing for inspections and offers."
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
          <CardHeader title="Your listings" description="Saves indicate interest; open a row for the full pipeline." />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {rows.length === 0 ? (
                <li className="p-5 text-sm text-fg-muted">No listings yet.</li>
              ) : (
                rows.map((l) => (
                  <li key={l.id} className="flex items-center gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-fg truncate">
                        <Link href={`/owner/listings/${l.id}/leads`} className="hover:text-brand">
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
                      href={`/owner/listings/${l.id}/leads`}
                      className="text-xs font-medium text-brand hover:text-brand-hover inline-flex items-center gap-1"
                    >
                      Pipeline <Icon.ArrowRight size={12} />
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
