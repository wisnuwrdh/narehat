import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    return NextResponse.redirect(`${origin}/api/auth/callback?code=${code}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
