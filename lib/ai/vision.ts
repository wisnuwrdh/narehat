import type { DetectDepth } from "./limits";

const DETAIL_INSTRUCTIONS = `
Tambahan untuk analisis detail (PREMIUM):
- Tambahkan field "per_lesion": array rincian per jenis lesi dengan perkiraan jumlah dan deskripsi singkat.
- Tambahkan field "trigger_explanation": kalimat 1-2 yang menjelaskan kenapa trigger utama muncul pada kondisi ini.

Formatt per_lesion: [{"type": "papules", "count": 3, "description": "3 benjolan merah kecil di dagu"}]
Jika kulit bersih, per_lesion = [], trigger_explanation = "".
`;

const DEEP_INSTRUCTIONS = `
Tambahan untuk analisis "deep" (PRO):
- Tambahkan field "region_scores": penilaian 0-10 per area wajah (dahi, pipi kiri, pipi kanan, hidung, dagu) yang menampkan tingkat masalah.
- Tambahkan field "top_risks": 2-3 area paling bermasalah dengan alasan singkat.
- Berikan analisis yang paling mendalam dan actionable dengan GPT-5 penuh.

Formulas region_cores: [{"region": "pipi kiri", "score": 0.7, "note": "kepadatan papula tertinggi"}]
Formulas top_risks: [{"area": "dagu", "reason": "4 pustula aktif"}]
- Jika kulit bersih, region_cores = [], top_risks = [].
`;

export async function detectAcne(imageBase64: string, model = "gpt-5-nano", depth: DetectDepth = "basic"): Promise<{
  types: string[];
  severity: string;
  confidence: number;
  location: string;
  triggers: string[];
  per_lesion?: { type: string; count: number; description: string }[];
  trigger_explanation?: string;
  region_scores?: { region: string; score: number; note: string }[];
  top_risks?: { area: string; reason: string }[];
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
{"types":["papules","pustules"],"severity":"moderate","confidence":0.8,"location":"dagu, pipi kiri","triggers":["hormonal","stress"]}${depth === "detail" ? DETAIL_INSTRUCTIONS : depth === "deep" ? DEEP_INSTRUCTIONS : ""}`,
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
      max_tokens: depth === "deep" ? 1000 : depth === "detail" ? 600 : 300,
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
    const parsed: {
      types: string[];
      severity: string;
      confidence: number;
      location: string;
      triggers: string[];
      per_lesion?: { type: string; count: number; description: string }[];
      trigger_explanation?: string;
      region_scores?: { region: string; score: number; note: string }[];
      top_risks?: { area: string; reason: string }[];
    } = {
      types: Array.isArray(result.types) ? result.types : [],
      severity: result.severity || "informative",
      confidence: typeof result.confidence === "number" ? result.confidence : 0,
      location: result.location || "",
      triggers: Array.isArray(result.triggers) ? result.triggers : [],
    };
    if (depth === "detail" || depth === "deep") {
      parsed.per_lesion = Array.isArray(result.per_lesion) ? result.per_lesion : [];
      parsed.trigger_explanation =
        typeof result.trigger_explanation === "string" ? result.trigger_explanation : "";
    }
    if (depth === "deep") {
      parsed.region_scores = Array.isArray(result.region_scores) ? result.region_scores : [];
      parsed.top_risks = Array.isArray(result.top_risks) ? result.top_risks : [];
    }
    return parsed;
  } catch {
    return null;
  }
}
