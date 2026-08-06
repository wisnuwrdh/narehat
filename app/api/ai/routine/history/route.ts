import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();
  const { data, error } = await supabase
    .from("routine_reports")
    .select("id, type, input, result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Gagal memuat riwayat" }, { status: 500 });
  }

  return NextResponse.json({ reports: data || [] });
}
