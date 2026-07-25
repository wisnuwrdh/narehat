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

  try {
    const { payment_url } = await createPayment(user.id, plan);
    return NextResponse.json({ payment_url });
  } catch {
    return NextResponse.json({ error: "Gagal membuat pembayaran. Periksa konfigurasi payment." }, { status: 500 });
  }
}
