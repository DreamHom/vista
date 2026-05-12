import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ListingCard } from "@/components/listings/listing-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { firstName, getSessionUser } from "@/lib/api/session-user";
import { getToken } from "@/lib/api/session";
import * as Assignments from "@/lib/api/agent-assignments";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";

export const metadata: Metadata = { title: "Agent overview" };

export default async function AgentOverviewPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/agent");
  const token = await getToken();
  if (!token) redirect("/login?next=/agent");
  const greet = firstName(me);

  const assignments = await Assignments.listMyAssignments(token).catch(() => []);
  const accepted = assignments.filter((a) => a.status === "ACCEPTED");
  const listingIds = [...new Set(accepted.map((a) => a.listingId))];

  const listingRows = await Promise.all(
    listingIds.slice(0, 12).map(async (id) => {
      const api = await Listings.getListing(id).catch(() => null);
      const photos = api
        ? await Listings.getListingPhotos(id).catch(() => [])
        : [];
      return api ? listingFromApi(api, photos) : null;
    }),
  );
  const myListings = listingRows.filter(Boolean) as ReturnType<typeof listingFromApi>[];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${greet}.`}
        description="Your week at a glance. Hot leads first, paperwork second, coffee in between."
        actions={
          <ButtonLink href="/agent/inspections" leadingIcon={<Icon.Calendar size={16} />}>
            Inspections
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat
            label="Assigned listings"
            value={`${accepted.length}`}
            icon={<Icon.Building size={14} />}
          />
          <Stat
            label="Assignments (all states)"
            value={`${assignments.length}`}
            icon={<Icon.Chart size={14} />}
          />
          <Stat
            label="Active inspections"
            value="—"
            icon={<Icon.Calendar size={14} />}
          />
          <Stat
            label="Open offers (on your listings)"
            value="—"
            icon={<Icon.Coin size={14} />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Your active listings"
              description="Listings owners have assigned to you (accepted)."
              action={
                <Link href="/agent/listings" className="text-sm font-medium text-brand hover:text-brand-hover">
                  See all
                </Link>
              }
            />
            <CardBody>
              {myListings.length === 0 ? (
                <EmptyState
                  title="No accepted assignments yet"
                  description="When owners invite you and you accept, listings appear here."
                  icon={<Icon.Building size={20} />}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {myListings.slice(0, 6).map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Assignments" description="Invitation pipeline." />
            <CardBody className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-sm text-fg-muted">No assignment activity yet.</p>
              ) : (
                assignments.slice(0, 8).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-fg truncate">
                        {a.listingTitle ?? `Listing ${a.listingId}`}
                      </p>
                      <p className="text-xs text-fg-muted mt-0.5">
                        {a.ownerName ? `Owner: ${a.ownerName}` : null}
                      </p>
                    </div>
                    <Badge tone={a.status === "ACCEPTED" ? "success" : "muted"}>
                      {a.status.toLowerCase()}
                    </Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
