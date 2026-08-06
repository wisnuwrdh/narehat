"use server";

import { createDBClient } from "@/lib/supabase/server";

const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) return new Array(384).fill(0);

  const apiKey = process.env.SUMOPOD_API_KEY;
  if (!apiKey) throw new Error("SUMOPOD_API_KEY not set");

  const res = await fetch(`${SUMOPOD_BASE_URL}/embeddings`, {
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

interface MatchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  similarity: number;
}

export async function querySimilar(
  embedding: number[],
  limit = 4,
  threshold = 0.3
): Promise<MatchResult[]> {
  const supabase = createDBClient();
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) throw error;
  return (data || []) as MatchResult[];
}
