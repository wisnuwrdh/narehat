import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanBucket = "free" | "premium" | "pro";

export interface PlanQuota {
  detect: number;
  consult: number;
  purging: number;
}

export const PLAN_LIMITS: Record<PlanBucket, PlanQuota> = {
  free: { detect: 2, consult: 10, purging: 1 },
  premium: { detect: 30, consult: 100, purging: 10 },
  pro: { detect: 100, consult: 300, purging: 30 },
};

export const DETECT_MODELS: Record<PlanBucket, string> = {
  free: "gpt-4o-mini",
  premium: "gpt-5-mini",
  pro: "gpt-5",
};

export const PURGING_MODEL = "gpt-5-mini";

export function getPlanBucket(plan: string | null | undefined): PlanBucket {
  if (!plan || plan === "free") return "free";
  if (plan.includes("pro")) return "pro";
  return "premium";
}

export function getPlanQuota(bucket: PlanBucket): PlanQuota {
  return PLAN_LIMITS[bucket];
}

export function getDetectModel(bucket: PlanBucket): string {
  return DETECT_MODELS[bucket];
}

export function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function countMonthlyUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: "detect" | "consult" | "purging"
): Promise<number> {
  const { data } = await supabase
    .from("ai_usage")
    .select("id")
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("created_at", firstDayOfMonth());

  return (data || []).length;
}

export async function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: "detect" | "consult" | "purging"
): Promise<void> {
  const { error } = await supabase.from("ai_usage").insert({
    user_id: userId,
    feature,
  });
  if (error) console.error("ai_usage insert failed:", error);
}
