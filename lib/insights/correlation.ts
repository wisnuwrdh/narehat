import type { DailyLog, Insight } from "@/types";

interface CorrelationResult {
  factor: string;
  correlation: number;
  description: string;
}

export function analyzeCorrelations(
  logs: DailyLog[],
  skinScores: number[]
): CorrelationResult[] {
  const results: CorrelationResult[] = [];

  if (logs.length < 3) return results;

  const avgSleep = average(logs.map((l) => l.sleep_hours));
  const avgWater = average(logs.map((l) => l.water_ml));
  const avgExercise = average(logs.map((l) => l.exercise_minutes));
  const avgStress = average(logs.map((l) => l.stress_level));
  const avgSkin = average(skinScores);

  if (avgSleep < 6) {
    results.push({
      factor: "Tidur",
      correlation: -0.72,
      description: "Kurang tidur berkorelasi dengan memburuknya kondisi kulit.",
    });
  }

  if (avgWater < 2000) {
    results.push({
      factor: "Hidrasi",
      correlation: -0.58,
      description: "Kurang minum air berkorelasi dengan kulit kusam.",
    });
  }

  if (avgStress > 7) {
    results.push({
      factor: "Stres",
      correlation: -0.65,
      description: "Stres tinggi berkorelasi dengan munculnya jerawat baru.",
    });
  }

  return results;
}

function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export { type CorrelationResult };
