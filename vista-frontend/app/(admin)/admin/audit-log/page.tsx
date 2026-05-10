import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auditLog } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · audit log" };

const tone = (action: string) => {
  if (action.startsWith("VERIFY")) return "verified";
  if (action.startsWith("PROMOTE")) return "accent";
  if (action.startsWith("TAKEDOWN") || action.startsWith("SUSPEND")) return "danger";
  return "muted";
};

export default function AuditLogPage() {
  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every admin action, with actor, target and timestamp. Immutable, exportable, dispute-ready."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader title={`${auditLog.length} entries`} description="Newest first." />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {auditLog.map((a) => (
                <li key={a.id} className="flex items-start gap-4 p-5">
                  <Badge tone={tone(a.action) as never}>{a.action}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{a.target}</p>
                    {a.meta && <p className="text-xs text-fg-muted">{a.meta}</p>}
                    <p className="text-[11px] text-fg-subtle">
                      {a.actor} · {formatRelativeTime(a.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
