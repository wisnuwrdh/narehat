"use client";

import { useEffect, useRef, useState } from "react";

type Range = "7" | "30" | "90";

function computeSkinScore(log: Record<string, number>) {
  let score = 50;
  score += Math.min((log.sleep_hours || 0) / 8, 1) * 15;
  score += Math.min((log.water_ml || 0) / 2500, 1) * 10;
  score += Math.min((log.exercise_minutes || 0) / 30, 1) * 10;
  score += (1 - ((log.stress_level || 5) - 1) / 4) * 10;
  if (log.skincare_morning) score += 7;
  if (log.skincare_evening) score += 8;
  return Math.min(100, Math.round(score));
}

function formatDateLabel(dateStr: string, range: Range): string {
  const d = new Date(dateStr);
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  if (range === "7") return days[d.getDay()];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

interface ChartData {
  labels: string[];
  scores: number[];
}

export default function ProgressPage() {
  const [range, setRange] = useState<Range>("30");
  const [chartData, setChartData] = useState<Record<Range, ChartData>>({
    "7": { labels: [], scores: [] },
    "30": { labels: [], scores: [] },
    "90": { labels: [], scores: [] },
  });
  const [loaded, setLoaded] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [allPhotos, setAllPhotos] = useState<{ url: string; date: string; label: string }[]>([]);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [leftPhoto, setLeftPhoto] = useState<string | null>(null);
  const [leftLabel, setLeftLabel] = useState("");
  const [rightPhoto, setRightPhoto] = useState<string | null>(null);
  const [rightLabel, setRightLabel] = useState("");
  const [chartAnimated, setChartAnimated] = useState(false);
  const [detectResult, setDetectResult] = useState<null | { typesDisplay: string[]; severityDisplay: string; location: string; triggers: string[]; disclaimer: string }>(null);
  const [detectLoading, setDetectLoading] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const today = new Date();
      const days = 30;
      const start = new Date(today);
      start.setDate(today.getDate() - days + 1);
      const dates: string[] = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
      }

      try {
        const res = await fetch(`/api/tracker?dates=${dates.join(",")}`);
        const j = await res.json();
        const logs = (j.logs || []) as Record<string, unknown>[];
        const logsByDate: Record<string, Record<string, number>> = {};
        for (const log of logs) {
          logsByDate[log.date as string] = log as unknown as Record<string, number>;
        }

        const labels: string[] = [];
        const scores: number[] = [];
        for (const date of dates) {
          const log = logsByDate[date];
          if (log) {
            labels.push(formatDateLabel(date, "30"));
            scores.push(computeSkinScore(log));
          }
        }

        setChartData((prev) => ({ ...prev, "30": { labels, scores } }));
      } catch {}

      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded || chartData[range].labels.length > 0) return;
    async function load() {
      const today = new Date();
      const days = range === "7" ? 7 : range === "30" ? 30 : 90;
      const start = new Date(today);
      start.setDate(today.getDate() - days + 1);
      const dates: string[] = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
      }

      try {
        const res = await fetch(`/api/tracker?dates=${dates.join(",")}`);
        const j = await res.json();
        const logs = (j.logs || []) as Record<string, unknown>[];
        const logsByDate: Record<string, Record<string, number>> = {};
        for (const log of logs) {
          logsByDate[log.date as string] = log as unknown as Record<string, number>;
        }

        const labels: string[] = [];
        const scores: number[] = [];
        for (const date of dates) {
          const log = logsByDate[date];
          if (log) {
            labels.push(formatDateLabel(date, range));
            scores.push(computeSkinScore(log));
          }
        }

        setChartData((prev) => ({ ...prev, [range]: { labels, scores } }));
      } catch {}
    }
    load();
  }, [range, loaded]);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        if (data.photos) {
          setAllPhotos(
            data.photos.map((p: { url: string; date: string }, i: number) => ({
              url: p.url,
              date: p.date,
              label: i === 0 ? "Terbaru" : `Foto ${i + 1}`,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const data = chartData[range];
  const photos = showAllPhotos ? allPhotos : allPhotos.slice(0, 4);
  const correlations: { label: string; points: string; color: string; pct: number }[] = [];

  const padding = 10;
  const chartW = 320;
  const chartH = 170;
  const plotW = chartW - padding * 2;
  const plotH = chartH - padding * 2;
  const minScore = 40;
  const maxScore = 100;
  const pts = data.scores.map((s, i) => {
    const denominator = Math.max(data.scores.length - 1, 1);
    const x = padding + (i / denominator) * plotW;
    const y = padding + plotH - ((s - minScore) / (maxScore - minScore)) * plotH;
    return { x, y, s };
  });
  const polyline = pts.length > 0 ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") : "";

  useEffect(() => {
    setChartAnimated(true);
    setBarsAnimated(false);
    const t = setTimeout(() => setBarsAnimated(true), 100);
    return () => clearTimeout(t);
  }, [range]);

  const selectPhoto = (side: "left" | "right") => {
    if (allPhotos.length === 0) return;
    const list = allPhotos
      .map((p, i) => `${i}: ${p.date} (${p.label})`)
      .join("\n");
    const idxStr = prompt(`Pilih foto (0-${allPhotos.length - 1}):\n\n${list}`, "1");
    if (idxStr === null) return;
    const idx = parseInt(idxStr, 10);
    if (isNaN(idx) || idx < 0 || idx >= allPhotos.length) return;
    const selected = allPhotos[idx];
    if (side === "left") {
      setLeftPhoto(selected.url);
      setLeftLabel(selected.date);
    } else {
      setRightPhoto(selected.url);
      setRightLabel(selected.date);
    }
  };

  const avgScore = data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0;
  const scoreChange = data.scores.length > 1 ? data.scores[data.scores.length - 1] - data.scores[0] : 0;
  const changePct = data.scores.length > 1 && data.scores[0] > 0 ? Math.round((scoreChange / data.scores[0]) * 100) : 0;

  const handleGenerateReport = async () => {
    const res = await fetch("/api/report");
    const report = await res.json();
    if (!report || report.error) return;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Mingguan Narehat</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; line-height:1.6; padding:2rem; max-width:600px; margin:0 auto; }
  .header { text-align:center; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:2px solid #e2e8f0; }
  .header h1 { font-size:1.5rem; color:#3525cd; }
  .header p { color:#64748b; font-size:0.875rem; margin-top:0.25rem; }
  .card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:1rem; padding:1rem; margin-bottom:1rem; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem; }
  .stat { text-align:center; padding:0.75rem; background:#fff; border-radius:0.75rem; border:1px solid #e2e8f0; }
  .stat .value { font-size:1.5rem; font-weight:800; color:#3525cd; }
  .stat .label { font-size:0.75rem; color:#64748b; }
  .insight { padding:0.75rem; background:#fff; border-radius:0.75rem; border:1px solid #e2e8f0; margin-bottom:0.5rem; }
  .insight .title { font-weight:600; font-size:0.875rem; }
  .insight .desc { font-size:0.8rem; color:#64748b; margin-top:0.25rem; }
  .section-title { font-weight:700; font-size:1rem; margin:1.25rem 0 0.75rem; color:#3525cd; }
  .photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
  .photo { border-radius:0.75rem; overflow:hidden; border:1px solid #e2e8f0; }
  .photo img { width:100%; height:120px; object-fit:cover; display:block; }
  .photo .date { font-size:0.7rem; color:#64748b; padding:0.25rem 0.5rem; text-align:center; }
  .footer { margin-top:2rem; padding-top:1rem; border-top:1px solid #e2e8f0; font-size:0.7rem; color:#94a3b8; text-align:center; }
  .ai-result { background:#f0f9ff; border:1px solid #bae6fd; border-radius:0.75rem; padding:0.75rem; margin-bottom:0.5rem; font-size:0.8rem; }
  .badge { display:inline-block; padding:0.25rem 0.5rem; border-radius:0.5rem; font-size:0.7rem; font-weight:600; }
  .badge-green { background:#dcfce7; color:#166534; }
  .badge-amber { background:#fef3c7; color:#92400e; }
  .badge-red { background:#fee2e2; color:#991b1b; }
  @media print { body { padding:0; } }
</style>
</head>
<body>
<div class="header">
  <h1>Laporan Mingguan Narehat</h1>
  <p>${report.userName} &bull; ${report.skinType} &bull; ${report.rangeLabel}</p>
</div>

<div class="card">
  <div class="section-title" style="margin-top:0">Skin Score Mingguan</div>
  <div style="text-align:center;margin:0.5rem 0;">
    <span style="font-size:3rem;font-weight:800;color:#3525cd;">${report.avgScore}</span>
    <span style="font-size:1rem;color:#64748b;">/100</span>
  </div>
  <div class="grid">
    <div class="stat"><div class="value">${report.avgSleep}j</div><div class="label">Rata-rata Tidur</div></div>
    <div class="stat"><div class="value">${(report.avgWater / 1000).toFixed(1)}L</div><div class="label">Rata-rata Air</div></div>
    <div class="stat"><div class="value">${report.avgStress}</div><div class="label">Stress Level</div></div>
    <div class="stat"><div class="value">${report.skincareConsistency}%</div><div class="label">Konsistensi</div></div>
  </div>
  <p style="font-size:0.75rem;color:#94a3b8;">${report.loggingDays}/7 hari terisi tracker</p>
</div>

${report.photos.length > 0 ? `
<div class="section-title">Perbandingan Foto</div>
<div class="photo-grid">
  ${report.photos.map((p: { url: string; date: string }, i: number) => `
  <div class="photo">
    <img src="${p.url}" alt="Foto ${i + 1}" />
    <div class="date">${p.date}</div>
  </div>
  `).join("")}
</div>
` : ""}

${report.aiResults.length > 0 ? `
<div class="section-title">Hasil Analisis AI</div>
${report.aiResults.map((r: { analysis: Record<string, unknown>; date: string }) => `
<div class="ai-result">
  <p><strong>${r.date}</strong></p>
  <p>${(r.analysis as { description?: string }).description || "Analisis AI"}</p>
  ${(r.analysis as { type?: string }).type ? `<span class="badge badge-green">${(r.analysis as { type: string }).type}</span>` : ""}
</div>
`).join("")}
` : ""}

${report.insights.length > 0 ? `
<div class="section-title">Insight</div>
${report.insights.map((i: { title: string; description: string; type: string }) => `
<div class="insight">
  <div class="title">${i.type === "warning" ? "⚠️" : i.type === "positive" ? "✅" : "📊"} ${i.title}</div>
  <div class="desc">${i.description}</div>
</div>
`).join("")}
` : ""}

<div class="footer">
  <p>Dibuat oleh Narehat &bull; ${new Date(report.generatedAt).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</p>
  <p>Laporan ini bersifat informatif. Bukan pengganti diagnosis medis profesional.</p>
</div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

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
            {pts.length > 0 ? (
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
            ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-muted">Isi tracker secara rutin untuk melihat grafik skin score.</p>
            </div>
            )}
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
            {correlations.length > 0 ? correlations.map((c) => (
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
            )) : (
              <p className="text-xs text-muted text-center py-2">Korelasi akan muncul setelah kamu rutin tracking selama {range} hari.</p>
            )}
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
          {photos.length > 0 ? photos.map((p, i) => (
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
              <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={async () => {
                  setDetectLoading(true);
                  setDetectResult(null);
                  try {
                    const res = await fetch("/api/ai/detect", {
                      method: "POST",
                      body: (() => {
                        const fd = new FormData();
                        fd.append("image", p.url);
                        return fd;
                      })(),
                    });
                    const data = await res.json();
                    if (data.error) {
                      setDetectResult({ typesDisplay: [], severityDisplay: "", location: "", triggers: [], disclaimer: data.error });
                    } else {
                      setDetectResult(data);
                    }
                  } catch { setDetectResult({ typesDisplay: [], severityDisplay: "", location: "", triggers: [], disclaimer: "Gagal terhubung ke server." }); }
                  setDetectLoading(false);
                }}
                disabled={detectLoading}
                className="btn-press mt-2 w-full py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                {detectLoading ? "Menganalisis..." : "Deteksi AI"}
              </button>
            </div>
          )) : (
            <div className="w-full py-8 text-center">
              <p className="text-xs text-muted">Belum ada foto. Upload dari tracker untuk melihat timeline.</p>
            </div>
          )}
        </div>
      </section>

      {detectResult && (
        <section className="px-6 mb-6">
          <div className="bg-white border border-primary/20 rounded-3xl p-5 shadow-sm animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="font-bold text-slate-800 text-sm">Hasil Deteksi AI</h3>
              <button onClick={() => setDetectResult(null)} className="btn-press ml-auto p-1 text-muted hover:text-slate-600 rounded-lg">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {detectResult.typesDisplay && detectResult.typesDisplay.length > 0 ? (
              <>
                <div className="space-y-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-muted-light font-semibold">Jenis:</span>
                    {detectResult.typesDisplay.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-bold rounded-md">{t}</span>
                    ))}
                  </div>
                  {detectResult.severityDisplay && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-light font-semibold">Kondisi:</span>
                      <span className="text-xs font-bold text-slate-700">{detectResult.severityDisplay}</span>
                    </div>
                  )}
                  {detectResult.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-light font-semibold">Lokasi:</span>
                      <span className="text-xs text-slate-700">{detectResult.location}</span>
                    </div>
                  )}
                  {detectResult.triggers && detectResult.triggers.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-muted-light font-semibold">Estimasi:</span>
                      {detectResult.triggers.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-light italic">{detectResult.disclaimer}</p>
              </>
            ) : (
              <p className="text-xs text-muted">{detectResult.disclaimer}</p>
            )}
          </div>
        </section>
      )}

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
              { side: "left" as const, photo: leftPhoto, setPhoto: setLeftPhoto, label: leftLabel || "Sebelum", badge: "Baseline", onClick: () => selectPhoto("left") },
              { side: "right" as const, photo: rightPhoto, setPhoto: setRightPhoto, label: rightLabel || "Sekarang", badge: "Terbaru", badgeColor: "bg-emerald-50 text-emerald-600", onClick: () => selectPhoto("right") },
            ].map((s) => (
              <div key={s.side} className="flex-1">
                {s.photo ? (
                  <div className="relative">
                    <img src={s.photo} alt={s.label} className="w-full aspect-square object-cover rounded-2xl mb-2" />
                    <button onClick={() => s.setPhoto(null)} className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg hover:bg-white transition-colors">
                      <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={s.onClick} className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2 hover:border-primary/30 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-slate-300">{allPhotos.length > 0 ? "photo_library" : "add_a_photo"}</span>
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
          {data.scores.length > 0 ? (
            <>
              {avgScore >= 70 && (
                <div onClick={() => setExpandedInsight(expandedInsight === 0 ? null : 0)} className="bg-white border border-border-subtle rounded-2xl shadow-sm card-hover cursor-pointer overflow-hidden transition-all">
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50">
                      <span className="material-symbols-outlined text-sm text-emerald-500">trending_up</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">Skin score rata-rata {avgScore}/100</p>
                        <span className={`material-symbols-outlined text-muted-light text-sm transition-transform ${expandedInsight === 0 ? "rotate-180" : ""}`}>expand_more</span>
                      </div>
                      <p className={`text-xs text-muted mt-0.5 transition-all ${expandedInsight === 0 ? "max-h-32 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                        Dalam {range} hari terakhir, skin score rata-ratamu adalah {avgScore}/100. {scoreChange > 0 ? `Ada peningkatan ${changePct}% dari data awal. Pertahankan konsistensimu!` : "Coba lebih konsisten dengan rutinitas skincare dan tracker harian."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-4 text-center">
              <p className="text-xs text-muted">Isi tracker secara rutin untuk melihat insight personal. Semakin sering tracking, semakin akurat insight yang muncul.</p>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 mb-8">
        <button
          onClick={handleGenerateReport}
          className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">description</span>
          Export Laporan Mingguan
        </button>
        <p className="text-center text-[10px] text-muted mt-2">Laporan akan terbuka di tab baru untuk di-print atau disimpan sebagai PDF</p>
      </section>
    </main>
  );
}
