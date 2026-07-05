import { createClient } from "@/lib/supabase/server";

export async function generateEmbedding(text: string): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_embedding", { input_text: text } as any);

  if (error) throw error;
  return data;
}

export async function querySimilar(embedding: number[], limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.78,
    match_count: limit,
  } as any);

  if (error) throw error;
  return data;
}
