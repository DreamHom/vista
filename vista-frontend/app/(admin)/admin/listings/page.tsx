import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { AdminListingActions } from "@/components/admin/admin-listing-actions";
import * as Listings from "@/lib/api/listings";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import { listingFromApi } from "@/lib/api/adapters";
import { listingStatusLabel, listingStatusTone } from "@/lib/types";

export const metadata: Metadata = { title: "Admin · listings" };

export default async function AdminListingsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/listings");

  let listings: ReturnType<typeof listingFromApi>[] = [];
  let error: string | null = null;
  try {
    const data = await Listings.listListings({ page: 0, size: 100 });
    listings = data.content.map((l) => listingFromApi(l));
  } catch (err) {
    if (err instanceof HavenError && err.status === 403) {
      redirect("/dashboard");
    }
    error = err instanceof Error ? err.message : "Could not load listings.";
  }

  const sorted = [...listings].sort((a, b) => b.views - a.views);

  return (
    <>
      <PageHeader
        title="Listing moderation"
        description="Approve, take down, override. Owners and assigned agents are notified."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader
            title={`${sorted.length} listings`}
            description="Most viewed first."
          />
          <CardBody className="p-0">
            {error ? (
              <div className="p-6 text-sm text-danger">{error}</div>
            ) : sorted.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No listings yet."
                  description="Once owners start publishing, they show up here."
                  icon={<Icon.Building size={20} />}
                />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-fg-subtle bg-bg-sunken/40">
                    <th className="px-5 py-3 font-medium">Listing</th>
                    <th className="px-5 py-3 font-medium">Verification</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Views</th>
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sorted.map((l) => (
                    <tr key={l.id} className="hover:bg-bg-sunken/40">
                      <td className="px-5 py-4">
                        <Link
                          href={`/listings/${l.id}`}
                          className="font-medium text-fg hover:text-brand"
                        >
                          {l.title}
                        </Link>
                        <p className="text-xs text-fg-muted">
                          {l.area}, {l.city}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {l.ownerVerified ? (
                            <VerifiedBadge kind="owner" />
                          ) : (
                            <Badge tone="muted">Owner unverified</Badge>
                          )}
                          {l.documentsVerified ? (
                            <VerifiedBadge kind="documents" />
                          ) : (
                            <Badge tone="warn">Docs pending</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={listingStatusTone(l)}>
                          {listingStatusLabel(l)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-fg-muted">
                        <Icon.Eye size={11} className="inline mr-1 -mt-0.5" />
                        {l.views.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <AdminListingActions listingId={l.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
