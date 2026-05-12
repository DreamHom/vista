import { NextResponse } from "next/server";
import * as Notifications from "@/lib/api/notifications";
import { getToken } from "@/lib/api/session";

export async function GET() {
  const token = await getToken();
  if (!token) return NextResponse.json({ count: 0 });
  try {
    return NextResponse.json(await Notifications.getUnreadCount(token));
  } 
  catch {
    return NextResponse.json({ count: 0 });
  }
}
