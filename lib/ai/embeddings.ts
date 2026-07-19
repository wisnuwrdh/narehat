"use server";

import { createClient } from "@/lib/supabase/server";
import type { FeatureExtractionPipeline } from "@xenova/transformers";

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = import("@xenova/transformers").then(({ pipeline }) =>
      pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
    );
  }
  return embedderPromise;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) return new Array(384).fill(0);

  const pipe = await getEmbedder();
  const result = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

interface MatchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  similarity: number;
}

export async function querySimilar(
  embedding: number[],
  limit = 5,
  threshold = 0.75
): Promise<MatchResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) throw error;
  return (data || []) as MatchResult[];
}
