import Link from "next/link";
import type { Agent } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <Avatar name={agent.name} src={agent.avatar} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-fg group-hover:text-brand">
              {agent.name}
            </h3>
            {agent.verified && <VerifiedBadge kind="agent" />}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{agent.headline}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-bg-sunken/50 p-3 text-center">
        <Stat
          label="Rating"
          value={`${agent.rating.toFixed(1)}`}
          sub={`${agent.reviews} reviews`}
        />
        <Stat
          label="Closed"
          value={`${agent.dealsClosed}`}
          sub="deals"
        />
        <Stat
          label="Replies"
          value={`${agent.responseRate}%`}
          sub={`~${agent.responseTimeMins}m`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {agent.areasCovered.slice(0, 3).map((area) => (
          <Badge key={area} tone="muted" leadingIcon={<Icon.Pin size={10} />}>
            {area}
          </Badge>
        ))}
        {agent.areasCovered.length > 3 && (
          <Badge tone="muted">+{agent.areasCovered.length - 3} more</Badge>
        )}
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold text-fg">{value}</p>
      <p className="text-[11px] text-fg-muted">{sub}</p>
    </div>
  );
}
