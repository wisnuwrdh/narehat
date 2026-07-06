import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    return NextResponse.json({ error: "Fitur premium. Upgrade plan kamu." }, { status: 402 });
  }

  const body = await request.json();
  return NextResponse.json({
    message: "Acne detection endpoint (premium)",
    result: null,
  });
}
