import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ logs: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ message: "Log created", body }, { status: 201 });
}
