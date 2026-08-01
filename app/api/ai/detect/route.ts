import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { detectAcne } from "@/lib/ai/vision";
import { generateSkinTips } from "@/lib/ai/tips";
import { uploadPhoto } from "@/lib/storage/r2";
import { arrayBufferToBase64 } from "@/lib/utils/binary";
import { countMonthlyUsage, getDetectModel, getPlanBucket, getPlanQuota, recordUsage } from "@/lib/ai/limits";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const supabase = createDBClient();

    const { data: profile } = await supabase
      .from("users")
      .select("plan, plan_expires_at")
      .eq("id", userId)
      .maybeSingle();

    const bucket = getPlanBucket(profile?.plan, profile?.plan_expires_at);
    const detectLimit = getPlanQuota(bucket).detect;
    const detectUsed = await countMonthlyUsage(supabase, userId, "detect");

    if (detectUsed >= detectLimit) {
      const upgrade =
        bucket === "free"
          ? "Upgrade ke Premium untuk 30x/bulan."
          : "Upgrade ke Pro untuk 100x/bulan.";
      return NextResponse.json(
        {
          error: "Batas deteksi bulanan tercapai",
          message: `Kamu sudah menggunakan ${detectLimit}x AI Deteksi bulan ini. ${upgrade}`,
          detect_remaining: 0,
          detect_limit: detectLimit,
        },
        { status: 402 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
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

    // 1. Upload to R2 first (fail fast, proper error message)
    let photoUrl = "";
    if (rawBuffer) {
      try {
        const filePath = `${userId}/${Date.now()}-detect.webp`;
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
    const model = getDetectModel(bucket);
    const result = await detectAcne(imageBase64, model).catch(() => null);

    const today = new Date().toISOString().split("T")[0];

    if (!result) {
      if (photoUrl) {
        await supabase.from("skin_photos").insert({
          user_id: userId,
          url: photoUrl,
          date: today,
          notes: "AI Detection (gagal)",
          analysis_type: "detect",
          ai_analysis: null,
        });
      }
      return NextResponse.json({ error: "Gagal menganalisis foto. Coba lagi nanti." }, { status: 500 });
    }

    const analysisData = {
      types: result.types,
      severity: result.severity,
      confidence: result.confidence,
      location: result.location,
      triggers: result.triggers,
      analyzed_at: new Date().toISOString(),
    };

    await supabase.from("skin_photos").insert({
      user_id: userId,
      url: photoUrl,
      date: today,
      notes: "AI Detection",
      analysis_type: "detect",
      ai_analysis: analysisData,
    });

    await recordUsage(supabase, userId, "detect");

    const detectRemaining = Math.max(0, detectLimit - detectUsed - 1);

    const isCleanSkin = result.types.length === 0;

    const severityLabels: Record<string, string> = {
      mild: "Ringan",
      moderate: "Sedang",
      informative: isCleanSkin ? "Kulit Bersih" : "Tidak Terdeteksi",
    };

    const typeLabels: Record<string, string> = {
      papules: "Papula (benjolan merah kecil)",
      pustules: "Pustula (nanah di ujung)",
      nodules: "Nodul (benjolan keras dalam)",
      cystic: "Kistik (besar, sakit, dalam)",
      comedonal: "Komedo (komedo)",
      blackheads: "Komedo hitam",
      whiteheads: "Komedo putih",
    };

    // 3. Generate personal tips (text-only, DeepSeek — murah)
    const tips = await generateSkinTips({
      types: result.types,
      severity: result.severity,
      location: result.location,
    }).catch(() => []);

    // Trend tracking: compare with previous scan
    const { data: prevPhoto } = await supabase
      .from("skin_photos")
      .select("ai_analysis")
      .eq("user_id", userId)
      .eq("analysis_type", "detect")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let trend: string | null = null;
    if (prevPhoto?.ai_analysis) {
      const prev = prevPhoto.ai_analysis as { severity?: string };
      if (prev.severity && result.severity !== prev.severity) {
        const rank: Record<string, number> = { informative: 0, mild: 1, moderate: 2 };
        const curRank = rank[result.severity] ?? 1;
        const prevRank = rank[prev.severity] ?? 1;
        if (curRank < prevRank) trend = "membaik";
        else if (curRank > prevRank) trend = "memburuk";
      }
    }

    return NextResponse.json({
      types: result.types,
      typesDisplay: isCleanSkin
        ? ["Tidak terdeteksi jerawat"]
        : result.types.map((t: string) => typeLabels[t] || t),
      severity: result.severity,
      severityDisplay: severityLabels[result.severity] || result.severity,
      confidence: result.confidence,
      location: isCleanSkin ? "" : result.location,
      triggers: isCleanSkin ? [] : result.triggers,
      tips,
      trend,
      is_clean_skin: isCleanSkin,
      detect_remaining: detectRemaining,
      detect_limit: detectLimit,
      disclaimer:
        "Hasil ini bersifat informatif, bukan diagnosis medis. Konsultasikan ke dokter kulit untuk evaluasi lebih lanjut.",
    });
  } catch (err) {
    console.error("Detect route crash:", err);
    return NextResponse.json(
      { error: `Internal error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
