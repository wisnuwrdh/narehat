import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ photos: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ message: "Photo uploaded", body }, { status: 201 });
}
