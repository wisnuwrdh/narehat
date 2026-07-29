import { createClient } from "@supabase/supabase-js"
import { auth } from "@/auth"

export function createDBClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}
