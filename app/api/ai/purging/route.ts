import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkPurging } from "@/lib/ai/purging";
import { uploadPhoto } from "@/lib/storage/r2";
import { arrayBufferToBase64 } from "@/lib/utils/binary";

export async function POST(request: NextRequest) {
  try {
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
      const { data: usageRows } = await supabase
        .from("ai_usage")
        .select("id")
        .eq("user_id", user.id)
        .eq("feature", "purging");

      if ((usageRows || []).length >= 1) {
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

    let rawBuffer: Uint8Array | null = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      rawBuffer = new Uint8Array(arrayBuffer);
      const mime = file.type || "image/jpeg";
      imageBase64 = `data:${mime};base64,${arrayBufferToBase64(arrayBuffer)}`;
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!productName.trim()) {
      return NextResponse.json({ error: "Mohon sebutkan nama produk yang baru dipakai" }, { status: 400 });
    }

    // 1. Upload to R2 first (fail fast, proper error message)
    let photoUrl = "";
    if (rawBuffer) {
      try {
        const filePath = `${user.id}/${Date.now()}-purging.webp`;
        photoUrl = await uploadPhoto(filePath, rawBuffer, "image/webp");
      } catch (err) {
        console.error("R2 upload failed:", err);
        return NextResponse.json(
          { error: "Gagal mengupload foto ke storage. Cek konfigurasi R2." },
          { status: 500 }
        );
      }
    }

    // 2. AI analysis
    const result = await checkPurging(imageBase64, productName.trim()).catch(() => null);

    const today = new Date().toISOString().split("T")[0];

    if (!result) {
      if (photoUrl) {
        await supabase.from("skin_photos").insert({
          user_id: user.id,
          url: photoUrl,
          date: today,
          notes: `Purging check: ${productName} (gagal)`,
          analysis_type: "purging",
          ai_analysis: null,
        });
      }
      return NextResponse.json({ error: "Gagal menganalisis foto. Coba lagi nanti." }, { status: 500 });
    }

    const { data: photo, error: insertErr } = await supabase
      .from("skin_photos")
      .insert({
        user_id: user.id,
        url: photoUrl,
        date: today,
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
      const { error: insertErr } = await supabase.from("ai_usage").insert({
        user_id: user.id,
        feature: "purging",
      });
      if (insertErr) console.error("ai_usage insert failed:", insertErr);
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
  } catch (err) {
    console.error("Purging route crash:", err);
    return NextResponse.json(
      { error: `Internal error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
