import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkPurging } from "@/lib/ai/purging";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isPro = profile.plan.includes("pro");

  if (!isPro) {
    const { count } = await supabase
      .from("ai_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("feature", "purging");

    if (count && count >= 1) {
      return NextResponse.json(
        { error: "Batas purging checker gratis tercapai (1x). Upgrade ke Pro untuk unlimited." },
        { status: 402 }
      );
    }
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const productName = (formData.get("product_name") as string) || "";
  let imageBase64 = formData.get("image") as string | null;

  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = file.type || "image/jpeg";
    imageBase64 = `data:${mime};base64,${buffer.toString("base64")}`;
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!productName.trim()) {
    return NextResponse.json({ error: "Mohon sebutkan nama produk yang baru dipakai" }, { status: 400 });
  }

  const result = await checkPurging(imageBase64, productName.trim());

  if (!result) {
    return NextResponse.json({ error: "Gagal menganalisis foto. Coba lagi nanti." }, { status: 500 });
  }

  const { data: photo, error: insertErr } = await supabase
    .from("skin_photos")
    .insert({
      user_id: user.id,
      url: imageBase64,
      date: new Date().toISOString().split("T")[0],
      notes: `Purging check: ${productName}`,
      analysis_type: "purging",
      ai_analysis: {
        type: result.type,
        confidence: result.confidence,
        description: result.description,
        recommendations: result.recommendations,
        product_name: productName,
        analyzed_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Gagal menyimpan hasil analisis" }, { status: 500 });
  }

  if (!isPro) {
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      feature: "purging",
    });
  }

  return NextResponse.json({
    id: photo?.id,
    type: result.type,
    typeDisplay: result.type === "purging" ? "Purging (Reaksi Normal)" : "Breakout (Reaksi Negatif)",
    confidence: result.confidence,
    description: result.description,
    recommendations: result.recommendations,
    product_name: productName,
    disclaimer: "Hasil ini bersifat informatif, bukan diagnosis medis. Jika kondisi memburuk, segera hentikan produk dan konsultasikan ke dokter kulit.",
  });
}
