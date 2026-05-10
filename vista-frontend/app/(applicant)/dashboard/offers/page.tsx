import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { offers, listings } from "@/lib/mock-data";
import { formatCurrencyNGNFull, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "My offers" };

const toneFor = (status: string) =>
  status === "accepted"
    ? "success"
    : status === "rejected" || status === "withdrawn"
      ? "danger"
      : status === "countered"
        ? "warn"
        : "brand";

export default function OffersPage() {
  return (
    <>
      <PageHeader
        title="Offers"
        description="Your live negotiations. Counter freely — every move is logged."
      />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        {offers.map((o) => {
          const l = listings.find((li) => li.id === o.listingId);
          return (
            <Card key={o.id}>
              <CardHeader
                title={
                  <Link href={`/listings/${l?.id}`} className="hover:text-brand">
                    {l?.title}
                  </Link>
                }
                description={`Submitted ${formatRelativeTime(o.createdAt)} · ${o.terms}`}
                action={<Badge tone={toneFor(o.status) as never}>{o.status}</Badge>}
              />
              <CardBody>
                <div className="rounded-xl border border-border bg-bg-sunken/40">
                  {o.history.map((h, i) => (
                    <div
                      key={i}
                      className={
                        "flex items-start gap-4 p-4" +
                        (i !== 0 ? " border-t border-border" : "")
                      }
                    >
                      <span
                        className={
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                          (h.by === "applicant"
                            ? "bg-brand text-brand-fg"
                            : h.by === "owner"
                              ? "bg-accent text-accent-fg"
                              : "bg-fg text-fg-inverse")
                        }
                      >
                        {h.by === "applicant" ? "You" : h.by === "owner" ? "OW" : "AG"}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-fg">
                            {formatCurrencyNGNFull(h.amount)}
                          </p>
                          <p className="text-xs text-fg-subtle">{formatRelativeTime(h.at)}</p>
                        </div>
                        {h.note && (
                          <p className="mt-1 text-sm text-fg-muted leading-relaxed">{h.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button leadingIcon={<Icon.Coin size={14} />}>Counter</Button>
                  <Button variant="outline" leadingIcon={<Icon.Check size={14} />}>
                    Accept latest
                  </Button>
                  <Button variant="ghost" leadingIcon={<Icon.X size={14} />}>
                    Withdraw
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
