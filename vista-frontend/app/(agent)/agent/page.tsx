import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ListingCard } from "@/components/listings/listing-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { listings, offers, agents } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Agent overview" };

const me = agents[0];
const myListings = listings.filter((l) => l.agentId === me.id);

export default function AgentOverviewPage() {
  return (
    <>
      <PageHeader
        title={`Welcome back, ${me.name.split(" ")[0]}.`}
        description="Your week at a glance. Hot leads first, paperwork second, coffee in between."
        actions={
          <ButtonLink href="/agent/inspections" leadingIcon={<Icon.Calendar size={16} />}>
            Today&rsquo;s schedule
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Active listings" value={`${myListings.length}`} delta="across 3 owners" icon={<Icon.Building size={14} />} />
          <Stat label="Hot leads" value="6" delta="+2 this week" tone="positive" icon={<Icon.Chart size={14} />} />
          <Stat label="Inspections this week" value="4" delta="2 confirmed" icon={<Icon.Calendar size={14} />} />
          <Stat label="Open offers" value={`${offers.length}`} delta="1 needs reply" tone="positive" icon={<Icon.Coin size={14} />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Your active listings"
              description="Listings owners have assigned to you."
              action={
                <Link href="/agent/listings" className="text-sm font-medium text-brand hover:text-brand-hover">
                  See all
                </Link>
              }
            />
            <CardBody>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {myListings.slice(0, 3).map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Today" description="What&rsquo;s actually on the calendar." />
            <CardBody className="space-y-3">
              {[
                { time: "10:00", body: "Inspection with Daniel · Lekki Phase 1", tone: "brand" },
                { time: "12:30", body: "Counter-offer due · Lekki Phase 1", tone: "warn" },
                { time: "15:00", body: "New owner pitch · Halima Y.", tone: "muted" },
              ].map((item) => (
                <div key={item.body} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <span className="mt-0.5 text-xs font-mono text-fg-subtle w-12">{item.time}</span>
                  <p className="text-sm text-fg flex-1">{item.body}</p>
                  <Badge tone={item.tone as never} className="shrink-0">today</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
