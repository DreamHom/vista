import { NextRequest, NextResponse } from "next/server";
import * as Notifications from "@/lib/api/notifications";
import { resolveNotificationHref } from "@/lib/api/notification-links";
import { getToken } from "@/lib/api/session";
import { getSessionUser } from "@/lib/api/session-user";
import { HavenError } from "@/lib/api/http";

export async function GET(req: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      {
        content: [],
        page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
      },
      { status: 200 },
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 0);
  const size = Number(searchParams.get("size") ?? 20);

  try {
    const data = await Notifications.listMyNotifications(token, page, size);
    const me = await getSessionUser();
    return NextResponse.json({
      ...data,
      content: data.content.map((item) => ({
        ...item,
        href: resolveNotificationHref(item, me?.role),
      })),
    });
  } catch (err) {
    if (err instanceof HavenError) {
      return NextResponse.json(err.problem, {
        status: err.status,
        headers: { "Content-Type": "application/problem+json" },
      });
    }
    return NextResponse.json(
      {
        status: 500,
        title: "Internal Server Error",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500, headers: { "Content-Type": "application/problem+json" } },
    );
  }
}
