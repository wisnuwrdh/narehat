import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookToken, verifyWebhookSignature } from "@/lib/payment/sumopod";

function parseOrderId(orderId: string): { userId: string; plan: string } | null {
  const parts = orderId.split("-");
  const timestampIdx = parts.findIndex((p, i) => i >= 1 && /^\d{13,}$/.test(p));
  if (timestampIdx === -1 || timestampIdx < 2) return null;

  const userId = parts.slice(0, timestampIdx - 1).join("-");
  const plan = parts[timestampIdx - 1];

  return { userId, plan };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const token = request.headers.get("x-webhook-token");
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  const tokenValid = token && verifyWebhookToken(token);
  const signatureValid =
    svixId && svixTimestamp && svixSignature
      ? verifyWebhookSignature(rawBody, svixId, svixTimestamp, svixSignature)
      : false;

  if (!tokenValid && !signatureValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = body.event_type as string | undefined;
  const data = body.data as Record<string, unknown> | undefined;

  if (eventType !== "payment.completed" || !data) {
    return NextResponse.json({ message: "Not a completed payment" });
  }

  const orderId = data.order_id as string | undefined;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const parsed = parseOrderId(orderId);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid order_id format" }, { status: 400 });
  }

  const { userId, plan } = parsed;
  const validPlans = ["premium_monthly", "premium_yearly", "pro_monthly", "pro_yearly"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan in order_id" }, { status: 400 });
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
