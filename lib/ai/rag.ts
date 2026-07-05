import { generateEmbedding, querySimilar } from "./embeddings";

export async function retrieveAndAnswer(question: string): Promise<string | null> {
  const embedding = await generateEmbedding(question);
  const documents = await querySimilar(embedding);

  if (!documents.length) return null;

  const context = documents.map((d: { content: string }) => d.content).join("\n\n");
  return context;
}

export async function summarizeContext(context: string, question: string): Promise<string> {
  // Placeholder — call LLM API (e.g. OpenAI or local model)
  return `Berdasarkan jurnal dermatologi: ${context.slice(0, 500)}...`;
}
