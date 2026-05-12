import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";
import { formatCurrencyNGNFull } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · ads" };

export default async function AdminAdsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/ads");

  const page = await Listings.listListings({ page: 0, size: 4 }).catch(() => null);
  const featuredListings = page?.content?.length
    ? page.content.slice(0, 2).map((l) => listingFromApi(l))
    : [];

  return (
    <>
      <PageHeader
        title="Ads & featured placements"
        description="Approve, price and track promoted listings & featured-agent slots. Live listing sample below; campaigns API pending."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Active campaigns" value="—" icon={<Icon.Megaphone size={14} />} />
          <Stat
            label="Revenue (mtd)"
            value={formatCurrencyNGNFull(0)}
            icon={<Icon.Coin size={14} />}
          />
          <Stat label="Avg. CTR" value="—" icon={<Icon.Chart size={14} />} />
          <Stat label="Pending review" value="—" icon={<Icon.Shield size={14} />} />
        </div>

        <Card>
          <CardHeader
            title="Featured listings (sample from marketplace)"
            description="Boosted placements require a haven campaigns API."
          />
          <CardBody className="grid gap-4 md:grid-cols-2">
            {featuredListings.length === 0 ? (
              <p className="text-sm text-fg-muted md:col-span-2">No listings loaded.</p>
            ) : (
              featuredListings.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-bg-elevated p-3"
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-sunken">
                    <Image
                      src={l.photos[0]}
                      alt={l.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-fg truncate">{l.title}</p>
                    <p className="text-xs text-fg-muted">
                      {l.area}, {l.city}
                    </p>
                  </div>
                  <Badge tone="muted">sample</Badge>
                  <Button size="sm" variant="ghost" disabled>
                    Edit
                  </Button>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Featured agents"
            description="Agent promotion slots need a haven directory feed."
          />
          <CardBody>
            <p className="text-sm text-fg-muted">
              No agent campaign data from the API yet.
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
