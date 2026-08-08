const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";

function getApiKey(): string | null {
  return process.env.SUMOPOD_API_KEY || null;
}

async function callSumoPod(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 300,
  temperature = 0.3
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
      signal: controller.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      const err = await response.text();
      console.error("SumoPod tips error:", response.status, err);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export interface SkinTipsResult {
  tips: string[];
  narrative?: string;
  trendNote?: string;
  routineHints?: string[];
}

const TIP_COUNT: Record<"basic" | "detail" | "deep", number> = {
  basic: 2,
  detail: 4,
  deep: 6,
};

export async function generateSkinTips(
  analysis: {
    types: string[];
    severity: string;
    location: string;
  },
  depth: "basic" | "detail" | "deep" = "basic",
  trendDirection?: string | null
): Promise<SkinTipsResult> {
  const hasAcne = analysis.types.length > 0;
  const count = TIP_COUNT[depth];

  const systemPrompt = `Kamu adalah asisten skincare Narehat. Tugasmu: memberikan tips skincare singkat berdasarkan hasil analisis kulit${depth === "detail" || depth === "deep" ? ", narasi ringkas tren kulit, dan rekomendasi rutinitas" : ""}.

ATURAN:
- Jangan diagnosis medis
- Jangan rekomendasi obat/resep
- Jangan saran yang membahayakan
- Tips harus spesifik sesuai kondisi, bukan template umum
- Bahasa Indonesia, santai tapi informatif
- Return JSON only, tanpa markdown

FORMAT:
${depth === "deep"
  ? `{
  "tips": ["tips 1", "tips 2", "tips 3"],
  "narrative": "1-2 kalimat narasi hasil analisis untuk user",
  "trend_note": "1-2 kalimat penjelasan arah perubahan kulit dibanding scan sebelumnya (jika ada)",
  "routine_hints": ["langkah 1", "langkah 2", "langkah 3"]
}`
  : depth === "detail"
    ? `{
  "tips": ["tips 1", "tips 2", "tips 3", "tips 4"],
  "narrative": "1 kalimat narasi hasil analisis",
  "trend_note": "1 kalimat penjelasan tren (jika ada)"
}`
    : `{
  "tips": ["tips 1", "tips 2"]
}`}`;

  const kondisi = hasAcne
    ? `Jenis: ${analysis.types.join(", ")}. Tingkat: ${analysis.severity}. Lokasi: ${analysis.location || "wajah"}.`
    : "Kulit bersih, tidak terdeteksi jerawat.";

  const trendLine = trendDirection
    ? `\nScan sebelumnya: ${trendDirection === "membaik" ? "membaik" : "memburuk"} dibanding scan terakhir.`
    : "";

  const userPrompt = `Hasil analisis kulit: ${kondisi}${trendLine}\nBeri ${count} tips singkat yang spesifik untuk kondisi ini. Return JSON yang sesuai format.`;

  const raw = await callSumoPod(systemPrompt, userPrompt);
  if (!raw) return { tips: [], narrative: "", trendNote: "", routineHints: [] };

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { tips: [], narrative: "", trendNote: "", routineHints: [] };
    const result = JSON.parse(jsonMatch[0]);
    return {
      tips: Array.isArray(result.tips) ? result.tips.map(String).filter(Boolean) : [],
      narrative: typeof result.narrative === "string" ? result.narrative : "",
      trendNote: typeof result.trend_note === "string" ? result.trend_note : "",
      routineHints: Array.isArray(result.routine_hints) ? result.routine_hints.map(String).filter(Boolean) : [],
    };
  } catch {
    console.error("SumoPod tips parse failed, raw:", raw);
    return { tips: [], narrative: "", trendNote: "", routineHints: [] };
  }
}

export async function generatePurgingAdvice(
  type: string,
  productName: string,
  options: { recoCount?: number; historyChecks?: number } = {}
): Promise<{ description: string; recommendations: string[] } | null> {
  const recoCount = Math.min(4, Math.max(1, options.recoCount || 2));
  const historyChecks = options.historyChecks || 0;

  const systemPrompt = `Kamu adalah asisten skincare Narehat. Tugasmu: berikan deskripsi dan rekomendasi berdasarkan hasil analisis purging/breakout.

ATURAN:
- Jangan diagnosis medis
- Jangan rekomendasi obat/resep
- Bahasa Indonesia, maksimal 2 kalimat untuk deskripsi
- Berikan tepat ${recoCount} rekomendasi singkat yang spesifik untuk kondisi ini
- Return JSON only, no markdown

FORMAT:
{
  "description": "deskripsi singkat",
  "recommendations": ["rekomendasi 1", "rekomendasi 2"]
}`;

  const historyLine =
    historyChecks > 0
      ? `\nKonteks: user sudah pernah mengecek produk "${productName}" ${historyChecks} kali sebelumnya. Tunjukkan progres/pola yang terpantau di rekomendasi.`
      : "";

  const userPrompt = `User menggunakan produk "${productName}". Hasil deteksi: ${type}.${historyLine}
Beri deskripsi singkat dan tepat ${recoCount} rekomendasi. Return JSON.`;

  const raw = await callSumoPod(systemPrompt, userPrompt, 400);
  if (!raw) return null;

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const result = JSON.parse(jsonMatch[0]);
    return {
      description: result.description || "",
      recommendations: Array.isArray(result.recommendations)
        ? result.recommendations.slice(0, recoCount)
        : [],
    };
  } catch {
    return null;
  }
}
