import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { checkPurging } from "@/lib/ai/purging";
import { generatePurgingAdvice } from "@/lib/ai/tips";
import { uploadPhoto } from "@/lib/storage/r2";
import { arrayBufferToBase64 } from "@/lib/utils/binary";
import { countMonthlyUsage, getPlanBucket, getPlanQuota, recordUsage } from "@/lib/ai/limits";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const supabase = createDBClient();
    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const bucket = getPlanBucket(profile.plan);
    const purgingLimit = getPlanQuota(bucket).purging;
    const purgingUsed = await countMonthlyUsage(supabase, userId, "purging");

    if (purgingUsed >= purgingLimit) {
      const upgrade =
        bucket === "free"
          ? "Upgrade ke Premium untuk 10x/bulan."
          : bucket === "premium"
            ? "Upgrade ke Pro untuk 30x/bulan."
            : "";
      return NextResponse.json(
        {
          error: "Batas purging checker bulanan tercapai",
          message: `Kamu sudah menggunakan ${purgingLimit}x Purging Checker bulan ini. ${upgrade}`,
        },
        { status: 402 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productName = (formData.get("product_name") as string) || "";
    let imageBase64 = formData.get("image") as string | null;

    if (file && file.size > 30 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran foto terlalu besar. Maks 30MB." }, { status: 413 });
    }

    if (file && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      return NextResponse.json({ error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
    }

    let rawBuffer: Uint8Array | null = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      rawBuffer = new Uint8Array(arrayBuffer);
      if (rawBuffer.length < 4 || !(
        (rawBuffer[0] === 0xFF && rawBuffer[1] === 0xD8) ||
        (rawBuffer[0] === 0x89 && rawBuffer[1] === 0x50 && rawBuffer[2] === 0x4E && rawBuffer[3] === 0x47) ||
        (rawBuffer[0] === 0x52 && rawBuffer[1] === 0x49 && rawBuffer[2] === 0x46 && rawBuffer[3] === 0x46)
      )) {
        return NextResponse.json({ error: "File bukan gambar JPG/PNG/WebP yang valid." }, { status: 400 });
      }
      const mime = file.type || "image/jpeg";
      imageBase64 = `data:${mime};base64,${arrayBufferToBase64(arrayBuffer)}`;
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!productName.trim()) {
      return NextResponse.json({ error: "Mohon sebutkan nama produk yang baru dipakai" }, { status: 400 });
    }

    let photoUrl = "";
    if (rawBuffer) {
      try {
        const filePath = `${userId}/${Date.now()}-purging.webp`;
        photoUrl = await uploadPhoto(filePath, rawBuffer, "image/webp");
      } catch (err) {
        console.error("R2 upload failed:", err);
        return NextResponse.json(
          { error: "Gagal mengupload foto ke storage. Cek konfigurasi R2." },
          { status: 500 }
        );
      }
    }

    const result = await checkPurging(imageBase64, productName.trim()).catch(() => null);

    const today = new Date().toISOString().split("T")[0];

    if (!result) {
      if (photoUrl) {
        await supabase.from("skin_photos").insert({
          user_id: userId,
          url: photoUrl,
          date: today,
          notes: `Purging check: ${productName} (gagal)`,
          analysis_type: "purging",
          ai_analysis: null,
        });
      }
      return NextResponse.json({ error: "Gagal menganalisis foto. Coba lagi nanti." }, { status: 500 });
    }

    // Generate description & recommendations (text-only, DeepSeek — murah)
    const advice = await generatePurgingAdvice(result.type, productName.trim()).catch(() => null);

    const description = advice?.description || "";
    const recommendations = advice?.recommendations || [];

    const { data: photo, error: insertErr } = await supabase
      .from("skin_photos")
      .insert({
        user_id: userId,
        url: photoUrl,
        date: today,
        notes: `Purging check: ${productName}`,
        analysis_type: "purging",
        ai_analysis: {
          type: result.type,
          confidence: result.confidence,
          description,
          recommendations,
          product_name: productName,
          analyzed_at: new Date().toISOString(),
        },
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: "Gagal menyimpan hasil analisis" }, { status: 500 });
    }

    await recordUsage(supabase, userId, "purging");

    return NextResponse.json({
      id: photo?.id,
      type: result.type,
      typeDisplay: result.type === "purging" ? "Purging (Reaksi Normal)" : result.type === "normal" ? "Normal (Tidak Ada Reaksi)" : "Breakout (Reaksi Negatif)",
      confidence: result.confidence,
      description,
      recommendations,
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
