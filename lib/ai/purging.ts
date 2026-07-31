export async function checkPurging(imageBase64: string, _productName: string): Promise<{
  type: string;
  confidence: number;
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
      model: "gpt-5-mini",
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content: `Kamu adalah AI dermatologi yang khusus menganalisis purging vs breakout.
Tugasmu: tentukan apakah kondisi kulit di foto adalah purging (reaksi normal produk baru), breakout (reaksi negatif/iritasi), atau normal.

Purging = reaksi sementara saat kulit beradaptasi dengan produk baru, muncul di area biasa jerawat.
Breakout = iritasi/alergi, muncul di area tidak biasa.
Normal = tidak ada reaksi signifikan.

ATURAN:
- JANGAN memberi diagnosis medis
- JANGAN memaksa memilih salah satu jika ragu
- Jika kulit normal: type = "normal", confidence = 0.9+
- Return JSON only, no markdown

FORMAT JSON:
{
  "type": "purging" | "breakout" | "normal",
  "confidence": 0.0-1.0
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analisis foto kulit ini — apakah ini purging, breakout, atau normal? Return JSON.",
            },
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "auto" },
            },
          ],
        },
      ],
      max_tokens: 200,
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
    };
  } catch {
    return null;
  }
}
