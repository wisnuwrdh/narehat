import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/lib/payment/xendit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const plan = (body.plan as string) || "premium_monthly";

  if (plan !== "premium_monthly" && plan !== "premium_yearly") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const { invoice_url } = await createInvoice(user.id, plan);
    return NextResponse.json({ invoice_url });
  } catch (err) {
    return NextResponse.json({ error: "Gagal membuat invoice. Periksa konfigurasi payment." }, { status: 500 });
  }
}
