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

  const userId = externalId.split("-")[0];
  if (!userId) {
    return NextResponse.json({ error: "Invalid external_id" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const isMonthly = externalId.includes("premium_monthly");
  const plan = isMonthly ? "premium_monthly" : "premium_yearly";

  const { error } = await supabase
    .from("users")
    .update({ plan })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Plan updated", userId, plan });
}
