import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectAcne } from "@/lib/ai/vision";

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

  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = file.type || "image/jpeg";
    imageBase64 = `data:${mime};base64,${buffer.toString("base64")}`;
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const result = await detectAcne(imageBase64);
  if (!result) {
    return NextResponse.json({ error: "Gagal menganalisis foto. Coba lagi nanti." }, { status: 500 });
  }

  await supabase.from("skin_photos").insert({
    user_id: user.id,
    url: imageBase64,
    date: new Date().toISOString().split("T")[0],
    notes: "AI Detection",
    analysis_type: "detect",
    ai_analysis: {
      types: result.types,
      severity: result.severity,
      confidence: result.confidence,
      location: result.location,
      triggers: result.triggers,
      analyzed_at: new Date().toISOString(),
    },
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
