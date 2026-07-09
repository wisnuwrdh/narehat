import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread_only") === "true";
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data: notifications, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return NextResponse.json({ notifications, unread_count: unreadCount || 0 });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const hour = now.getHours();
  const generated: { type: string; title: string }[] = [];

  const { data: profile } = await supabase
    .from("users")
    .select("notif_reminder, notif_insight, notif_promo")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ message: "Profile not found" }, { status: 404 });
  }

  const { data: existingNotifications } = await supabase
    .from("notifications")
    .select("type, title")
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());

  const recentKeys = new Set((existingNotifications || []).map((n) => `${n.type}:${n.title}`));

  const logInsert = (type: string, title: string, description: string, link: string) => {
    const key = `${type}:${title}`;
    if (recentKeys.has(key)) return;
    recentKeys.add(key);
    generated.push({ type, title });
    supabase.from("notifications").insert({
      user_id: user.id,
      type,
      title,
      description,
      related_link: link,
    });
  };

  if (profile.notif_reminder && hour >= 9 && hour <= 21) {
    const { data: todayLog } = await supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (!todayLog) {
      logInsert(
        "reminder",
        "Jangan lupa isi tracker hari ini!",
        "Tracker harian membantumu melihat pola pemicu jerawat. Isi sekarang — cuma 30 detik.",
        "/tracker"
      );
    }
  }

  if (profile.notif_insight) {
    const dates: string[] = [];
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      dates.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() - 1);
    }

    const { data: weekLogs } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .in("date", dates)
      .order("date", { ascending: false });

    if (weekLogs && weekLogs.length >= 3) {
      const avgSleep = weekLogs.reduce((s, l) => s + l.sleep_hours, 0) / weekLogs.length;
      const avgWater = weekLogs.reduce((s, l) => s + l.water_ml, 0) / weekLogs.length;
      const avgStress = weekLogs.reduce((s, l) => s + l.stress_level, 0) / weekLogs.length;
      const streakDays = weekLogs.filter(l => l.skincare_morning && l.skincare_evening).length;

      if (avgSleep < 6) {
        logInsert(
          "insight",
          "Tidur kurang dari 6 jam rata-rata pekan ini",
          "Kurang tidur memicu hormon kortisol yang bisa memperparah jerawat. Targetkan 7-8 jam mulai malam ini.",
          "/dashboard"
        );
      } else if (avgSleep >= 7) {
        logInsert(
          "insight",
          "Kualitas tidur bagus pekan ini!",
          "Tidur cukup membantu regenerasi sel kulit dan mengurangi inflamasi jerawat. Pertahankan!",
          "/dashboard"
        );
      }

      if (avgWater < 1500) {
        logInsert(
          "insight",
          "Hidrasi masih di bawah target",
          "Minum minimal 2L/hari membantu kulit tetap lembap dan mendukung proses penyembuhan jerawat.",
          "/dashboard"
        );
      }

      if (avgStress > 3) {
        logInsert(
          "insight",
          "Tingkat stress cukup tinggi pekan ini",
          "Stress memicu jerawat hormonal. Coba teknik relaksasi 5 menit sebelum tidur.",
          "/dashboard"
        );
      }

      if (streakDays >= 5) {
        logInsert(
          "insight",
          "Rutinitas skincare konsisten!",
          "Kamu rutin melakukan skincare pagi & malam. Konsistensi ini kunci progress kulit yang baik.",
          "/dashboard"
        );
      }
    }
  }

  if (profile.notif_promo) {
    logInsert(
      "promo",
      "Coba AI Deteksi Jerawat dari Foto!",
      "Upload foto kulitmu dan biarkan AI menganalisis jenis jerawat, severity, dan estimasi pemicu.",
      "/ai-consult"
    );
  }

  return NextResponse.json({ generated: generated.length });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { ids } = body as { ids: string[] };

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Missing notification ids" }, { status: 400 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Marked as read" });
}
