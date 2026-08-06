/**
 * Narehat — Journal Ingestion Pipeline
 *
 * Usage: npx tsx scripts/ingest-journals.ts
 *
 * Reads .txt/.md files from data/journals/, splits each file into multiple
 * journals (JUDUL/SUMBER/ISI blocks), chunks text, generates embeddings via
 * SumoPod API (text-embedding-3-small), inserts into Supabase pgvector
 * documents table. Clears the table first so re-runs never accumulate.
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { readFileSync } from "fs";

const JOURNAL_DIR = resolve(process.cwd(), "data/journals");
const CHUNK_SIZE_WORDS = 350;
const CONCURRENCY = 4;

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
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      env[key] = val;
    }
  } catch {
    console.warn("⚠️  .env.local not found, using process.env");
  }
  return env;
}

interface Journal {
  title: string;
  source: string;
  content: string;
}

interface Chunk {
  title: string;
  source: string;
  content: string;
  embedding: number[];
}

function parseJournals(text: string): Journal[] {
  const lines = text.split("\n");
  const journals: Journal[] = [];
  let current: { title: string; source: string } | null = null;
  let inContent = false;
  const content: string[] = [];

  const flush = () => {
    if (!current || !current.title || !current.source) return;
    const body = content.join("\n").trim();
    if (body) journals.push({ title: current.title, source: current.source, content: body });
  };

  for (const raw of lines) {
    const line = raw.trim();
    const upper = line.toUpperCase();
    if (upper.startsWith("JUDUL:")) {
      flush();
      current = { title: line.slice(6).trim(), source: "" };
      content.length = 0;
      inContent = false;
    } else if (upper.startsWith("SUMBER:")) {
      if (current) current.source = line.slice(7).trim();
    } else if (upper.startsWith("ISI:")) {
      inContent = true;
      const rest = line.slice(4).trim();
      if (rest) content.push(rest);
    } else if (inContent && current) {
      content.push(raw);
    }
  }
  flush();
  return journals;
}

function chunkText(text: string, maxWords: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).length;
    const currentWords = current.split(/\s+/).filter(Boolean).length;

    if (currentWords + words > maxWords && current) {
      chunks.push(current.trim());
      current = sentence + " ";
    } else {
      current += sentence + " ";
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function progressBar(current: number, total: number, label: string) {
  const width = 30;
  const filled = Math.round((current / total) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  process.stdout.write(`\r${label} [${bar}] ${current}/${total}`);
}

async function main() {
  console.log("🚀 Narehat Journal Ingestion Pipeline\n");

  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
    process.exit(1);
  }

  console.log("🔌 Connecting to Supabase...");
  const supabase = createClient(supabaseUrl, serviceKey);

  const apiKey = env.SUMOPOD_API_KEY;
  if (!apiKey) {
    console.error("❌ SUMOPOD_API_KEY not found in .env.local");
    process.exit(1);
  }

  console.log("📁 Reading journals from data/journals/...");
  const files = (await readdir(JOURNAL_DIR)).filter(
    (f) => f.endsWith(".txt") || f.endsWith(".md")
  );

  if (!files.length) {
    console.log("❌ No journal files found in data/journals/");
    console.log("💡 Format: JUDUL: ...\nSUMBER: ...\nISI: ...");
    process.exit(1);
  }

  const seen = new Set<string>();
  const journals: Journal[] = [];

  for (const filename of files) {
    let text: string;
    try {
      text = await readFile(join(JOURNAL_DIR, filename), "utf-8");
    } catch {
      console.error(`❌ Cannot read ${filename}, skipping`);
      continue;
    }

    const parsed = parseJournals(text);
    for (const journal of parsed) {
      const key = `${journal.title.trim().toLowerCase()}|${journal.source.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      journals.push(journal);
    }
  }

  console.log(`📚 ${files.length} file → ${journals.length} jurnal unik\n`);

  if (!journals.length) {
    console.log("❌ No valid journals parsed.");
    process.exit(1);
  }

  console.log("🧹 Clearing existing documents table...");
  const { error: clearError } = await supabase
    .from("documents")
    .delete()
    .gte("id", "00000000-0000-0000-0000-000000000000");
  if (clearError) {
    console.error(`❌ Failed to clear documents: ${clearError.message}`);
    process.exit(1);
  }

  async function generateEmbedding(text: string): Promise<number[]> {
    const res = await fetch("https://ai.sumopod.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 384,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Embedding API error: ${res.status} ${err}`);
    }
    const data = await res.json();
    return data.data?.[0]?.embedding || new Array(384).fill(0);
  }

  const tasks: { title: string; source: string; content: string; embedding: number[] }[] = [];

  for (const journal of journals) {
    const chunks = chunkText(journal.content, CHUNK_SIZE_WORDS);
    for (let c = 0; c < chunks.length; c++) {
      tasks.push({
        title: chunks.length > 1 ? `${journal.title} (part ${c + 1}/${chunks.length})` : journal.title,
        source: journal.source,
        content: chunks[c],
        embedding: [],
      });
    }
  }

  console.log(`🗂  ${journals.length} jurnal → ${tasks.length} chunk, embedding (${CONCURRENCY} paralel)...\n`);

  let done = 0;
  let errors = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const idx = cursor++;
      const task = tasks[idx];
      try {
        task.embedding = await generateEmbedding(task.content);
      } catch {
        errors++;
        task.embedding = [];
      }
      done++;
      progressBar(done, tasks.length, "  Embedding");
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log("");

  const rows = tasks
    .filter((t) => t.embedding.length > 0)
    .map((t) => ({ title: t.title, content: t.content, source: t.source, embedding: t.embedding }));

  console.log(`💾 Inserting ${rows.length} chunks into documents...`);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from("documents").insert(batch);
    if (error) {
      console.error(`\n  ❌ Insert error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  console.log(`\n✅ Done! ${journals.length} jurnal → ${inserted} chunks inserted.`);
  if (errors) console.log(`⚠️  ${errors} errors encountered.`);
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});
