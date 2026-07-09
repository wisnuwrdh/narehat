import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeRoutine } from "@/lib/ai/routine";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.plan.includes("pro")) {
    return NextResponse.json({ error: "Fitur Pro. Upgrade plan kamu ke Pro." }, { status: 402 });
  }

  const body = await request.json();
  const { products } = body as { products: string[] };

  if (!products || !Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "Minimal masukkan 1 produk" }, { status: 400 });
  }

  const validProducts = products.filter((p) => p.trim()).slice(0, 15);

  if (validProducts.length === 0) {
    return NextResponse.json({ error: "Minimal masukkan 1 produk" }, { status: 400 });
  }

  const result = await analyzeRoutine(validProducts);

  if (!result) {
    return NextResponse.json({ error: "Gagal menganalisis. Coba lagi nanti." }, { status: 500 });
  }

  return NextResponse.json(result);
}
