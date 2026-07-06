import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  let query = supabase.from("daily_logs").select("*").eq("user_id", user.id);
  if (date) {
    query = query.eq("date", date);
  }
  query = query.order("date", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ logs: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("daily_logs").upsert({
    user_id: user.id,
    date: today,
    sleep_hours: body.sleep_hours ?? 0,
    water_ml: body.water_ml ?? 0,
    exercise_minutes: body.exercise_minutes ?? 0,
    stress_level: body.stress_level ?? 5,
    skincare_morning: body.skincare_morning ?? false,
    skincare_evening: body.skincare_evening ?? false,
    touched_face: body.touched_face ?? false,
    junk_food: body.junk_food ?? false,
    notes: body.notes ?? "",
  }, { onConflict: "user_id,date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Log saved" }, { status: 201 });
}
