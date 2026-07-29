import { createClient } from "@supabase/supabase-js"

export async function ensureUserProfile(userId: string, email: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (!existing) {
    await supabase.from("users").insert({
      id: userId,
      email: email || "",
      name: "User",
    })
  }
}
