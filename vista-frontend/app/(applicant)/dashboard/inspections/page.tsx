import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { inspections, listings } from "@/lib/mock-data";

export const metadata: Metadata = { title: "My inspections" };

export default function InspectionsPage() {
  return (
    <>
      <PageHeader
        title="Inspections"
        description="Every property visit you've booked, completed or missed. Two no-shows in 60 days pause your privileges — keep this clean."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader
            title="All inspections"
            description="Sorted by date, most recent first."
            action={
              <Badge tone="brand">
                <Icon.Calendar size={12} />
                {inspections.length} total
              </Badge>
            }
          />
          <CardBody className="p-0">
            <div className="divide-y divide-border">
              {inspections.map((ins) => {
                const l = listings.find((li) => li.id === ins.listingId);
                const tone =
                  ins.status === "booked"
                    ? "success"
                    : ins.status === "completed"
                      ? "muted"
                      : ins.status === "no_show"
                        ? "danger"
                        : ins.status === "cancelled"
                          ? "warn"
                          : "brand";
                return (
                  <div
                    key={ins.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-fg truncate">{l?.title}</p>
                      <p className="text-xs text-fg-muted">
                        {new Date(ins.date).toLocaleString("en-NG", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · {ins.durationMins} mins
                      </p>
                      {ins.notes && (
                        <p className="mt-2 text-xs text-fg-muted italic">
                          &ldquo;{ins.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={tone as never}>{ins.status.replace("_", " ")}</Badge>
                      {ins.status === "booked" && (
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <p className="mt-6 text-xs text-fg-subtle">
          Heads-up: inspection requests trigger a real-time notification to the assigned
          agent (or self-managing owner) via Kafka. Most replies land within their stated
          response time.
        </p>
      </div>
    </>
  );
}
