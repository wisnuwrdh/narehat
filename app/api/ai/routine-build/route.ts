import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { buildRoutine } from "@/lib/ai/routine";
import { loadRoutineContext } from "@/lib/ai/routine-context";
import {
  countMonthlyUsage,
  getPlanBucket,
  getPlanQuota,
  getUsageSince,
  recordUsage,
} from "@/lib/ai/limits";

const GOAL_TO_CONCERN: Record<string, string> = {
  clear_acne: "acne",
  fade_scars: "scar",
  brighter_skin: "brightening",
  all: "barrier",
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();
  const { data: profile } = await supabase
    .from("users")
    .select("plan, plan_expires_at, plan_started_at, skin_type, goal")
    .eq("id", userId)
    .maybeSingle();

  const bucket = getPlanBucket(profile?.plan, profile?.plan_expires_at);
  if (bucket !== "pro") {
    return NextResponse.json({ error: "Fitur Pro. Upgrade plan kamu ke Pro." }, { status: 402 });
  }

  const limit = getPlanQuota(bucket).routine_build;
  const used = await countMonthlyUsage(
    supabase,
    userId,
    "routine_build",
    getUsageSince(bucket, profile?.plan_started_at)
  );
  if (used >= limit) {
    return NextResponse.json(
      {
        error: "Batas routine builder bulanan tercapai",
        message: `Kamu sudah menggunakan ${limit}x routine builder bulan ini. Kuota direset tiap periode langganan.`,
      },
      { status: 402 }
    );
  }

  const body = await request.json();
  const skinType = String(body.skin_type || "").trim() || profile?.skin_type || "combination";
  const budget = String(body.budget || "").trim() || "mid";
  const concern =
    String(body.concern || "").trim() || (profile?.goal ? GOAL_TO_CONCERN[profile.goal] : undefined) || "acne";

  const ctx = await loadRoutineContext(supabase, userId);
  const result = await buildRoutine(skinType, budget, concern, ctx);

  if (!result) {
    return NextResponse.json({ error: "Gagal membuat rutinitas. Coba lagi nanti." }, { status: 500 });
  }

  await recordUsage(supabase, userId, "routine_build");
  await supabase.from("routine_reports").insert({
    user_id: userId,
    type: "build",
    input: { skin_type: skinType, budget, concern },
    result: result as unknown as object,
  });

  return NextResponse.json({
    ...result,
    free_remaining: Math.max(0, limit - used - 1),
  });
}
