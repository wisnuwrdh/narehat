import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createDBClient();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabase.from("recommendations").select("*");

  if (category && category !== "Semua") {
    query = query.ilike("category", category);
  }

  const { data, error } = await query.order("rating", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    recommendations: data || [],
    total: (data || []).length,
  });
}
