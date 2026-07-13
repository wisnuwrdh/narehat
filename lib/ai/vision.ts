export async function detectAcne(imageBase64: string): Promise<{
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

  const response = await fetch("https://ai.sumopod.com/v1/chat/completions", {
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
          content: `Kamu adalah AI dermatologi untuk analisis jerawat dari foto. Tugasmu: analisis foto kulit wajah dan return JSON.

ATURAN PENTING:
- JANGAN memberikan diagnosis medis
- JANGAN menyatakan keparahan sebagai "ringan/sedang/parah" — gunakan "mild/moderate/informative" sebagai deskripsi objektif
- JANGAN merekomendasikan obat
- Fokus pada OBSERVASI objektif: jenis lesi, lokasi, estimasi faktor pemicu

RESPONSE FORMAT (JSON only, no markdown):
{
  "types": ["papules", "pustules", ...],
  "severity": "mild|moderate|informative",
  "confidence": 0.0-1.0,
  "location": "pipi kiri|dagu|dahi|...",
  "triggers": ["hormonal", "diet", "stress", "skincare", ...]
}

Valid types: papules, pustules, nodules, cystic, comedonal, blackheads, whiteheads
Valid triggers: hormonal, diet, stress, skincare, maskne, sleep, hygiene, friction`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analisis foto kulit ini. Identifikasi jenis jerawat, lokasi, dan estimasi faktor pemicu. Return JSON sesuai format.",
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
