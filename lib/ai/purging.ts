export async function checkPurging(imageBase64: string, productName: string): Promise<{
  type: string;
  confidence: number;
  description: string;
  recommendations: string[];
} | null> {
  const apiKey = process.env.SUMOPOD_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const response = await fetch("https://ai.sumopod.com/v1/chat/completions", {
    signal: controller.signal,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Kamu adalah AI dermatologi yang khusus menganalisis purging vs breakout.
Tugasmu: tentukan apakah kondisi kulit di foto adalah purging (reaksi normal produk baru), breakout (reaksi negatif/iritasi), atau normal (tidak ada reksi signifikan).

Purging = reaksi sementara saat kulit beradaptasi dengan produk baru (exfoliant/retinoid), muncul di area biasa jerawat, siklus lebih cepat.
Breakout = iritasi, alergi, atau reaksi negatif, muncul di area tidak biasa, lebih lama sembuh.
Normal = tidak ada reaksi signifikan yang terlihat.

ATURAN:
- JANGAN memberi diagnosis medis
- JANGAN merekomendasikan obat resep
- JANGAN memaksa memilih "purging" atau "breakout" jika kondisi normal
- Jika kulit terlihat normal (tidak ada reaksi signifikan): type = "normal", confidence = 0.9+
- Return JSON only, no markdown

FORMAT JSON:
{
  "type": "purging" | "breakout" | "normal",
  "confidence": 0.0-1.0,
  "description": "deskripsi singkat dalam bahasa Indonesia (maks 2 kalimat)",
  "recommendations": ["rekomendasi 1", "rekomendasi 2", ...]
}

Contoh response benar untuk kulit normal:
{"type":"normal","confidence":0.95,"description":"Kulit terlihat normal tanpa reaksi signifikan terhadap produk baru.","recommendations":["Lanjutkan pemakaian produk sesuai petunjuk","Pantau perkembangan selama 2-4 minggu ke depan"]}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `User baru mulai menggunakan produk: "${productName}". Analisis foto kulit ini — apakah ini purging, breakout, atau normal? Return JSON.`,
            },
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "auto" },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });

  clearTimeout(timeoutId);

  if (!response.ok) return null;

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const result = JSON.parse(jsonMatch[0]);
    return {
      type: result.type || "normal",
      confidence: typeof result.confidence === "number" ? result.confidence : 0,
      description: result.description || "",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    };
  } catch {
    return null;
  }
}
