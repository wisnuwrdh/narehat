/**
 * Narehat — Journal Ingestion Pipeline
 *
 * Usage: npx tsx scripts/ingest-journals.ts
 *
 * Reads .txt files from data/journals/, chunks text,
 * generates embeddings via @xenova/transformers,
 * inserts into Supabase pgvector documents table.
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { readFileSync } from "fs";

const JOURNAL_DIR = resolve(process.cwd(), "data/journals");
const CHUNK_SIZE_WORDS = 350;

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

function parseFile(text: string, filename: string): Journal | null {
  const lines = text.split("\n");
  let title = "";
  let source = "";
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toUpperCase().startsWith("JUDUL:")) {
      title = line.slice(6).trim();
    } else if (line.toUpperCase().startsWith("SUMBER:")) {
      source = line.slice(7).trim();
    } else if (line.toUpperCase().startsWith("ISI:")) {
      contentStart = i + 1;
      break;
    }
  }

  if (!title || !source) {
    console.warn(`⚠️  Skipping ${filename}: missing JUDUL or SUMBER`);
    return null;
  }

  const content = lines
    .slice(contentStart)
    .join("\n")
    .trim();

  if (!content) {
    console.warn(`⚠️  Skipping ${filename}: empty content`);
    return null;
  }

  return { title, source, content };
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

  console.log("📁 Reading journals from data/journals/...");
  const files = (await readdir(JOURNAL_DIR)).filter(
    (f) => f.endsWith(".txt") || f.endsWith(".md")
  );

  if (!files.length) {
    console.log("❌ No .txt files found in data/journals/");
    console.log("💡 Format: JUDUL: ...\nSUMBER: ...\nISI: ...");
    process.exit(1);
  }

  console.log(`📚 Found ${files.length} files\n`);

  console.log("🧠 Loading embedding model (all-MiniLM-L6-v2)...");
  const { pipeline } = await import("@xenova/transformers");
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  console.log("✅ Embedding model ready\n");

  let totalChunks = 0;
  let errors = 0;

  for (let f = 0; f < files.length; f++) {
    const filename = files[f];
    const filepath = join(JOURNAL_DIR, filename);

    let text: string;
    try {
      text = await readFile(filepath, "utf-8");
    } catch {
      console.error(`❌ Cannot read ${filename}, skipping`);
      errors++;
      continue;
    }

    const journal = parseFile(text, filename);
    if (!journal) {
      errors++;
      continue;
    }

    const chunks = chunkText(journal.content, CHUNK_SIZE_WORDS);

    for (let c = 0; c < chunks.length; c++) {
      const chunk = chunks[c];
      const chunkTitle =
        chunks.length > 1
          ? `${journal.title} (part ${c + 1}/${chunks.length})`
          : journal.title;

      progressBar(c + 1, chunks.length, `  📄 ${filename} (${f + 1}/${files.length})`);

      let embedding: number[];
      try {
        const result = await embedder(chunk, {
          pooling: "mean",
          normalize: true,
        });
        embedding = Array.from(result.data);
      } catch {
        errors++;
        continue;
      }

      const { error } = await supabase.from("documents").insert({
        title: chunkTitle,
        content: chunk,
        source: journal.source,
        embedding,
      });

      if (error) {
        console.error(`\n  ❌ Insert error: ${error.message}`);
        errors++;
      } else {
        totalChunks++;
      }
    }

    console.log(""); // newline after progress bar
  }

  console.log(`\n✅ Done! ${files.length} journals → ${totalChunks} chunks inserted.`);
  if (errors) console.log(`⚠️  ${errors} errors encountered.`);
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});
