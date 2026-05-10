import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { listings, leads, inspections, offers } from "@/lib/mock-data";
import { formatCurrencyNGN } from "@/lib/utils";

export const metadata: Metadata = { title: "Owner overview" };

const myListings = listings.filter((l) => l.ownerId === "own_1");

export default function OwnerOverviewPage() {
  return (
    <>
      <PageHeader
        title="Welcome back, Adaeze."
        description="Your listings, your pipeline, your numbers — all in one place."
        actions={
          <ButtonLink
            href="/owner/listings/new"
            leadingIcon={<Icon.Plus size={16} />}
          >
            New listing
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Live listings" value={`${myListings.length}`} delta="+1 this month" tone="positive" icon={<Icon.Building size={14} />} />
          <Stat label="Total leads" value={`${leads.length}`} delta="+4 this week" tone="positive" icon={<Icon.Users size={14} />} />
          <Stat label="Inspections" value={`${inspections.length}`} delta="3 this week" icon={<Icon.Calendar size={14} />} />
          <Stat label="Open offers" value={`${offers.length}`} delta="1 needs reply" tone="positive" icon={<Icon.Coin size={14} />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Your listings"
              description="Tap any listing to see leads, inspections and offers."
              action={
                <Link
                  href="/owner/listings"
                  className="text-sm font-medium text-brand hover:text-brand-hover"
                >
                  Manage all
                </Link>
              }
            />
            <CardBody className="p-0">
              <ul className="divide-y divide-border">
                {myListings.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/owner/listings/${l.id}`}
                      className="flex items-center gap-4 p-5 hover:bg-bg-sunken/40"
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
                        <p className="text-xs text-fg-muted truncate">
                          {l.area}, {l.city} · {l.bedrooms === 0 ? "Studio" : `${l.bedrooms} bed`} · {l.type}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge tone={l.status === "live" ? "success" : "muted"}>
                            {l.status.replace("_", " ")}
                          </Badge>
                          {l.documentsVerified && <VerifiedBadge kind="documents" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-fg">
                          {l.purpose === "rent"
                            ? `${formatCurrencyNGN(l.fees.rent ?? 0)}/yr`
                            : formatCurrencyNGN(l.fees.price ?? 0)}
                        </p>
                        <p className="text-xs text-fg-muted">
                          <Icon.Eye size={12} className="inline mr-1 -mt-0.5" />
                          {l.views.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Latest activity" />
            <CardBody className="space-y-4">
              {[
                {
                  icon: <Icon.Coin size={14} />,
                  title: "Counter-offer sent",
                  body: "₦6.3M to Daniel on the Lekki Phase 1 listing.",
                  ago: "2h ago",
                },
                {
                  icon: <Icon.Calendar size={14} />,
                  title: "Inspection booked",
                  body: "Thursday 10:00 — Lekki Phase 1 with Daniel.",
                  ago: "1d ago",
                },
                {
                  icon: <Icon.ShieldCheck size={14} />,
                  title: "Listing verified",
                  body: "Documents approved for the Sangotedo off-plan.",
                  ago: "3d ago",
                },
                {
                  icon: <Icon.Users size={14} />,
                  title: "Agent assigned",
                  body: "Ifeoma now manages the VI studio.",
                  ago: "5d ago",
                },
              ].map((a) => (
                <div key={a.title} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
                    {a.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-fg">{a.title}</p>
                    <p className="text-xs text-fg-muted">{a.body}</p>
                    <p className="text-[11px] text-fg-subtle">{a.ago}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
