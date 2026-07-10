import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FREE_LIMITS: Record<string, number> = {
  consult: 3,
  purging: 1,
  detect: 0,
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  const isPaying = profile && profile.plan !== "free";

  if (isPaying) {
    return NextResponse.json({
      consult: { used: 0, limit: 0, unlimited: true },
      purging: { used: 0, limit: 0, unlimited: true },
      detect: { used: 0, limit: 0, unlimited: true },
    });
  }

  const { data: usage } = await supabase
    .from("ai_usage")
    .select("feature")
    .eq("user_id", user.id);

  const counts: Record<string, number> = {};
  for (const row of usage || []) {
    counts[row.feature] = (counts[row.feature] || 0) + 1;
  }

  return NextResponse.json({
    consult: {
      used: counts.consult || 0,
      limit: FREE_LIMITS.consult,
      unlimited: false,
    },
    purging: {
      used: counts.purging || 0,
      limit: FREE_LIMITS.purging,
      unlimited: false,
    },
    detect: {
      used: counts.detect || 0,
      limit: FREE_LIMITS.detect,
      unlimited: false,
    },
  });
}
