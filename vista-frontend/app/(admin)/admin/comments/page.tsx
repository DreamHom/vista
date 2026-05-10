import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { comments, listings } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · comments" };

export default function AdminCommentsPage() {
  return (
    <>
      <PageHeader
        title="Comment moderation"
        description="Public threads on listings. Owners and agents can reply but never comment first."
      />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader title={`${comments.length} active comments`} />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {comments.map((c) => {
                const l = listings.find((li) => li.id === c.listingId);
                return (
                  <li key={c.id} className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-fg-muted">
                        On <span className="font-medium text-fg">{l?.title}</span> · {formatRelativeTime(c.createdAt)}
                      </p>
                      <Badge tone="muted">{c.likes} likes · {c.replies.length} replies</Badge>
                    </div>
                    <p className="mt-2 text-sm text-fg leading-relaxed">{c.body}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" leadingIcon={<Icon.Flag size={14} />}>Flag</Button>
                      <Button size="sm" variant="ghost" leadingIcon={<Icon.Trash size={14} />}>Remove</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <p className="text-xs text-fg-subtle">
          We delete comments only when they violate community rules. Owners and agents
          cannot delete legitimate complaints about their own service.
        </p>
      </div>
    </>
  );
}
