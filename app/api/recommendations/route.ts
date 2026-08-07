import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";

const INFLAMMATORY_TYPES = ["papules", "pustules", "nodules", "cystic"];

interface AiAnalysis {
  types?: unknown;
  severity?: string;
}

function normalizeAiAnalysis(value: unknown): AiAnalysis | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as AiAnalysis;
    } catch {
      return null;
    }
  }
  return value as AiAnalysis;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createDBClient();
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const [userRes, productsRes, scanRes, userProductsRes] = await Promise.all([
    supabase
      .from("users")
      .select("skin_type, goal, acne_severity")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("recommendations").select("*").eq("is_active", true),
    supabase
      .from("skin_photos")
      .select("ai_analysis")
      .eq("user_id", userId)
      .eq("analysis_type", "detect")
      .not("ai_analysis", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("skincare_products")
      .select("name")
      .eq("user_id", userId)
      .eq("active", true),
  ]);

  if (productsRes.error) return NextResponse.json({ error: productsRes.error.message }, { status: 500 });

  const skinType = userRes.data?.skin_type || "";
  const goal = userRes.data?.goal || "";

  const analysis = normalizeAiAnalysis(scanRes.data?.ai_analysis);
  const hasInflammatory = Array.isArray(analysis?.types) &&
    (analysis?.types as string[]).some((t) => INFLAMMATORY_TYPES.includes(t));
  const hasActiveLesions =
    hasInflammatory && analysis?.severity && analysis.severity !== "informative";

  const usedNames = new Set(
    (userProductsRes.data || []).map((p: { name: string }) => p.name.trim().toLowerCase())
  );

  let products = (productsRes.data || []).map((p) => {
    const skinTypes = Array.isArray(p.skin_types) ? p.skin_types : [];
    const concerns = Array.isArray(p.concerns) ? p.concerns : [];

    let score = 0;

    if (skinTypes.length === 0) {
      score += 1;
    } else if (skinType && skinTypes.includes(skinType)) {
      score += 2;
    }

    if (concerns.length === 0) {
      score += 1;
    } else if (goal === "all") {
      score += 2;
    } else if (goal && concerns.includes(goal)) {
      score += 2;
    }

    if (hasActiveLesions && concerns.includes("clear_acne")) {
      score += 1;
    }

    const used = usedNames.has(p.name.trim().toLowerCase());
    if (used) score -= 1000;

    return { ...p, score, used };
  });

  if (category && category !== "Semua") {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  products.sort((a, b) => b.score - a.score || b.rating - a.rating);

  return NextResponse.json({
    recommendations: products,
    total: products.length,
  });
}
