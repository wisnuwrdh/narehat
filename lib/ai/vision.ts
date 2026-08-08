export async function detectAcne(imageBase64: string, model = "gpt-5-nano"): Promise<{
  types: string[];
  severity: string;
  confidence: number;
  location: string;
  triggers: string[];
} | null> {
  const apiKey = process.env.SUMOPOD_API_KEY;
  if (!apiKey) {
    console.error("SUMOPOD_API_KEY is not set");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const isReasoning = model.startsWith("gpt-5");

  const response = await fetch("https://ai.sumopod.com/v1/chat/completions", {
    signal: controller.signal,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      ...(isReasoning ? { reasoning_effort: "low" } : {}),
      messages: [
        {
          role: "system",
          content: `Kamu adalah AI dermatologi untuk analisis jerawat dari foto. Tugasmu: analisis foto kulit wajah dan return JSON.
Akurasi sangat penting. Jangan MEMAKSA mendeteksi jerawat jika memang tidak ada.

ATURAN PENTING:
- JANGAN memberikan diagnosis medis
- JANGAN menyatakan keparahan sebagai "ringan/sedang/parah" — gunakan "mild/moderate/informative" sebagai deskripsi objektif
- JANGAN merekomendasikan obat
- Fokus pada OBSERVASI objektif: jenis lesi, lokasi, estimasi faktor pemicu
- Jika kulit bersih / tidak ada jerawat: types = [], severity = "informative", confidence = 0.9-1.0, location = "", triggers = []
- JANGAN paksa mengisi location atau triggers jika tidak relevan

RESPONSE FORMAT (JSON only, no markdown):
{
  "types": ["papules", "pustules", ...],
  "severity": "mild|moderate|informative",
  "confidence": 0.0-1.0,
  "location": "pipi kiri|dagu|dahi|...",
  "triggers": ["hormonal", "diet", "stress", "skincare", ...]
}

Valid types: papules, pustules, nodules, cystic, comedonal, blackheads, whiteheads
Valid triggers: hormonal, diet, stress, skincare, maskne, sleep, hygiene, friction

Contoh response benar untuk kulit bersih:
{"types":[],"severity":"informative","confidence":0.97,"location":"","triggers":[]}

Contoh response benar untuk kulit berjerawat:
{"types":["papules","pustules"],"severity":"moderate","confidence":0.8,"location":"dagu, pipi kiri","triggers":["hormonal","stress"]}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analisis foto kulit ini. Apakah ada jerawat? Jika ada, identifikasi jenis, lokasi, dan faktor pemicu. Jika tidak ada, return sesuai aturan. Return JSON.",
            },
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "low" },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.1,
    }),
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const err = await response.text();
    console.error("SumoPod vision error:", response.status, err);
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) return null;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const result = JSON.parse(jsonMatch[0]);
    return {
      types: Array.isArray(result.types) ? result.types : [],
      severity: result.severity || "informative",
      confidence: typeof result.confidence === "number" ? result.confidence : 0,
      location: result.location || "",
      triggers: Array.isArray(result.triggers) ? result.triggers : [],
    };
  } catch {
    return null;
  }
}
