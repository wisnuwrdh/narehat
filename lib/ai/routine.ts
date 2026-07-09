const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";

interface RoutineAnalysis {
  issues: { type: string; detail: string }[];
  warnings: string[];
  suggestions: { step: string; reason: string }[];
  disclaimer: string;
}

interface RoutinePlan {
  am_routine: { step: number; name: string; description: string; productHint: string }[];
  pm_routine: { step: number; name: string; description: string; productHint: string }[];
  tips: string[];
  disclaimer: string;
}

function getApiKey(): string | null {
  return process.env.SUMOPOD_API_KEY || null;
}

async function callSumoPod(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("SUMOPOD_API_KEY is not set");
    return null;
  }

  const response = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
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
      max_tokens: 800,
      temperature: 0.4,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function analyzeRoutine(products: string[]): Promise<RoutineAnalysis | null> {
  const productList = products.map((p, i) => `${i + 1}. ${p}`).join("\n");

  const systemPrompt = `Kamu adalah AI Analis Skincare Narehat. Tugasmu: analisis daftar produk skincare user dan deteksi masalah.

ATURAN:
- JANGAN memberikan diagnosis medis
- JANGAN merekomendasikan obat resep
- Analisis berdasarkan ingredients, urutan pemakaian, dan kompatibilitas produk
- Return JSON only, no markdown

JENIS MASALAH YANG PERLU DIDETEKSI:
- conflict: dua produk tidak cocok dipakai bersamaan (contoh: AHA + retinol bareng)
- over_exfoliation: terlalu banyak exfoliant dalam rutinitas
- wrong_order: urutan pemakaian salah
- missing_step: langkah penting hilang (misal: tidak ada sunscreen di AM)
- irritant: produk mengandung bahan iritan untuk skin type user
- duplicate: dua produk dengan fungsi sama

FORMAT JSON:
{
  "issues": [
    { "type": "conflict|over_exfoliation|wrong_order|missing_step|irritant|duplicate", "detail": "penjelasan dalam bahasa Indonesia" }
  ],
  "warnings": ["peringatan 1", "peringatan 2"],
  "suggestions": [
    { "step": "nama langkah", "reason": "alasan dalam bahasa Indonesia" }
  ],
  "disclaimer": "disclaimer standar"
}`;

  const userPrompt = `Analisis daftar produk skincare berikut. Deteksi konflik, over-exfoliation, urutan salah, langkah yang hilang, atau iritan:\n\n${productList}\n\nReturn JSON sesuai format yang ditentukan.`;

  const content = await callSumoPod(systemPrompt, userPrompt);
  if (!content) return null;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const result = JSON.parse(jsonMatch[0]);
    return {
      issues: Array.isArray(result.issues) ? result.issues : [],
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      disclaimer: result.disclaimer || "Informasi ini bersifat edukatif, bukan pengganti diagnosis medis profesional.",
    };
  } catch {
    return null;
  }
}

export async function buildRoutine(
  skinType: string,
  budget: string,
  concern: string
): Promise<RoutinePlan | null> {
  const skinLabels: Record<string, string> = {
    oily: "Berminyak",
    dry: "Kering",
    combination: "Kombinasi",
    normal: "Normal",
    sensitive: "Sensitif",
  };
  const budgetLabels: Record<string, string> = {
    low: "Low budget (<Rp100rb/produk)",
    mid: "Mid range (Rp100rb-Rp300rb/produk)",
    high: "Premium (>Rp300rb/produk)",
  };
  const concernLabels: Record<string, string> = {
    acne: "Mengatasi jerawat aktif",
    scar: "Memudarkan bekas jerawat",
    brightening: "Mencerahkan kulit",
    anti_aging: "Anti-aging",
    barrier: "Memperbaiki skin barrier",
  };

  const skinLabel = skinLabels[skinType] || skinType;
  const budgetLabel = budgetLabels[budget] || budget;
  const concernLabel = concernLabels[concern] || concern;

  const systemPrompt = `Kamu adalah AI Routine Builder Narehat. Tugasmu: buat rutinitas skincare pagi + malam yang personal berdasarkan profile user.

ATURAN:
- JANGAN merekomendasikan obat resep
- Rekomendasi produk generik (berdasarkan ingredients), bukan brand spesifik
- Sesuaikan dengan skin type, budget, dan concern user
- Return JSON only, no markdown

FORMAT JSON:
{
  "am_routine": [
    { "step": 1, "name": "Nama langkah", "description": "penjelasan singkat", "productHint": "ingredients/keywords yang dicari (contoh: 'cleanser gentle, pH 5.5, non-comedogenic')" }
  ],
  "pm_routine": [
    { "step": 1, "name": "Nama langkah", "description": "penjelasan singkat", "productHint": "ingredients/keywords yang dicari" }
  ],
  "tips": ["tips 1", "tips 2"],
  "disclaimer": "disclaimer standar"
}

PANDUAN RUTINITAS STANDAR:
AM: Cleanser → Toner (opsional) → Serum/Treatment → Moisturizer → Sunscreen
PM: Oil Cleanser (opsional) → Water Cleanser → Toner → Serum/Treatment → Moisturizer
Sesuaikan berdasarkan skin type dan concern.`;

  const userPrompt = `Buat rutinitas skincare untuk user dengan profile:
- Tipe kulit: ${skinLabel}
- Budget: ${budgetLabel}
- Concern utama: ${concernLabel}

Return JSON sesuai format.`;

  const content = await callSumoPod(systemPrompt, userPrompt);
  if (!content) return null;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const result = JSON.parse(jsonMatch[0]);
    return {
      am_routine: Array.isArray(result.am_routine) ? result.am_routine : [],
      pm_routine: Array.isArray(result.pm_routine) ? result.pm_routine : [],
      tips: Array.isArray(result.tips) ? result.tips : [],
      disclaimer: result.disclaimer || "Informasi ini bersifat edukatif. Konsultasikan dengan dokter kulit sebelum memulai rutinitas baru.",
    };
  } catch {
    return null;
  }
}
