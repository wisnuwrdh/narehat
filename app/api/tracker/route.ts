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

  const sleep_hours = Math.min(24, Math.max(0, Number(body.sleep_hours) || 0));
  const water_ml = Math.min(10000, Math.max(0, Number(body.water_ml) || 0));
  const exercise_minutes = Math.min(480, Math.max(0, Number(body.exercise_minutes) || 0));
  const stress_level = Math.min(5, Math.max(1, Math.round(Number(body.stress_level)) || 5));
  const skincare_morning = Boolean(body.skincare_morning ?? false);
  const skincare_evening = Boolean(body.skincare_evening ?? false);
  const notes = String(body.notes ?? "").slice(0, 500);

  const { error } = await supabase.from("daily_logs").upsert({
    user_id: user.id,
    date: today,
    sleep_hours,
    water_ml,
    exercise_minutes,
    stress_level,
    skincare_morning,
    skincare_evening,
    touched_face: Boolean(body.touched_face ?? false),
    junk_food: Boolean(body.junk_food ?? false),
    notes,
  }, { onConflict: "user_id,date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Log saved" }, { status: 201 });
}
