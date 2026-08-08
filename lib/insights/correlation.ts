import type { DailyLog } from "@/types";
import { computeSkinScore } from "@/lib/insights/skin-score";

interface CorrelationResult {
  factor: string;
  correlation: number;
  description: string;
}

interface FactorMeta {
  label: string;
  evidence: "kuat" | "moderat" | "lemah" | "belum-terkonfirmasi";
  extract: (log: DailyLog) => number;
}

const FACTOR_MIN_SAMPLES = 5;
const MAX_RESULTS = 5;

const FACTORS: FactorMeta[] = [
  {
    label: "Stres",
    evidence: "kuat",
    extract: (l) => l.stress_level || 0,
  },
  {
    label: "Junk Food",
    evidence: "kuat",
    extract: (l) => (l.junk_food ? 1 : 0),
  },
  {
    label: "Tidur",
    evidence: "moderat",
    extract: (l) => l.sleep_hours || 0,
  },
  {
    label: "Hidrasi",
    evidence: "lemah",
    extract: (l) => l.water_ml || 0,
  },
  {
    label: "Olahraga",
    evidence: "lemah",
    extract: (l) => l.exercise_minutes || 0,
  },
  {
    label: "Skincare",
    evidence: "lemah",
    extract: (l) => (l.skincare_morning ? 1 : 0) + (l.skincare_evening ? 1 : 0),
  },
  {
    label: "Sentuh Wajah",
    evidence: "belum-terkonfirmasi",
    extract: (l) => (l.touched_face ? 1 : 0),
  },
];

const EVIDENCE_TEXT: Record<FactorMeta["evidence"], string> = {
  kuat: "Faktor dengan bukti paling kuat dalam literatur jerawat.",
  moderat: "Bukti campuran — kaitannya nyata namun levelnya bervariasi antar studi.",
  lemah: "Masuk akal secara klinis, tapi bukti spesifik untuk jerawat masih terbatas.",
  "belum-terkonfirmasi": "Bukti spesifik untuk jerawat masih belum terkonfirmasi — perlakukan sebagai eksperimen.",
};

export function analyzeCorrelations(logs: DailyLog[]): CorrelationResult[] {
  if (logs.length < 3) return [];

  const results: CorrelationResult[] = [];

  for (const f of FACTORS) {
    const x: number[] = [];
    const y: number[] = [];

    for (const log of logs) {
      const fx = f.extract(log);
      if (fx === undefined || Number.isNaN(fx)) continue;
      const score = computeSkinScore(log);
      if (score === 0) continue;
      x.push(fx);
      y.push(score);
    }

    if (x.length < FACTOR_MIN_SAMPLES) continue;
    if (variance(x) === 0) continue;

    const r = pearson(x, y);
    if (!Number.isFinite(r)) continue;

    results.push({
      factor: f.label,
      correlation: r,
      description: `${EVIDENCE_TEXT[f.evidence]} ${directionText(f, r)}`,
    });
  }

  results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  return results.slice(0, MAX_RESULTS);
}

function directionText(f: FactorMeta, r: number): string {
  const moderat = Math.abs(r) >= 0.5;
  if (r > 0.1 && moderat) {
    return `Data-mu menunjukkan ${f.label} bertepatan dengan skor perawatan yang lebih baik.`;
  }
  if (r < -0.1 && moderat) {
    return `Data-mu menunjukkan tingkat ${f.label} yang lebih tinggi bertepatan dengan skor lebih rendah.`;
  }
  return `Korelasinya lemah — ${f.label} belum berdampak jelas pada skormu.`;
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const xd = xs[i] - mx;
    const yd = ys[i] - my;
    num += xd * yd;
    dx += xd * xd;
    dy += yd * yd;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function variance(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  return nums.reduce((a, b) => a + (b - m) * (b - m), 0) / nums.length;
}

export { type CorrelationResult };