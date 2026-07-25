import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function parseOrderId(orderId: string): { userId: string; plan: string } | null {
  const parts = orderId.split("-");
  const timestampIdx = parts.findIndex((p, i) => i >= 1 && /^\d{13,}$/.test(p));
  if (timestampIdx === -1 || timestampIdx < 2) return null;

  const userId = parts.slice(0, timestampIdx - 1).join("-");
  const plan = parts[timestampIdx - 1];

  return { userId, plan };
}

function extractOrderId(body: Record<string, unknown>): string | undefined {
  if (body.order_id) return body.order_id as string;
  if (body.data && typeof body.data === "object" && "order_id" in (body.data as Record<string, unknown>)) {
    return (body.data as Record<string, unknown>).order_id as string;
  }
  if (body.external_id) return body.external_id as string;
  return undefined;
}

function isPaymentCompleted(body: Record<string, unknown>): boolean {
  const status = String(body.status || "").toLowerCase();
  const eventType = String(body.event_type || "").toLowerCase();

  if (status === "completed" || status === "success" || status === "paid" || status === "settlement") return true;
  if (eventType === "payment.completed" || eventType === "payment.success") return true;

  if (body.data && typeof body.data === "object") {
    const data = body.data as Record<string, unknown>;
    const dataStatus = String(data.status || "").toLowerCase();
    if (dataStatus === "completed" || dataStatus === "success" || dataStatus === "paid" || dataStatus === "settlement") return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => { headers[k] = v; });
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Headers:", JSON.stringify(headers, null, 2));
  console.log("Body:", rawBody);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isPaymentCompleted(body)) {
    return NextResponse.json({ message: "Not a completed payment" });
  }

  const orderId = extractOrderId(body);
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

  await supabaseAuth
    .from("payments")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("order_id", orderId);

  const { data: existing } = await supabaseAuth
    .from("users")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existing.plan === plan) {
    return NextResponse.json({ message: "Plan sudah aktif", userId, plan });
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
