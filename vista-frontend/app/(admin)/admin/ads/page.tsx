import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { listings, agents } from "@/lib/mock-data";
import { formatCurrencyNGNFull } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · ads" };

const featuredListings = listings.slice(0, 2);
const featuredAgents = agents.slice(0, 2);

export default function AdminAdsPage() {
  return (
    <>
      <PageHeader
        title="Ads & featured placements"
        description="Approve, price and track promoted listings & featured-agent slots."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Active campaigns" value="6" icon={<Icon.Megaphone size={14} />} />
          <Stat label="Revenue (mtd)" value={formatCurrencyNGNFull(2_400_000)} delta="+18% vs last" tone="positive" icon={<Icon.Coin size={14} />} />
          <Stat label="Avg. CTR" value="4.2%" icon={<Icon.Chart size={14} />} />
          <Stat label="Pending review" value="3" icon={<Icon.Shield size={14} />} />
        </div>

        <Card>
          <CardHeader title="Featured listings" description="Boosted in search and on the homepage." />
          <CardBody className="grid gap-4 md:grid-cols-2">
            {featuredListings.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-bg-elevated p-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-sunken">
                  <Image src={l.photos[0]} alt={l.title} fill className="object-cover" sizes="96px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-fg truncate">{l.title}</p>
                  <p className="text-xs text-fg-muted">
                    Slot A1 · 14 days · {formatCurrencyNGNFull(150_000)}
                  </p>
                </div>
                <Badge tone="success">live</Badge>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Featured agents" description="Surfaced on relevant area pages and Dream AI replies." />
          <CardBody className="grid gap-4 md:grid-cols-2">
            {featuredAgents.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border bg-bg-elevated p-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg-sunken">
                  <Image src={a.avatar} alt={a.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-fg truncate">{a.name}</p>
                  <p className="text-xs text-fg-muted">
                    Lekki area · 30 days · {formatCurrencyNGNFull(80_000)}
                  </p>
                </div>
                <Badge tone="success">live</Badge>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
