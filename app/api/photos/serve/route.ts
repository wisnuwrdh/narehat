/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return new NextResponse("Missing key", { status: 400 });
  }

  const env = getCloudflareContext().env as any;
  const wantThumb = request.nextUrl.searchParams.get("thumb") === "1";

  let object = await env.R2_BUCKET.get(key);
  if (wantThumb) {
    const thumb = await env.R2_BUCKET.get(`${key}.thumb`);
    if (thumb) object = thumb;
  }

  if (!object) {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || "image/webp");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(object.body as ReadableStream, { headers });
}