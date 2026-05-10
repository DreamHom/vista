import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { conversations, messages, agents, applicants } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

const me = applicants[0];

function nameFor(id: string) {
  return agents.find((a) => a.id === id)?.name ?? applicants.find((a) => a.id === id)?.name ?? "Unknown";
}
function avatarFor(id: string) {
  return (
    agents.find((a) => a.id === id)?.avatar ??
    applicants.find((a) => a.id === id)?.avatar
  );
}

export default function MessagesPage() {
  const myConversations = conversations.filter((c) => c.participantIds.includes(me.id));
  const active = myConversations[0];
  const thread = active
    ? messages.filter((m) => m.conversationId === active.id)
    : [];
  const partnerId = active
    ? active.participantIds.find((p) => p !== me.id)!
    : "";

  return (
    <>
      <PageHeader
        title="Messages"
        description="Everything stays on platform. Full history is dispute-ready."
      />
      <div className="px-6 lg:px-8 py-6">
        <div className="grid gap-0 rounded-2xl border border-border bg-bg-elevated overflow-hidden lg:grid-cols-[320px_1fr] min-h-[560px]">
          {/* list */}
          <aside className="border-r border-border">
            <div className="p-4 border-b border-border">
              <input
                placeholder="Search messages…"
                className="w-full h-9 rounded-full border border-border bg-bg-sunken px-3 text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <ul className="divide-y divide-border max-h-[480px] overflow-y-auto">
              {myConversations.map((c) => {
                const partner = c.participantIds.find((p) => p !== me.id)!;
                return (
                  <li
                    key={c.id}
                    className={
                      "flex items-start gap-3 p-4 cursor-pointer transition" +
                      (c.id === active?.id ? " bg-bg-sunken/60" : " hover:bg-bg-sunken/40")
                    }
                  >
                    <Avatar name={nameFor(partner)} src={avatarFor(partner)} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-fg truncate">
                          {nameFor(partner)}
                        </p>
                        <span className="text-[11px] text-fg-subtle">
                          {formatRelativeTime(c.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-fg-muted line-clamp-1">
                        {c.preview}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <Badge tone="brand" className="shrink-0">
                        {c.unread}
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* thread */}
          <section className="flex flex-col">
            {active ? (
              <>
                <header className="flex items-center gap-3 border-b border-border p-4">
                  <Avatar name={nameFor(partnerId)} src={avatarFor(partnerId)} size={36} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-fg">{nameFor(partnerId)}</p>
                    <p className="text-xs text-fg-muted">Verified agent · usually replies in 12m</p>
                  </div>
                  <Badge tone="muted">re: Lekki Phase 1</Badge>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {thread.map((m) => {
                    const mine = m.senderId === me.id;
                    return (
                      <div
                        key={m.id}
                        className={"flex " + (mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={
                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                            (mine
                              ? "bg-brand text-brand-fg rounded-br-sm"
                              : "bg-bg-sunken text-fg border border-border rounded-bl-sm")
                          }
                        >
                          <p>{m.body}</p>
                          <p
                            className={
                              "mt-1 text-[11px] " +
                              (mine ? "text-brand-fg/70" : "text-fg-subtle")
                            }
                          >
                            {formatRelativeTime(m.at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border p-3 flex items-center gap-2">
                  <input
                    placeholder="Send a message…"
                    className="flex-1 h-10 rounded-full bg-bg-sunken px-4 text-sm focus:outline-none focus:bg-bg-elevated focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-fg hover:bg-brand-hover"
                    aria-label="Send"
                  >
                    <Icon.ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <p className="m-auto text-sm text-fg-muted">No conversations yet.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
