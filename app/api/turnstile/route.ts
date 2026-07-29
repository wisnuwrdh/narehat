import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 })

  const remoteip = request.headers.get("x-forwarded-for") ?? undefined

  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET!,
      response: token,
      ...(remoteip ? { remoteip } : {}),
    }),
  })
  const data = (await r.json()) as { success: boolean }

  if (!data.success) return NextResponse.json({ error: "Verification failed" }, { status: 403 })

  return NextResponse.json({ ok: true })
}
