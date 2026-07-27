import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "mywisnuwardhana@gmail.com";
      if (user.email === adminEmail) {
        await supabase.from("users").update({ role: "admin" }).eq("id", user.id).catch(() => {});
      }

      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      const needsOnboarding = !profile || !profile.onboarding_completed;

      if (needsOnboarding) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      await supabase.auth.updateUser({ data: { onboarding_completed: true } });
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
