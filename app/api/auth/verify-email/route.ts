import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("verify_token", token)
    .gte("verify_token_expiry", new Date().toISOString())
    .maybeSingle();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_or_expired", req.url));
  }

  await supabase
    .from("users")
    .update({ email_verified: true, verify_token: null, verify_token_expiry: null })
    .eq("id", user.id);

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
