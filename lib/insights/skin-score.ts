export interface SkinScoreInput {
  sleep_hours?: number;
  water_ml?: number;
  exercise_minutes?: number;
  stress_level?: number;
  skincare_morning?: boolean;
  skincare_evening?: boolean;
}

export function computeSkinScore(log: SkinScoreInput | null | undefined): number {
  if (!log) return 0;
  let score = 50;
  score += Math.min((log.sleep_hours || 0) / 8, 1) * 15;
  score += Math.min((log.water_ml || 0) / 2500, 1) * 10;
  score += Math.min((log.exercise_minutes || 0) / 30, 1) * 10;
  score += (1 - ((log.stress_level || 5) - 1) / 4) * 10;
  if (log.skincare_morning) score += 7;
  if (log.skincare_evening) score += 8;
  return Math.min(100, Math.round(score));
}