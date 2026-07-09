import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/payment/xendit";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-callback-token") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status as string | undefined;
  const externalId = body.external_id as string | undefined;

  if (status !== "PAID" || !externalId) {
    return NextResponse.json({ message: "Not a paid invoice" });
  }

  const parts = externalId.split("-");
  const timestampIdx = parts.findIndex((p, i) => i >= 1 && /^\d{13,}$/.test(p));
  if (timestampIdx === -1 || timestampIdx < 2) {
    return NextResponse.json({ error: "Invalid external_id format" }, { status: 400 });
  }
  const userId = parts.slice(0, timestampIdx - 1).join("-");
  const rawPlan = parts[timestampIdx - 1];
  const validPlans = ["premium_monthly", "premium_yearly", "pro_monthly", "pro_yearly"];
  const plan = validPlans.includes(rawPlan) ? rawPlan : null;

  if (!userId || !plan) {
    return NextResponse.json({ error: "Invalid external_id" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const supabaseAuth = createClient(supabaseUrl, serviceKey);

  const { data: existing } = await supabaseAuth
    .from("users")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existing.plan === plan) {
    return NextResponse.json({ message: "Plan already set", userId, plan });
  }

  const { error } = await supabaseAuth
    .from("users")
    .update({ plan })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Plan updated", userId, plan });
}
