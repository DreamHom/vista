import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { conversations, agents, applicants } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Owner · messages" };

function nameFor(id: string) {
  return agents.find((a) => a.id === id)?.name ?? applicants.find((a) => a.id === id)?.name ?? id;
}
function avatarFor(id: string) {
  return agents.find((a) => a.id === id)?.avatar ?? applicants.find((a) => a.id === id)?.avatar;
}

export default function OwnerMessagesPage() {
  return (
    <>
      <PageHeader
        title="Messages"
        description="In-app threads with applicants and agents. Everything is dispute-ready."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader title="Active conversations" />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {conversations.map((c) => {
                const partner = c.participantIds.find((p) => p !== "own_1") ?? c.participantIds[0];
                return (
                  <li key={c.id} className="flex items-center gap-4 p-5 hover:bg-bg-sunken/40 cursor-pointer">
                    <Avatar name={nameFor(partner)} src={avatarFor(partner)} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-fg truncate">{nameFor(partner)}</p>
                        <span className="text-[11px] text-fg-subtle">{formatRelativeTime(c.updatedAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-fg-muted line-clamp-1">{c.preview}</p>
                    </div>
                    {c.unread > 0 && <Badge tone="brand">{c.unread}</Badge>}
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
