"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { NotificationResponse, Page } from "@/lib/api/types";

const POLL_INTERVAL_MS = 30_000;

export function NotificationsBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // poll unread-count
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setCount(data.count ?? 0);
      } catch {
        // network blip — keep last value
      }
    }
    tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      return () => document.removeEventListener("mousedown", onClick);
    }
  }, [open]);

  async function loadList() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/mine?size=10", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as Page<NotificationResponse>;
        setItems(data.content ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}/mark-read`, { method: "POST" });
  }

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) void loadList();
      return next;
    });
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-elevated text-fg-muted hover:text-fg"
      >
        <Icon.Bell size={16} />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-fg">Notifications</p>
            {count > 0 ? <Badge tone="brand">{count} unread</Badge> : null}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-fg-muted">Loading…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-fg-muted">
                Nothing new. You&rsquo;re all caught up.
              </p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`border-b border-border last:border-0 ${
                      n.read ? "" : "bg-brand-soft/40"
                    }`}
                  >
                    <NotifLink
                      n={n}
                      onClick={() => {
                        if (!n.read) void markRead(n.id);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/dashboard"
            className="block border-t border-border bg-bg-sunken/40 px-4 py-2.5 text-center text-xs font-medium text-brand hover:text-brand-hover"
          >
            Open dashboard
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function NotifLink({
  n,
  onClick,
}: {
  n: NotificationResponse;
  onClick: () => void;
}) {
  const Inner = (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-bg-sunken/40">
      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-brand" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{n.title}</p>
        {n.body ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-fg-muted">{n.body}</p>
        ) : null}
        <p className="mt-1 text-[11px] text-fg-subtle">
          {formatRelativeTime(n.createdAt)}
        </p>
      </div>
    </div>
  );

  if (n.href) {
    return (
      <Link href={n.href} onClick={onClick} className="block">
        {Inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {Inner}
    </button>
  );
}
