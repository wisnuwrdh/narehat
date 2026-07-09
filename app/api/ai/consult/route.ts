import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consult } from "@/lib/ai/rag";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt + 60_000) rateLimitMap.delete(key);
  }
}, 60_000);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.plan === "free") {
      return NextResponse.json(
        {
          error: "Premium required",
          message:
            "AI Consultant adalah fitur premium. Upgrade plan kamu untuk mengakses konsultasi AI berbasis jurnal dermatologi.",
        },
        { status: 403 }
      );
    }

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi dalam 1 menit." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const question = String(body.question || "").trim().slice(0, 500);

    if (!question) {
      return NextResponse.json(
        { error: "Pertanyaan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const INJECTION_PATTERNS = [
      /abaikan\s{0,3}(?:semua|seluruh)\s{0,3}(?:instruksi|perintah|aturan)/i,
      /(?:tampilkan|bocorkan|sebutkan|tulis)\s{0,3}(?:system prompt|instruksi internal|aturan internal)/i,
      /kamu\s{0,3}sekarang\s{0,3}(?:adalah|jadi)/i,
      /ignore\s{0,3}(?:all|previous)\s{0,3}instructions/i,
      /diagnos[ai]\s{0,3}(?:kanlah|kan|a)/i,
      /resepkan\s{0,3}obat/i,
      /(?:beri|kasih|tulis)\s{0,3}(?:tahu\s)?\s{0,3}diagnos[ai]/i,
      /(?:kanker|tumor|HIV|AIDS|hepatitis|covid)/i,
    ];

    if (INJECTION_PATTERNS.some((p) => p.test(question))) {
      return NextResponse.json(
        { error: "Pertanyaan tidak sesuai kebijakan. AI Consultant Narehat tidak memberikan diagnosis medis atau meresepkan obat. Silakan konsultasikan ke dokter kulit untuk hal tersebut." },
        { status: 400 }
      );
    }

    let insightContext: string | undefined;

    const { data: recentInsights } = await supabase
      .from("insights")
      .select("title, description, type, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(3);

    if (recentInsights && recentInsights.length > 0) {
      insightContext = recentInsights
        .map(
          (i) =>
            `[${i.type}] ${i.title} (${i.date}): ${i.description}`
        )
        .join("\n");
    }

    const result = await consult(question, insightContext);

    return NextResponse.json({
      question,
      answer: result.answer,
      sources: result.sources,
      disclaimer: result.disclaimer,
    });
  } catch (error) {
    console.error("AI consult error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pertanyaan. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
