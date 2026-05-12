import { NextRequest, NextResponse } from "next/server";
import * as Listings from "@/lib/api/listings";
import { getToken } from "@/lib/api/session";
import { HavenError } from "@/lib/api/http";

export async function POST(
  req: NextRequest,
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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { status: 400, title: "Bad Request", detail: "Expected multipart/form-data." },
      { status: 400, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { status: 400, title: "Validation failed", detail: "`file` is required." },
      { status: 400, headers: { "Content-Type": "application/problem+json" } },
    );
  }
  const caption = (form.get("caption") as string | null) ?? undefined;

  try {
    const photo = await Listings.uploadListingPhoto(token, id, file, caption);
    return NextResponse.json(photo, { status: 201 });
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
