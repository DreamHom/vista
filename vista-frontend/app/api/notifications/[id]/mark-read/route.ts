import { NextResponse } from "next/server";
import * as Notifications from "@/lib/api/notifications";
import { resolveNotificationHref } from "@/lib/api/notification-links";
import { getToken } from "@/lib/api/session";
import { getSessionUser } from "@/lib/api/session-user";
import { HavenError } from "@/lib/api/http";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      { status: 401, title: "Unauthorized" },
      { status: 401, headers: { "Content-Type": "application/problem+json" } },
    );
  }
  const { id } = await ctx.params;
  try {
    const updated = await Notifications.markNotificationRead(token, id);
    const me = await getSessionUser();
    return NextResponse.json({
      ...updated,
      href: resolveNotificationHref(updated, me?.role),
    });
  } catch (err) {
    if (err instanceof HavenError) {
      return NextResponse.json(err.problem, {
        status: err.status,
        headers: { "Content-Type": "application/problem+json" },
      });
    }
    return NextResponse.json(
      { status: 500, title: "Internal Server Error" },
      { status: 500, headers: { "Content-Type": "application/problem+json" } },
    );
  }
}
