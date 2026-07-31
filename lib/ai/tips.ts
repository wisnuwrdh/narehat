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

export async function generateSkinTips(analysis: {
  types: string[];
  severity: string;
  location: string;
}): Promise<string[]> {
  const hasAcne = analysis.types.length > 0;

  const systemPrompt = `Kamu adalah asisten skincare Narehat. Tugasmu: berikan 2-3 tips singkat berdasarkan hasil analisis kulit.

ATURAN:
- Jangan diagnosis medis
- Jangan rekomendasi obat/resep
- Jangan saran yang membahayakan
- Tips harus spesifik sesuai kondisi, bukan template umum
- Bahasa Indonesia, santai tapi informatif
- Return JSON array of strings saja, tanpa markdown

FORMAT:
["tips 1", "tips 2", "tips 3"]`;

  const kondisi = hasAcne
    ? `Jenis: ${analysis.types.join(", ")}. Tingkat: ${analysis.severity}. Lokasi: ${analysis.location || "wajah"}.`
    : "Kulit bersih, tidak terdeteksi jerawat.";

  const userPrompt = `Hasil analisis kulit: ${kondisi}
Beri 2-3 tips singkat yang spesifik untuk kondisi ini. Return JSON array.`;

  const raw = await callSumoPod(systemPrompt, userPrompt);
  if (!raw) return [];

  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    return [];
  } catch {
    console.error("SumoPod tips parse failed, raw:", raw);
    return [];
  }
}

export async function generatePurgingAdvice(
  type: string,
  productName: string
): Promise<{ description: string; recommendations: string[] } | null> {
  const systemPrompt = `Kamu adalah asisten skincare Narehat. Tugasmu: berikan deskripsi dan rekomendasi berdasarkan hasil analisis purging/breakout.

ATURAN:
- Jangan diagnosis medis
- Jangan rekomendasi obat/resep
- Bahasa Indonesia, maksimal 2 kalimat untuk deskripsi
- Return JSON only, no markdown

FORMAT:
{
  "description": "deskripsi singkat",
  "recommendations": ["rekomendasi 1", "rekomendasi 2"]
}`;

  const userPrompt = `User menggunakan produk "${productName}". Hasil deteksi: ${type}.
Beri deskripsi singkat dan 2-3 rekomendasi. Return JSON.`;

  const raw = await callSumoPod(systemPrompt, userPrompt);
  if (!raw) return null;

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const result = JSON.parse(jsonMatch[0]);
    return {
      description: result.description || "",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    };
  } catch {
    return null;
  }
}
