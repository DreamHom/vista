import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";
import * as Listings from "@/lib/api/listings";
import * as Comments from "@/lib/api/comments";
import { HavenError } from "@/lib/api/http";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · comments" };

type Row = { id: string; listingId: string; listingTitle: string; body: string; createdAt: string };

export default async function AdminCommentsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/admin/comments");

  let rows: Row[] = [];
  let error: string | null = null;
  try {
    const page = await Listings.listListings({ page: 0, size: 12 });
    const nested = await Promise.all(
      page.content.map(async (l) => {
        const list = await Comments.listListingComments(l.id).catch(() => []);
        return list.map((c) => ({
          id: c.id,
          listingId: l.id,
          listingTitle: l.title,
          body: c.body,
          createdAt: c.createdAt,
        }));
      }),
    );
    rows = nested.flat().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 40);
  } catch (e) {
    if (e instanceof HavenError && e.status === 403) redirect("/dashboard");
    error = e instanceof Error ? e.message : "Could not load comments.";
  }

  return (
    <>
      <PageHeader
        title="Comment moderation"
        description="Public threads on listings. Pulled live from haven per listing."
      />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader title={`${rows.length} recent comments (sampled listings)`} />
          <CardBody className="p-0">
            {error ? (
              <div className="p-6 text-sm text-danger">{error}</div>
            ) : rows.length === 0 ? (
              <div className="p-6 text-sm text-fg-muted">No comments found in the sampled listings.</div>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((c) => (
                  <li key={c.id} className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-fg-muted">
                        On{" "}
                        <Link href={`/listings/${c.listingId}`} className="font-medium text-fg hover:text-brand">
                          {c.listingTitle}
                        </Link>{" "}
                        · {formatRelativeTime(c.createdAt)}
                      </p>
                      <Badge tone="muted">public</Badge>
                    </div>
                    <p className="mt-2 text-sm text-fg leading-relaxed">{c.body}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" leadingIcon={<Icon.Flag size={14} />}>
                        Flag
                      </Button>
                      <Button size="sm" variant="ghost" leadingIcon={<Icon.Trash size={14} />}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <p className="text-xs text-fg-subtle">
          Comments are read-only aggregates here; deletion flows through haven when wired to
          admin actions.
        </p>
      </div>
    </>
  );
}
