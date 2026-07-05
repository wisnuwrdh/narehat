import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({
    message: "AI consult endpoint (premium, RAG)",
    response: null,
  });
}
