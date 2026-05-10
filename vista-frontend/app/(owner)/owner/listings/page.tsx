import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { listings } from "@/lib/mock-data";
import { formatCurrencyNGN } from "@/lib/utils";

export const metadata: Metadata = { title: "Owner · listings" };

const myListings = listings.filter((l) => l.ownerId === "own_1");

export default function OwnerListingsPage() {
  return (
    <>
      <PageHeader
        title="Your listings"
        description="Each listing has its own pipeline — leads, inspections, offers."
        actions={
          <ButtonLink href="/owner/listings/new" leadingIcon={<Icon.Plus size={16} />}>
            New listing
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-fg-subtle bg-bg-sunken/40">
                  <th className="px-5 py-3 font-medium">Listing</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Pipeline</th>
                  <th className="px-5 py-3 font-medium">Performance</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myListings.map((l) => (
                  <tr key={l.id} className="hover:bg-bg-sunken/40">
                    <td className="px-5 py-4">
                      <Link href={`/owner/listings/${l.id}`} className="flex items-center gap-3 group">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-bg-sunken">
                          <Image
                            src={l.photos[0]}
                            alt={l.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-fg group-hover:text-brand truncate">
                            {l.title}
                          </p>
                          <p className="text-xs text-fg-muted truncate">
                            {l.area}, {l.city}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge tone={l.status === "live" ? "success" : "muted"}>
                          {l.status.replace("_", " ")}
                        </Badge>
                        {l.documentsVerified ? (
                          <VerifiedBadge kind="documents" />
                        ) : (
                          <Badge tone="warn">Docs pending</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-fg-muted">
                      <span className="inline-flex items-center gap-3 text-xs">
                        <span><Icon.Bookmark size={11} className="inline mr-1 -mt-0.5" />{l.saves}</span>
                        <span><Icon.Calendar size={11} className="inline mr-1 -mt-0.5" />{l.inspections}</span>
                        <span><Icon.Chat size={11} className="inline mr-1 -mt-0.5" />{l.comments}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-fg-muted text-xs">
                      <span><Icon.Eye size={11} className="inline mr-1 -mt-0.5" />{l.views.toLocaleString()} views</span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-fg">
                      {l.purpose === "rent"
                        ? `${formatCurrencyNGN(l.fees.rent ?? 0)}/yr`
                        : formatCurrencyNGN(l.fees.price ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
