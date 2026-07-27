import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectAcne } from "@/lib/ai/vision";
import { uploadPhoto } from "@/lib/storage/r2";
import { compressToWebP } from "@/lib/image/compress";
import { arrayBufferToBase64 } from "@/lib/utils/binary";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.plan === "free") {
    return NextResponse.json({ error: "Fitur premium. Upgrade plan kamu." }, { status: 402 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
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

  // 1. Upload to R2 first (fail fast, proper error message)
  let photoUrl = "";
  if (rawBuffer) {
    try {
      const compressed = await compressToWebP(rawBuffer);
      const filePath = `${user.id}/${Date.now()}-detect.webp`;
      photoUrl = await uploadPhoto(filePath, compressed, "image/webp");
    } catch (err) {
      console.error("R2 upload failed:", err);
      return NextResponse.json(
        { error: "Gagal mengupload foto ke storage. Cek konfigurasi R2." },
        { status: 500 }
      );
    }
  }

  // 2. AI analysis
  const result = await detectAcne(imageBase64);

  const today = new Date().toISOString().split("T")[0];

  if (!result) {
    if (photoUrl) {
      await supabase.from("skin_photos").insert({
        user_id: user.id,
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
    user_id: user.id,
    url: photoUrl,
    date: today,
    notes: "AI Detection",
    analysis_type: "detect",
    ai_analysis: analysisData,
  });

  const severityLabels: Record<string, string> = {
    mild: "Ringan",
    moderate: "Sedang",
    informative: "Perlu Observasi",
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

  const typeTips: Record<string, string[]> = {
    papules: ["Hindari menyentuh atau memencet — bisa infeksi", "Kompres dingin bantu redakan peradangan"],
    pustules: ["Jangan pecahkan pustula — risiko bekas luka", "Hindari scrub kasar di area ini"],
    nodules: ["Nodul adalah jerawat dalam, butuh waktu sembuh lebih lama", "Konsultasi ke dokter untuk penanganan lanjut"],
    cystic: ["Kistik butuh penanganan medis — jangan dipencet", "Segera konsultasi ke dokter kulit"],
    comedonal: ["Eksfoliasi rutin (AHA/BHA) bisa membantu", "Pastikan membersihkan wajah 2× sehari"],
    blackheads: ["Eksfoliasi rutin bisa membantu", "Hindari pore strip berlebihan"],
    whiteheads: ["Produk dengan salicylic acid bisa membantu", "Jaga kelembapan kulit tetap seimbang"],
  };

  const severityTips: Record<string, string[]> = {
    mild: ["Kondisi masih terkendali, lanjutkan rutinitas skincare", "Catat perkembangan setiap minggu"],
    moderate: ["Perhatikan perubahan — jika memburuk dalam 2 minggu, konsultasi ke dokter", "Pastikan produk yang dipakai cocok"],
    informative: ["Tidak terdeteksi jerawat aktif yang signifikan", "Tetap jaga rutinitas skincare harian"],
  };

  // Trend tracking: compare with previous scan
  const { data: prevPhoto } = await supabase
    .from("skin_photos")
    .select("ai_analysis")
    .eq("user_id", user.id)
    .eq("analysis_type", "detect")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let trend: string | null = null;
  if (prevPhoto?.ai_analysis) {
    const prev = prevPhoto.ai_analysis as { severity?: string };
    if (prev.severity && result.severity !== prev.severity) {
      const rank: Record<string, number> = { mild: 0, moderate: 1, informative: 2 };
      const curRank = rank[result.severity] ?? 1;
      const prevRank = rank[prev.severity] ?? 1;
      if (curRank < prevRank) trend = "membaik";
      else if (curRank > prevRank) trend = "memburuk";
    }
  }

  // Collect tips based on detected types + severity
  const tipsSet = new Set<string>();
  for (const t of result.types) {
    const tT = typeTips[t];
    if (tT) tT.forEach((tip: string) => tipsSet.add(tip));
  }
  if (severityTips[result.severity]) {
    severityTips[result.severity].forEach((tip: string) => tipsSet.add(tip));
  }

  return NextResponse.json({
    types: result.types,
    typesDisplay: result.types.map((t: string) => typeLabels[t] || t),
    severity: result.severity,
    severityDisplay: severityLabels[result.severity] || result.severity,
    confidence: result.confidence,
    location: result.location,
    triggers: result.triggers,
    tips: Array.from(tipsSet),
    trend,
    disclaimer:
      "Hasil ini bersifat informatif, bukan diagnosis medis. Konsultasikan ke dokter kulit untuk evaluasi lebih lanjut.",
  });
}
