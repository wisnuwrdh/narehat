import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const token = crypto.randomUUID();
  const expiry = new Date(Date.now() + 86400000).toISOString();

  await supabase
    .from("users")
    .update({ verify_token: token, verify_token_expiry: expiry })
    .eq("email", session.user.email);

  const { sendEmail } = await import("@/lib/email/send");
  const { verifyEmailEmail } = await import("@/lib/email/templates");

  const origin = req.headers.get("origin") || "https://narehat.com";
  const link = `${origin}/api/auth/verify-email?token=${token}`;
  const { html, text } = verifyEmailEmail(link);

  await sendEmail({
    to: session.user.email,
    subject: "Verifikasi Email Narehat",
    html,
    text,
  });

  return NextResponse.json({ success: true });
}
