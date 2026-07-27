import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string }
) {
  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr && !selErr.message.includes("not found")) {
    console.error("ensureUserProfile select error:", selErr.message);
  }

  if (!existing) {
    const { error: insErr } = await supabase.from("users").insert({
      id: user.id,
      email: user.email || "",
      name: "User",
    });

    if (insErr) {
      console.error("ensureUserProfile insert error:", insErr.message);
    }
  }
}
