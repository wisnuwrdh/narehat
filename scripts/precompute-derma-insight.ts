/**
 * Narehat — Precompute Dermatology Insight untuk Rekomendasi Produk
 *
 * Usage: npx tsx scripts/precompute-derma-insight.ts
 *
 * Untuk tiap produk aktif: generate embedding dari konteks produk
 * (nama/brand/kategori/ingredients/why/concerns), cari jurnal relevan via
 * match_documents, lalu minta LLM membuat ringkasan 2-3 kalimat Bahasa
 * Indonesia. Hasil disimpan ke kolom derma_insight & derma_sources.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";
const MODEL = "deepseek-v4-flash";

function loadEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), ".env.local");
  const env: Record<string, string> = {};
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    console.warn("⚠️  .env.local not found, using process.env");
  }
  return env;
}

interface MatchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  similarity: number;
}

async function main() {
  console.log("🚀 Precompute Dermatology Insight\n");

  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = env.SUMOPOD_API_KEY;

  if (!supabaseUrl || !serviceKey || !apiKey) {
    console.error("❌ Env NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUMOPOD_API_KEY wajib ada di .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: products, error } = await supabase
    .from("recommendations")
    .select("id, name, brand, category, ingredients, why, skin_types, concerns")
    .eq("is_active", true);

  if (error) {
    console.error(`❌ Gagal mengambil produk: ${error.message}`);
    process.exit(1);
  }
  if (!products || products.length === 0) {
    console.log("❌ Tidak ada produk aktif.");
    process.exit(1);
  }
  console.log(`📦 ${products.length} produk aktif ditemukan\n`);

  async function generateEmbedding(text: string): Promise<number[]> {
    const res = await fetch(`${SUMOPOD_BASE_URL}/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text, dimensions: 384 }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Embedding API error: ${res.status} ${err}`);
    }
    const data = await res.json();
    return data.data?.[0]?.embedding || new Array(384).fill(0);
  }

  async function searchJournals(query: string, limit = 3, threshold = 0.28): Promise<MatchResult[]> {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
    });
    if (error) throw error;
    return (data || []) as MatchResult[];
  }

  async function summarize(productName: string, context: string): Promise<string> {
    const prompt = `Kamu adalah asisten edukasi skincare Narehat. Berdasarkan potongan jurnal dermatologi di bawah, tulis RINGKASAN PENDek dalam 2-3 kalimat Bahasa Indonesia mengapa produk "${productName}" direkomendasikan. Gaya edukatif untuk orang awam, tanpa jargon berat. JANGAN berikan diagnosis medis, JANGAN meresepkan obat, JANGAN menyebut tingkat keparahan. Jika konteks jurnal tidak relevan, tulis "Referensi dermatologi spesifik belum tersedia untuk produk ini."

KONTEKS JURNAL:
${context}`;

    const res = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "Kamu adalah asisten edukasi skincare berbasis jurnal dermatologi." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.25,
        reasoning_effort: "none",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Chat API error: ${res.status} ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  }

  let ok = 0;
  let failed = 0;

  for (const p of products) {
    console.log(`🔎 ${p.name} (${p.category})`);

    const query = [
      p.name,
      p.brand,
      p.category,
      p.ingredients,
      p.why,
      Array.isArray(p.concerns) ? p.concerns.join(", ") : "",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const matches = await searchJournals(query);
      if (!matches.length) {
        console.log("   ⚠️  tidak ada jurnal relevan, simpan fallback");
        const { error: upErr } = await supabase
          .from("recommendations")
          .update({ derma_insight: "Referensi dermatologi spesifik belum tersedia untuk produk ini.", derma_sources: [] })
          .eq("id", p.id);
        if (upErr) throw upErr;
        failed++;
        continue;
      }

      const context = matches
        .map((m, i) => `[JURNAL ${i + 1}] ${m.title}\nSumber: ${m.source}\nIsi: ${m.content}`)
        .join("\n\n");

      const insight = await summarize(p.name, context);
      const sources = matches.map((m) => `${m.title} — ${m.source}`);

      const { error: upErr } = await supabase
        .from("recommendations")
        .update({ derma_insight: insight, derma_sources: sources })
        .eq("id", p.id);
      if (upErr) throw upErr;

      ok++;
      console.log(`   ✅ insight tersimpan (${matches.length} jurnal)`);
    } catch (e) {
      failed++;
      console.error(`   ❌ gagal: ${(e as Error).message}`);
    }
  }

  console.log(`\n✅ Selesai. Berhasil: ${ok}, gagal: ${failed}.`);
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});
