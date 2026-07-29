import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();

  const [
    profileRes,
    logsRes,
    photosRes,
    productsRes,
    insightsRes,
    notificationsRes,
    aiUsageRes,
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase.from("daily_logs").select("*").eq("user_id", userId).order("date", { ascending: true }),
    supabase.from("skin_photos").select("*").eq("user_id", userId).order("date", { ascending: true }),
    supabase.from("skincare_products").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase.from("insights").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("ai_usage").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    profile: profileRes.data,
    dailyLogs: logsRes.data || [],
    skinPhotos: photosRes.data || [],
    skincareProducts: productsRes.data || [],
    insights: insightsRes.data || [],
    notifications: notificationsRes.data || [],
    aiUsage: aiUsageRes.data || [],
  });
}
