import { NextRequest, NextResponse } from "next/server";
import * as Listings from "@/lib/api/listings";
import {
  handleRouteError,
  problemJson,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const photos = await Listings.getListingPhotos(id);
    return NextResponse.json(photos);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { id } = await ctx.params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return problemJson(400, "Bad Request", "Expected multipart/form-data.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return problemJson(400, "Validation failed", "`file` is required.");
  }
  const caption = (form.get("caption") as string | null) ?? undefined;

  try {
    const photo = await Listings.uploadListingPhoto(token, id, file, caption);
    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
