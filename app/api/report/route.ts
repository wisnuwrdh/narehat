import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("plan").eq("id", user.id).maybeSingle();
  if (!profile || !profile.plan?.includes("pro")) {
    return NextResponse.json({ error: "Fitur Pro. Upgrade plan kamu ke Pro." }, { status: 402 });
  }

  const dates: string[] = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() - 1);
  }
  dates.reverse();

  const [profileRes, logsRes, photosRes, insightsRes, aiPhotosRes] = await Promise.all([
    supabase.from("users").select("name, skin_type, goal").eq("id", user.id).maybeSingle(),
    supabase.from("daily_logs").select("*").eq("user_id", user.id).in("date", dates).order("date", { ascending: true }),
    supabase.from("skin_photos").select("url, date, notes").eq("user_id", user.id).order("date", { ascending: false }).limit(2),
    supabase.from("insights").select("title, description, type").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("skin_photos").select("ai_analysis, date").eq("user_id", user.id).not("ai_analysis", "is", null).order("date", { ascending: false }).limit(3),
  ]);

  const profile = profileRes.data;
  const logs = logsRes.data || [];
  const photos = photosRes.data || [];
  const insights = insightsRes.data || [];
  const aiResults = aiPhotosRes.data || [];

  const skinScores = logs.map((l) => {
    let score = 50;
    score += Math.min((l.sleep_hours || 0) / 8, 1) * 15;
    score += Math.min((l.water_ml || 0) / 2500, 1) * 10;
    score += Math.min((l.exercise_minutes || 0) / 30, 1) * 10;
    score += (1 - ((l.stress_level || 5) - 1) / 4) * 10;
    if (l.skincare_morning) score += 7;
    if (l.skincare_evening) score += 8;
    return Math.min(100, Math.round(score));
  });

  const avgScore = skinScores.length > 0 ? Math.round(skinScores.reduce((a, b) => a + b, 0) / skinScores.length) : 0;
  const avgSleep = logs.length > 0 ? Math.round((logs.reduce((a, l) => a + (l.sleep_hours || 0), 0) / logs.length) * 10) / 10 : 0;
  const avgWater = logs.length > 0 ? Math.round(logs.reduce((a, l) => a + (l.water_ml || 0), 0) / logs.length) : 0;
  const avgStress = logs.length > 0 ? Math.round((logs.reduce((a, l) => a + (l.stress_level || 0), 0) / logs.length) * 10) / 10 : 0;
  const skincareConsistency = logs.length > 0 ? Math.round((logs.filter((l) => l.skincare_morning && l.skincare_evening).length / logs.length) * 100) : 0;

  const skinLabels: Record<string, string> = {
    oily: "Berminyak", dry: "Kering", combination: "Kombinasi", normal: "Normal", sensitive: "Sensitif",
  };

  const rangeStart = dates[0] || "";
  const rangeEnd = dates[dates.length - 1] || "";
  const startLabel = new Date(rangeStart).toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  const endLabel = new Date(rangeEnd).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return NextResponse.json({
    userName: profile?.name || user.email?.split("@")[0] || "User",
    skinType: skinLabels[profile?.skin_type || ""] || "Kombinasi",
    rangeLabel: `${startLabel} - ${endLabel}`,
    avgScore,
    avgSleep,
    avgWater,
    avgStress,
    skincareConsistency,
    loggingDays: logs.length,
    photos: photos.map((p) => ({ url: p.url, date: p.date })),
    insights: insights.map((i) => ({ title: i.title, description: i.description, type: i.type })),
    aiResults: aiResults.map((r) => ({
      analysis: r.ai_analysis,
      date: r.date,
    })),
    generatedAt: new Date().toISOString(),
  });
}
