import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", email.trim())
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "Email tidak ditemukan." }, { status: 404 });
  }

  const token = crypto.randomUUID();
  const expiry = new Date(Date.now() + 3600000).toISOString();

  await supabase
    .from("users")
    .update({ reset_token: token, reset_token_expiry: expiry })
    .eq("email", email.trim());

  const { sendEmail } = await import("@/lib/email/send");
  const { resetPasswordEmail } = await import("@/lib/email/templates");

  const origin = req.headers.get("origin") || "https://narehat.com";
  const link = `${origin}/reset-password?token=${token}`;
  const { html, text } = resetPasswordEmail(link);

  await sendEmail({
    to: user.email!,
    subject: "Reset Password Narehat",
    html,
    text,
  });

  return NextResponse.json({ success: true });
}
