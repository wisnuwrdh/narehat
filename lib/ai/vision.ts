export async function detectAcne(imageBase64: string): Promise<{
  types: string[];
  severity: string;
  confidence: number;
} | null> {
  // Placeholder — call vision model API (e.g. OpenAI GPT-4V or Gemini)
  return {
    types: [],
    severity: "mild",
    confidence: 0,
  };
}
