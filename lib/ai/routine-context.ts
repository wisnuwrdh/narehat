import type { SupabaseClient } from "@supabase/supabase-js";
import type { RoutineContext } from "./routine";

export async function loadRoutineContext(
  supabase: SupabaseClient,
  userId: string
): Promise<RoutineContext> {
  const ctx: RoutineContext = {};

  const [profileRes, productsRes, scanRes, insightsRes] = await Promise.all([
    supabase
      .from("users")
      .select("skin_type")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("skincare_products")
      .select("name, brand, category, time_of_day")
      .eq("user_id", userId)
      .eq("active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("skin_photos")
      .select("ai_analysis, date")
      .eq("user_id", userId)
      .eq("analysis_type", "detect")
      .not("ai_analysis", "is", null)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("insights")
      .select("title, description, type, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(3),
  ]);

  if (profileRes.data?.skin_type) {
    ctx.skinType = profileRes.data.skin_type;
  }

  const products = productsRes.data || [];
  if (products.length > 0) {
    ctx.existingProducts = products.map((p) => {
      const when =
        p.time_of_day === "am"
          ? " — pagi"
          : p.time_of_day === "pm"
            ? " — malam"
            : p.time_of_day === "spot"
              ? " — spot"
              : "";
      return `${p.name}${p.brand ? " (" + p.brand + ")" : ""}${
        p.category ? ", kategori: " + p.category : ""
      }${when}`;
    });
  }

  if (scanRes.data?.ai_analysis) {
    try {
      const a =
        typeof scanRes.data.ai_analysis === "string"
          ? JSON.parse(scanRes.data.ai_analysis)
          : scanRes.data.ai_analysis;
      const parts: string[] = [];
      if (Array.isArray(a.types) && a.types.length > 0) {
        parts.push("jenis lesi: " + a.types.join(", "));
      }
      if (a.severity) parts.push("keparahan: " + a.severity);
      if (a.location) parts.push("lokasi: " + a.location);
      if (Array.isArray(a.triggers) && a.triggers.length > 0) {
        parts.push("pemicu: " + a.triggers.join(", "));
      }
      if (parts.length > 0) {
        ctx.scanSummary = `(scan ${scanRes.data.date}) ${parts.join("; ")}`;
      }
    } catch {
      // abaikan scan yang tidak valid
    }
  }

  if (insightsRes.data && insightsRes.data.length > 0) {
    ctx.insightContext = insightsRes.data
      .map((i) => `[${i.type}] ${i.title} (${i.date}): ${i.description}`)
      .join("\n");
  }

  return ctx;
}
