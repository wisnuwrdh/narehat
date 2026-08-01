import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { createPayment, isValidPlan, planPriority } from "@/lib/payment/sumopod";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();

  const body = await request.json();
  const plan = (body.plan as string) || "";

  if (!plan) {
    const { data: p } = await supabase
      .from("payments")
      .select("plan")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();
    return NextResponse.json({ pending_plan: p?.plan || null });
  }

  if (!isValidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plan, plan_expires_at")
    .eq("id", userId)
    .maybeSingle();

  const currentActive =
    profile &&
    profile.plan !== "free" &&
    profile.plan_expires_at &&
    new Date(profile.plan_expires_at).getTime() > Date.now();

  if (currentActive && planPriority(profile.plan) > planPriority(plan)) {
    const currentTier = profile.plan.includes("pro") ? "Pro" : "Premium";
    const newTier = plan.includes("pro") ? "Pro" : "Premium";
    return NextResponse.json(
      { error: `Kamu sudah di plan ${currentTier}. Downgrade ke ${newTier} hanya bisa setelah langganan ${currentTier} berakhir.` },
      { status: 409 }
    );
  }

  const { data: pendingPayment } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingPayment) {
    if (pendingPayment.plan === plan && pendingPayment.payment_url) {
      return NextResponse.json({ payment_url: pendingPayment.payment_url });
    }
    await supabase
      .from("payments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", pendingPayment.id);
  }

  try {
    const { payment_url, order_id } = await createPayment(userId, plan, request.nextUrl.origin);

    await supabase.from("payments").insert({
      user_id: userId,
      order_id,
      plan,
      amount: plan.includes("yearly") ? (plan.includes("pro") ? 399000 : 199000) : (plan.includes("pro") ? 49000 : 29000),
      payment_url,
    });

    return NextResponse.json({ payment_url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Payment create error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
