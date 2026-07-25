import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayment, isValidPlan } from "@/lib/payment/sumopod";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const plan = (body.plan as string) || "premium_monthly";

  if (!isValidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.plan !== "free" && profile.plan === plan) {
    return NextResponse.json({ error: "Kamu sudah ada di plan ini." }, { status: 409 });
  }

  const { data: pendingPayment } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingPayment) {
    if (pendingPayment.payment_url) {
      return NextResponse.json({ payment_url: pendingPayment.payment_url });
    }
    await supabase.from("payments").delete().eq("id", pendingPayment.id);
  }

  try {
    const { payment_url, order_id } = await createPayment(user.id, plan, request.nextUrl.origin);

    await supabase.from("payments").insert({
      user_id: user.id,
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
