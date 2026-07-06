import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
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
