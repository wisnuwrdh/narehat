import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: pending } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!pending) {
    return NextResponse.json({ error: "Tidak ada pembayaran pending." }, { status: 404 });
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", pending.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Pembayaran dibatalkan." });
}
