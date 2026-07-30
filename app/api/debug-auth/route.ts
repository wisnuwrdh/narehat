import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { hashPassword, verifyPassword } from "@/lib/crypto/password"

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test 1: Supabase client init
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    results["1-supabase-client"] = "OK"

    // Test 2: Query users table
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .limit(1)
    if (error) {
      results["2-query-users"] = `FAIL: ${error.message}`
    } else {
      results["2-query-users"] = `OK (found ${data.length} users)`
    }
  } catch (e) {
    results["1-supabase-client"] = `FAIL: ${String(e)}`
  }

  // Test 3: hashPassword
  try {
    const hash = await hashPassword("test-password-123")
    results["3-hashPassword"] = `OK (hash: ${hash.slice(0, 20)}...)`
  } catch (e) {
    results["3-hashPassword"] = `FAIL: ${String(e)}`
  }

  // Test 4: verifyPassword
  try {
    const hash = await hashPassword("test-password-123")
    const valid = await verifyPassword("test-password-123", hash)
    results["4-verifyPassword"] = valid ? "OK (match)" : "FAIL (mismatch)"
  } catch (e) {
    results["4-verifyPassword"] = `FAIL: ${String(e)}`
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
      auth_secret: process.env.AUTH_SECRET ? "SET" : "MISSING",
      google_id: process.env.AUTH_GOOGLE_ID ? "SET" : "MISSING",
    },
    results,
  })
}
