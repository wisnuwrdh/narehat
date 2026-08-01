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

  const { error: pmtErr } = await supabaseAuth
    .from("payments")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("order_id", orderId);
  if (pmtErr) {
    return NextResponse.json({ error: "Failed to update payment: " + pmtErr.message }, { status: 500 });
  }

  const { data: authUser, error: authError } = await supabaseAuth.auth.admin.getUserById(userId);
  if (authError || !authUser?.user) {
    return NextResponse.json({ error: "Auth user not found" }, { status: 404 });
  }

  const email = authUser.user.email || "";
  const now = new Date();

  const { data: existingUser, error: selErr } = await supabaseAuth
    .from("users")
    .select("id, plan, plan_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ error: "Select user failed: " + selErr.message, hint: "Apakah tabel public.users sudah dibuat?" }, { status: 500 });
  }

  const durationDays = plan.includes("yearly") ? 365 : 30;
  const base = existingUser?.plan_expires_at && new Date(existingUser.plan_expires_at).getTime() > now.getTime()
    ? new Date(existingUser.plan_expires_at)
    : now;
  const planExpiresAt = new Date(base.getTime() + durationDays * 86400000).toISOString();

  if (existingUser) {
    const { error: updErr } = await supabaseAuth.from("users").update({ plan, plan_expires_at: planExpiresAt, updated_at: now.toISOString() }).eq("id", userId);
    if (updErr) return NextResponse.json({ error: "Update failed: " + updErr.message }, { status: 500 });
  } else {
    const { error: insErr } = await supabaseAuth.from("users").insert({
      id: userId, email, plan, plan_expires_at: planExpiresAt, name: email.split("@")[0], updated_at: now.toISOString(),
    });
    if (insErr) return NextResponse.json({ error: "Insert failed: " + insErr.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Plan updated", userId, plan, plan_expires_at: planExpiresAt });
}
