interface CorrelationResult {
  factor: string;
  correlation: number;
  description: string;
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 3) return 0;

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  if (varX === 0 || varY === 0) return 0;
  return cov / Math.sqrt(varX * varY);
}

function formatR(r: number): string {
  const abs = Math.abs(r);
  if (abs >= 0.7) return r > 0 ? "kuat positif" : "kuat negatif";
  if (abs >= 0.4) return r > 0 ? "sedang positif" : "sedang negatif";
  return r > 0 ? "lemah positif" : "lemah negatif";
}

export function analyzeCorrelations(
  logs: { sleep_hours: number; water_ml: number; exercise_minutes: number; stress_level: number; skincare_morning: boolean; skincare_evening: boolean }[],
  skinScores: number[]
): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  if (logs.length < 3) return results;

  const sleepVals = logs.map((l) => l.sleep_hours);
  const waterVals = logs.map((l) => l.water_ml);
  const exerciseVals = logs.map((l) => l.exercise_minutes);
  const stressVals = logs.map((l) => l.stress_level);

  const sleepR = pearson(sleepVals, skinScores);
  if (Math.abs(sleepR) >= 0.15) {
    results.push({
      factor: "Tidur",
      correlation: Math.round(sleepR * 100),
      description: sleepR > 0
        ? "Tidur cukup berkorelasi dengan kondisi kulit yang lebih baik."
        : "Kurang tidur berkorelasi dengan memburuknya kondisi kulit.",
    });
  }

  const waterR = pearson(waterVals, skinScores);
  if (Math.abs(waterR) >= 0.15) {
    results.push({
      factor: "Hidrasi",
      correlation: Math.round(waterR * 100),
      description: waterR > 0
        ? "Cukup minum air berkorelasi dengan kondisi kulit yang lebih baik."
        : "Kurang minum air berkorelasi dengan kondisi kulit yang kurang optimal.",
    });
  }

  const stressR = pearson(stressVals, skinScores);
  if (Math.abs(stressR) >= 0.15) {
    results.push({
      factor: "Stres",
      correlation: Math.round(stressR * 100),
      description: stressR > 0
        ? "Stres rendah berkorelasi dengan kondisi kulit yang lebih baik."
        : "Stres tinggi berkorelasi dengan munculnya jerawat baru.",
    });
  }

  const exerciseR = pearson(exerciseVals, skinScores);
  if (Math.abs(exerciseR) >= 0.15) {
    results.push({
      factor: "Olahraga",
      correlation: Math.round(exerciseR * 100),
      description: exerciseR > 0
        ? "Rutin olahraga berkorelasi dengan kondisi kulit yang lebih baik."
        : "Jarang olahraga berkorelasi dengan kondisi kulit yang kurang optimal.",
    });
  }

  const consistency = logs.map((l) => (l.skincare_morning && l.skincare_evening ? 1 : 0));
  const consistR = pearson(consistency, skinScores);
  if (Math.abs(consistR) >= 0.15) {
    results.push({
      factor: "Konsistensi Skincare",
      correlation: Math.round(consistR * 100),
      description: consistR > 0
        ? "Rajin skincare AM+PM berkorelasi dengan kondisi kulit yang lebih baik."
        : "Jarang skincare berkorelasi dengan kondisi kulit yang kurang optimal.",
    });
  }

  results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  return results;
}

export { type CorrelationResult };
