import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanBucket = "free" | "premium" | "pro";

export interface PlanQuota {
  detect: number;
  consult: number;
  purging: number;
  routine_analyze: number;
  routine_build: number;
}

export const PLAN_LIMITS: Record<PlanBucket, PlanQuota> = {
  free: { detect: 2, consult: 10, purging: 1, routine_analyze: 0, routine_build: 0 },
  premium: { detect: 15, consult: 100, purging: 10, routine_analyze: 0, routine_build: 0 },
  pro: { detect: 30, consult: 300, purging: 30, routine_analyze: 30, routine_build: 30 },
};

export const DETECT_MODELS: Record<PlanBucket, string> = {
  free: "gpt-5-nano",
  premium: "gpt-5-mini",
  pro: "gpt-5",
};

export const PURGING_MODEL = "gpt-5-mini";

export function isPlanActive(plan: string | null | undefined, expiresAt?: string | null): boolean {
  if (!plan || plan === "free") return false;
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export function getPlanBucket(
  plan: string | null | undefined,
  expiresAt?: string | null
): PlanBucket {
  if (!plan || plan === "free") return "free";
  if (!isPlanActive(plan, expiresAt)) return "free";
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

export function getUsageSince(bucket: PlanBucket, planStartedAt?: string | null): string {
  if (bucket === "free") return firstDayOfMonth();
  if (planStartedAt) {
    const t = new Date(planStartedAt).getTime();
    if (!Number.isNaN(t) && t <= Date.now()) return planStartedAt;
  }
  return firstDayOfMonth();
}

export async function countMonthlyUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: "detect" | "consult" | "purging" | "routine_analyze" | "routine_build",
  since: string
): Promise<number> {
  const { data } = await supabase
    .from("ai_usage")
    .select("id")
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("created_at", since);

  return (data || []).length;
}

export async function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: "detect" | "consult" | "purging" | "routine_analyze" | "routine_build"
): Promise<void> {
  const { error } = await supabase.from("ai_usage").insert({
    user_id: userId,
    feature,
  });
  if (error) console.error("ai_usage insert failed:", error);
}
