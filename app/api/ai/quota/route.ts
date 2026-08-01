import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { countMonthlyUsage, getPlanBucket, getPlanQuota, getUsageSince } from "@/lib/ai/limits";

export async function GET() {
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
  const limits = getPlanQuota(bucket);

  const usageSince = getUsageSince(bucket, profile?.plan_started_at);
  const [detectUsed, consultUsed, purgingUsed] = await Promise.all([
    countMonthlyUsage(supabase, userId, "detect", usageSince),
    countMonthlyUsage(supabase, userId, "consult", usageSince),
    countMonthlyUsage(supabase, userId, "purging", usageSince),
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
