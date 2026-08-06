import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { analyzeRoutine } from "@/lib/ai/routine";
import { loadRoutineContext } from "@/lib/ai/routine-context";
import {
  countMonthlyUsage,
  getPlanBucket,
  getPlanQuota,
  getUsageSince,
  recordUsage,
} from "@/lib/ai/limits";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();
  const { data: profile } = await supabase
    .from("users")
    .select("plan, plan_expires_at, plan_started_at")
    .eq("id", userId)
    .maybeSingle();

  const bucket = getPlanBucket(profile?.plan, profile?.plan_expires_at);
  if (bucket !== "pro") {
    return NextResponse.json({ error: "Fitur Pro. Upgrade plan kamu ke Pro." }, { status: 402 });
  }

  const limit = getPlanQuota(bucket).routine_analyze;
  const used = await countMonthlyUsage(
    supabase,
    userId,
    "routine_analyze",
    getUsageSince(bucket, profile?.plan_started_at)
  );
  if (used >= limit) {
    return NextResponse.json(
      {
        error: "Batas analisis rutinitas bulanan tercapai",
        message: `Kamu sudah menggunakan ${limit}x analisis bulan ini. Kuota direset tiap periode langganan.`,
      },
      { status: 402 }
    );
  }

  const body = await request.json();
  const useMyProducts = Boolean(body.use_my_products);
  const rawProducts: unknown[] = Array.isArray(body.products) ? body.products : [];

  let products: string[] = [];

  if (useMyProducts) {
    const { data: saved } = await supabase
      .from("skincare_products")
      .select("name, brand, category, time_of_day")
      .eq("user_id", userId)
      .eq("active", true)
      .order("created_at", { ascending: true });
    products = (saved || [])
      .map((p) => {
        const when =
          p.time_of_day === "am"
            ? " (pagi)"
            : p.time_of_day === "pm"
              ? " (malam)"
              : p.time_of_day === "spot"
                ? " (spot)"
                : "";
        return `${p.name}${p.brand ? " — " + p.brand : ""}${when}`;
      })
      .slice(0, 15);
  } else {
    products = rawProducts
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .map((p) => p.trim())
      .slice(0, 15);
  }

  if (products.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada produk untuk dianalisis. Tambahkan produk atau masukkan secara manual." },
      { status: 400 }
    );
  }

  const ctx = await loadRoutineContext(supabase, userId);
  const result = await analyzeRoutine(products, ctx);

  if (!result) {
    return NextResponse.json({ error: "Gagal menganalisis. Coba lagi nanti." }, { status: 500 });
  }

  await recordUsage(supabase, userId, "routine_analyze");
  await supabase.from("routine_reports").insert({
    user_id: userId,
    type: "analyze",
    input: { products, use_my_products: useMyProducts },
    result: result as unknown as object,
  });

  return NextResponse.json({
    ...result,
    free_remaining: Math.max(0, limit - used - 1),
  });
}
