import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/lib/payment/xendit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const plan = (body.plan as string) || "premium_monthly";

    const validPlans = ["premium_monthly", "premium_yearly", "pro_monthly", "pro_yearly"] as const;
    type PlanType = (typeof validPlans)[number];
    if (!validPlans.includes(plan as PlanType)) {
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
    const { invoice_url } = await createInvoice(user.id, plan as PlanType);
    return NextResponse.json({ invoice_url });
  } catch (err) {
    return NextResponse.json({ error: "Gagal membuat invoice. Periksa konfigurasi payment." }, { status: 500 });
  }
}
