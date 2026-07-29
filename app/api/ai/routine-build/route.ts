import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { buildRoutine } from "@/lib/ai/routine";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();
  const { data: profile } = await supabase
    .from("users")
    .select("plan, skin_type")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !profile.plan.includes("pro")) {
    return NextResponse.json({ error: "Fitur Pro. Upgrade plan kamu ke Pro." }, { status: 402 });
  }

  const body = await request.json();
  const { skin_type, budget, concern } = body as {
    skin_type?: string;
    budget?: string;
    concern?: string;
  };

  const skinType = skin_type || profile.skin_type || "combination";
  const budgetVal = budget || "mid";
  const concernVal = concern || "acne";

  const result = await buildRoutine(skinType, budgetVal, concernVal);

  if (!result) {
    return NextResponse.json({ error: "Gagal membuat rutinitas. Coba lagi nanti." }, { status: 500 });
  }

  return NextResponse.json(result);
}
