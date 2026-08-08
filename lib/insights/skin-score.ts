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

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  max: number;
  current: number;
  evidence: "kuat" | "moderat" | "lemah" | "belum-terkonfirmasi";
  evidenceText: string;
}

export function breakdownScore(log: SkinScoreInput | null | undefined): ScoreBreakdownItem[] {
  if (!log) return [];

  const sleep = Math.min((log.sleep_hours || 0) / 8, 1) * 15;
  const water = Math.min((log.water_ml || 0) / 2500, 1) * 10;
  const exercise = Math.min((log.exercise_minutes || 0) / 30, 1) * 10;
  const stress = (1 - ((log.stress_level || 5) - 1) / 4) * 10;
  const skincare = (log.skincare_morning ? 7 : 0) + (log.skincare_evening ? 8 : 0);

  const items: ScoreBreakdownItem[] = [
    { key: "sleep", label: "Tidur", max: 15, current: sleep, evidence: "moderat", evidenceText: "Bukti campuran — kaitannya nyata namun levelnya bervariasi antar studi." },
    { key: "water", label: "Hidrasi", max: 10, current: water, evidence: "lemah", evidenceText: "Masuk akal secara klinis, tapi bukti spesifik untuk jerawat masih terbatas." },
    { key: "exercise", label: "Olahraga", max: 10, current: exercise, evidence: "lemah", evidenceText: "Masuk akal secara klinis, tapi bukti spesifik untuk jerawat masih terbatas." },
    { key: "stress", label: "Stres", max: 10, current: stress, evidence: "kuat", evidenceText: "Faktor dengan bukti paling kuat dalam literatur jerawat." },
    { key: "skincare", label: "Skincare", max: 15, current: skincare, evidence: "lemah", evidenceText: "Masuk akal secara klinis, tapi bukti spesifik untuk jerawat masih terbatas." },
  ];

  return items.map((i) => ({ ...i, current: Math.round(i.current * 10) / 10 }));
}