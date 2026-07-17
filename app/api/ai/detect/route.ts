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

  const result = await detectAcne(imageBase64);
  if (!result) {
    return NextResponse.json({ error: "Gagal menganalisis foto. Coba lagi nanti." }, { status: 500 });
  }

  if (!rawBuffer && file) {
    const ab = await file.arrayBuffer();
    rawBuffer = new Uint8Array(ab);
  }

  let photoUrl = imageBase64;
  if (rawBuffer) {
    try {
      const compressed = await compressToWebP(rawBuffer);
      const filePath = `${user.id}/${Date.now()}-detect.webp`;
      photoUrl = await uploadPhoto(filePath, compressed, "image/webp");
    } catch (err) {
      console.error("R2 upload failed:", err);
    }
  }

  rawBuffer = null;

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
    date: new Date().toISOString().split("T")[0],
    notes: "AI Detection",
    analysis_type: "detect",
    ai_analysis: analysisData,
  });

  const severityLabels: Record<string, string> = {
    mild: "Ringan",
    moderate: "Sedang",
    informative: "Informatif",
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

  return NextResponse.json({
    types: result.types,
    typesDisplay: result.types.map((t: string) => typeLabels[t] || t),
    severity: result.severity,
    severityDisplay: severityLabels[result.severity] || result.severity,
    confidence: result.confidence,
    location: result.location,
    triggers: result.triggers,
    disclaimer:
      "Hasil ini bersifat informatif, bukan diagnosis medis. Konsultasikan ke dokter kulit untuk evaluasi lebih lanjut.",
  });
}
