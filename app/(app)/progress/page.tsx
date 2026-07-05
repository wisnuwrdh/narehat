"use client";

import { useEffect, useRef, useState } from "react";

type Range = "7" | "30" | "90";

const chartData: Record<Range, { labels: string[]; scores: number[] }> = {
  "7": {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    scores: [64, 66, 63, 68, 70, 69, 72],
  },
  "30": {
    labels: ["5 Jun", "8 Jun", "11 Jun", "14 Jun", "17 Jun", "20 Jun", "23 Jun", "26 Jun", "29 Jun", "2 Jul"],
    scores: [58, 60, 59, 63, 65, 64, 66, 68, 70, 72],
  },
  "90": {
    labels: ["Apr", "Apr", "Mei", "Mei", "Mei", "Mei", "Jun", "Jun", "Jun", "Jun", "Jul", "Jul"],
    scores: [52, 55, 54, 58, 57, 60, 63, 62, 66, 68, 70, 72],
  },
};

const correlationData: Record<Range, { label: string; points: string; color: string; pct: number }[]> = {
  "7": [
    { label: "Tidur cukup", points: "+12 poin", color: "emerald", pct: 85 },
    { label: "Minum air cukup", points: "+8 poin", color: "emerald", pct: 65 },
    { label: "Stress rendah", points: "+6 poin", color: "emerald", pct: 50 },
    { label: "Begadang", points: "-10 poin", color: "red", pct: 70 },
  ],
  "30": [
    { label: "Tidur cukup", points: "+10 poin", color: "emerald", pct: 72 },
    { label: "Skincare rutin", points: "+15 poin", color: "emerald", pct: 90 },
    { label: "Olahraga", points: "+5 poin", color: "emerald", pct: 45 },
    { label: "Begadang", points: "-12 poin", color: "red", pct: 65 },
  ],
  "90": [
    { label: "Skincare rutin", points: "+18 poin", color: "emerald", pct: 92 },
    { label: "Tidur cukup", points: "+9 poin", color: "emerald", pct: 68 },
    { label: "Hidrasi", points: "+7 poin", color: "emerald", pct: 55 },
    { label: "Stress tinggi", points: "-15 poin", color: "red", pct: 60 },
  ],
};

const allPhotos = [
  { label: "Hari ini", date: "3 Jul" },
  { label: "Kemarin", date: "2 Jul" },
  { label: "1 Minggu lalu", date: "26 Jun" },
  { label: "2 Minggu lalu", date: "19 Jun" },
  { label: "3 Minggu lalu", date: "12 Jun" },
  { label: "1 Bulan lalu", date: "3 Jun" },
  { label: "6 Minggu lalu", date: "22 Mei" },
  { label: "2 Bulan lalu", date: "3 Mei" },
];

const insightList = [
  { icon: "trending_up", color: "emerald", title: "Skin score naik 8%", desc: "Konsistensi skincare 2x sehari berkontribusi besar terhadap peningkatan skin score dalam 30 hari terakhir." },
  { icon: "warning", color: "amber", title: "Tidur kurang berkorelasi", desc: "3 hari tidur <6 jam = muncul jerawat baru. Dalam 7 hari, ini terjadi 2 kali. Rekomendasi: minimal 7 jam tidur." },
  { icon: "water_drop", color: "blue", title: "Hidrasi membaik", desc: "Rata-rata minum air naik dari 1.2L ke 1.8L dalam 2 minggu. Efeknya: kulit lebih lembap dan tekstur membaik." },
];

export default function ProgressPage() {
  const [range, setRange] = useState<Range>("30");
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [leftPhoto, setLeftPhoto] = useState<string | null>(null);
  const [rightPhoto, setRightPhoto] = useState<string | null>(null);
  const [chartAnimated, setChartAnimated] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const leftRef = useRef<HTMLInputElement>(null);
  const rightRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const data = chartData[range];
  const correlations = correlationData[range];
  const photos = showAllPhotos ? allPhotos : allPhotos.slice(0, 4);

  const padding = 10;
  const chartW = 320;
  const chartH = 170;
  const plotW = chartW - padding * 2;
  const plotH = chartH - padding * 2;
  const minScore = 40;
  const maxScore = 100;
  const pts = data.scores.map((s, i) => {
    const x = padding + (i / (data.scores.length - 1)) * plotW;
    const y = padding + plotH - ((s - minScore) / (maxScore - minScore)) * plotH;
    return { x, y, s };
  });
  const polyline = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  useEffect(() => {
    setChartAnimated(true);
    setBarsAnimated(false);
    const t = setTimeout(() => setBarsAnimated(true), 100);
    return () => clearTimeout(t);
  }, [range]);

  const handlePhoto = (side: "left" | "right", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === "left") setLeftPhoto(reader.result as string);
        else setRightPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
  const scoreChange = data.scores[data.scores.length - 1] - data.scores[0];
  const changePct = Math.round((scoreChange / data.scores[0]) * 100);

  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Perkembangan</h1>
          <p className="text-sm text-muted">Lihat perubahan kulitmu dari waktu ke waktu</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border-light">
          <span className="material-symbols-outlined text-lg text-primary">calendar_month</span>
          <span className="text-sm font-semibold text-slate-700">{range} hari</span>
        </div>
      </header>

      <section className="px-6 mb-6">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-border-subtle">
          {(["7", "30", "90"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${range === r ? "text-primary bg-white shadow-sm" : "text-muted hover:bg-white hover:shadow-sm"}`}
            >
              {r} hari
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">monitoring</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Skin Score Trend</h3>
                <p className="text-[10px] text-muted">Rata-rata: {avgScore}/100</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${scoreChange >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              {scoreChange >= 0 ? "↑" : "↓"} {changePct > 0 ? "+" : ""}{changePct}%
            </span>
          </div>
          <div ref={chartRef} className="relative h-44">
            <svg className="w-full h-full" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(53,37,205,0.15)" />
                  <stop offset="100%" stopColor="rgba(53,37,205,0.01)" />
                </linearGradient>
              </defs>
              {[40, 55, 70, 85, 100].map((v) => {
                const y = padding + plotH - ((v - minScore) / (maxScore - minScore)) * plotH;
                return (
                  <g key={v}>
                    <line x1={padding} y1={y} x2={chartW - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={padding - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">{v}</text>
                  </g>
                );
              })}
              <path d={`${polyline} L ${pts[pts.length - 1].x} ${chartH - padding} L ${pts[0].x} ${chartH - padding} Z`} fill="url(#scoreGrad)" opacity={chartAnimated ? 1 : 0} style={{ transition: "opacity 0.5s ease" }} />
              <path d={polyline} fill="none" stroke="#3525cd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{
                  strokeDasharray: chartAnimated ? "none" : "1000",
                  strokeDashoffset: chartAnimated ? 0 : 1000,
                  transition: "stroke-dashoffset 1.5s ease",
                }}
              />
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#3525cd" stroke="#ffffff" strokeWidth="2"
                    opacity={chartAnimated ? 1 : 0}
                    style={{ transition: `opacity 0.3s ease ${i * 0.05 + 0.5}s` }}
                  />
                  {i % Math.max(1, Math.floor(pts.length / 5)) === 0 && (
                    <text x={p.x} y={chartH - 2} textAnchor="middle" fontSize="8" fill="#64748b">
                      {data.labels[i]}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-500 text-lg">hub</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Korelasi Kebiasaan</h3>
              <p className="text-[10px] text-muted">Pengaruh kebiasaan terhadap skin score</p>
            </div>
          </div>
          <div className="space-y-3">
            {correlations.map((c) => (
              <div key={c.label + range}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{c.label}</span>
                  <span className={`font-bold ${c.color === "red" ? "text-red-500" : "text-emerald-600"}`}>{c.points}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${c.color === "red" ? "bg-red-400" : "bg-emerald-400"}`}
                    style={{ width: barsAnimated ? `${c.pct}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Timeline Foto</h2>
          <button
            onClick={() => setShowAllPhotos(!showAllPhotos)}
            className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors"
          >
            {showAllPhotos ? "Sembunyikan" : "Lihat semua"}
          </button>
        </div>
        <div className={`grid gap-3 ${showAllPhotos ? "grid-cols-2 sm:grid-cols-3" : "flex overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory"}`}>
          {photos.map((p, i) => (
            <div
              key={p.date}
              className={`${showAllPhotos ? "" : "min-w-[140px]"} snap-start border rounded-2xl p-2.5 relative card-hover shadow-sm ${i === 0 ? "bg-gradient-to-b from-primary-light/60 to-white border-primary/10" : "bg-white border-border-subtle"}`}
            >
              <div className="mb-2 px-1 flex justify-between items-center">
                <div>
                  <span className={`text-[10px] block font-bold ${i === 0 ? "text-primary" : "text-slate-500"}`}>{p.label}</span>
                  <span className="text-[10px] text-muted-light">{p.date}</span>
                </div>
                {i === 0 && <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">Now</span>}
              </div>
              <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-500 text-lg">compare</span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Bandingkan</h3>
          </div>
          <div className="flex gap-3">
            {[
              { side: "left" as const, ref: leftRef, photo: leftPhoto, setPhoto: setLeftPhoto, label: "19 Jun", badge: "Baseline" },
              { side: "right" as const, ref: rightRef, photo: rightPhoto, setPhoto: setRightPhoto, label: "3 Jul", badge: "+8%", badgeColor: "bg-emerald-50 text-emerald-600" },
            ].map((s) => (
              <div key={s.side} className="flex-1">
                <input ref={s.ref} type="file" accept="image/*" onChange={(e) => handlePhoto(s.side, e)} className="hidden" />
                {s.photo ? (
                  <div className="relative">
                    <img src={s.photo} alt={s.label} className="w-full aspect-square object-cover rounded-2xl mb-2" />
                    <button onClick={() => s.setPhoto(null)} className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg hover:bg-white transition-colors">
                      <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => s.ref.current?.click()} className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2 hover:border-primary/30 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
                  </button>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                  <span className={`text-[10px] font-bold rounded ${s.badgeColor || "text-muted"}`}>{s.badge}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">compare</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-8">
        <h2 className="font-bold text-slate-900 text-base mb-4">Insight Minggu Ini</h2>
        <div className="space-y-3">
          {insightList.map((ins, i) => (
            <div
              key={i}
              onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
              className="bg-white border border-border-subtle rounded-2xl shadow-sm card-hover cursor-pointer overflow-hidden transition-all"
            >
              <div className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ins.color === "emerald" ? "bg-emerald-50" : ins.color === "amber" ? "bg-amber-50" : "bg-blue-50"}`}>
                  <span className={`material-symbols-outlined text-sm ${ins.color === "emerald" ? "text-emerald-500" : ins.color === "amber" ? "text-amber-500" : "text-blue-500"}`}>{ins.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{ins.title}</p>
                    <span className={`material-symbols-outlined text-muted-light text-sm transition-transform ${expandedInsight === i ? "rotate-180" : ""}`}>expand_more</span>
                  </div>
                  <p className={`text-xs text-muted mt-0.5 transition-all ${expandedInsight === i ? "max-h-32 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                    {ins.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
