import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createDBClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const session = await auth()

  if (!session?.user) {
    return NextResponse.redirect(`${origin}/login?error=not_authenticated`)
  }

  const supabase = createDBClient()
  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_completed")
    .eq("id", session.user.id)
    .maybeSingle()

  const needsOnboarding = !profile || !profile.onboarding_completed

  if (needsOnboarding) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
