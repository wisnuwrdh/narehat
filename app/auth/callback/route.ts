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
      const { data: profile } = await supabase
        .from("users")
        .select("skin_type,acne_severity,goal")
        .eq("id", user.id)
        .maybeSingle();

      const needsOnboarding = !profile
        || (profile.skin_type === "combination"
            && profile.acne_severity === "mild"
            && profile.goal === "clear_acne");

      if (needsOnboarding) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      await supabase.auth.updateUser({ data: { onboarding_completed: true } });
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
