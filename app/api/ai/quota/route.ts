import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { countMonthlyUsage, getPlanBucket, getPlanQuota } from "@/lib/ai/limits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();
  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  const bucket = getPlanBucket(profile?.plan);
  const limits = getPlanQuota(bucket);

  const [detectUsed, consultUsed, purgingUsed] = await Promise.all([
    countMonthlyUsage(supabase, userId, "detect"),
    countMonthlyUsage(supabase, userId, "consult"),
    countMonthlyUsage(supabase, userId, "purging"),
  ]);

  return NextResponse.json({
    consult: {
      used: consultUsed,
      limit: limits.consult,
      unlimited: false,
    },
    purging: {
      used: purgingUsed,
      limit: limits.purging,
      unlimited: false,
    },
    detect: {
      used: detectUsed,
      limit: limits.detect,
      unlimited: false,
    },
  });
}
