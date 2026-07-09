export async function checkPurging(imageBase64: string, productName: string): Promise<{
  type: string;
  confidence: number;
  description: string;
  recommendations: string[];
} | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
Tugasmu: tentukan apakah kondisi kulit di foto adalah purging (reaksi normal produk baru) atau breakout (reaksi negatif/iritasi).

Purging = reaksi sementara saat kulit beradaptasi dengan produk baru (exfoliant/retinoid), muncul di area biasa jerawat, siklus lebih cepat.
Breakout = iritasi, alergi, atau reaksi negatif, muncul di area tidak biasa, lebih lama sembuh.

ATURAN:
- JANGAN memberi diagnosis medis
- JANGAN merekomendasikan obat resep
- Return JSON only, no markdown

FORMAT JSON:
{
  "type": "purging" | "breakout",
  "confidence": 0.0-1.0,
  "description": "deskripsi singkat dalam bahasa Indonesia (maks 2 kalimat)",
  "recommendations": ["rekomendasi 1", "rekomendasi 2", ...]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `User baru mulai menggunakan produk: "${productName}". Analisis foto kulit ini — apakah ini purging atau breakout? Return JSON.`,
            },
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const result = JSON.parse(jsonMatch[0]);
    return {
      type: result.type || "breakout",
      confidence: typeof result.confidence === "number" ? result.confidence : 0,
      description: result.description || "",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    };
  } catch {
    return null;
  }
}
