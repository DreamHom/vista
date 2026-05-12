import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { firstName, getSessionUser } from "@/lib/api/session-user";
import { getToken } from "@/lib/api/session";
import * as Listings from "@/lib/api/listings";
import * as Notifications from "@/lib/api/notifications";
import { listingFromApi } from "@/lib/api/adapters";
import { listingStatusLabel, listingStatusTone } from "@/lib/types";
import { formatCurrencyNGN, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Owner overview" };

export default async function OwnerOverviewPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/owner");
  const token = await getToken();
  if (!token) redirect("/login?next=/owner");
  const greet = firstName(me);

  const listingApis = await Listings.listAllOwnedListings(String(me.id), { page: 0, size: 100 }).catch(
    () => [],
  );
  const myListings = listingApis.map((l) => listingFromApi(l));
  const liveCount = myListings.filter((l) => l.backendStatus === "LIVE").length;
  const engagement = myListings.reduce(
    (acc, l) => ({
      saves: acc.saves + l.saves,
      inspections: acc.inspections + l.inspections,
    }),
    { saves: 0, inspections: 0 },
  );

  const notifPage = await Notifications.listMyNotifications(token, 0, 6).catch(
    () => ({
      content: [] as { id: string; title: string; body?: string; createdAt: string }[],
      page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
    }),
  );

  return (
    <>
      <PageHeader
        title={`Welcome back, ${greet}.`}
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
          <Stat
            label="Live listings"
            value={`${liveCount}`}
            icon={<Icon.Building size={14} />}
          />
          <Stat
            label="Saves (portfolio)"
            value={`${engagement.saves}`}
            icon={<Icon.Users size={14} />}
          />
          <Stat
            label="Inspections (pipeline)"
            value={`${engagement.inspections}`}
            icon={<Icon.Calendar size={14} />}
          />
          <Stat
            label="Open offers"
            value="—"
            icon={<Icon.Coin size={14} />}
          />
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
              {myListings.length === 0 ? (
                <p className="p-6 text-sm text-fg-muted">No listings yet — create one to get started.</p>
              ) : (
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
                            <Badge tone={listingStatusTone(l)}>
                              {listingStatusLabel(l)}
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
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Latest notifications" />
            <CardBody className="space-y-4">
              {notifPage.content.length === 0 ? (
                <p className="text-sm text-fg-muted">No recent notifications.</p>
              ) : (
                notifPage.content.map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Icon.Chat size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-fg">{n.title}</p>
                      {n.body ? (
                        <p className="text-xs text-fg-muted line-clamp-2">{n.body}</p>
                      ) : null}
                      <p className="text-[11px] text-fg-subtle mt-1">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
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
