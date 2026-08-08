"use client";

import { useEffect, useRef, useState } from "react";
import type { DailyLog } from "@/types";
import { computeSkinScore, breakdownScore, type ScoreBreakdownItem } from "@/lib/insights/skin-score";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { thumbUrlFor } from "@/lib/storage/thumb-url";

type Range = "7" | "30" | "90";
type FilterType = "all" | "detect" | "purging";
type SortType = "newest" | "severity";

interface AiAnalysis {
  types?: string[];
  severity?: string;
  confidence?: number;
  location?: string;
  triggers?: string[];
  analyzed_at?: string;
  type?: string;
  description?: string;
  recommendations?: string[];
  product_name?: string;
}

interface PhotoWithAnalysis {
  id: string;
  url: string;
  date: string;
  label: string;
  ai_analysis: AiAnalysis | null;
  analysis_type: string | null;
  notes?: string;
}

interface DiffItem {
  type: "improved" | "worsened" | "info";
  text: string;
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

function getBadge(photo: PhotoWithAnalysis): { label: string; color: string } | null {
  const a = photo.ai_analysis;
  if (!a) return null;

  if (photo.analysis_type === "purging") {
    const map: Record<string, { label: string; color: string }> = {
      purging: { label: "Purging", color: "bg-emerald-50 text-emerald-700" },
      breakout: { label: "Breakout", color: "bg-red-50 text-red-700" },
      normal: { label: "Normal", color: "bg-sky-50 text-sky-700" },
    };
    return map[a.type ?? ""] ?? null;
  }

  if (photo.analysis_type === "detect") {
    if (a.types && a.types.length === 0 && a.severity === "informative") {
      return { label: "Bersih", color: "bg-sky-50 text-sky-700" };
    }
    const map: Record<string, { label: string; color: string }> = {
      mild: { label: "Ringan", color: "bg-emerald-50 text-emerald-700" },
      moderate: { label: "Sedang", color: "bg-amber-50 text-amber-700" },
    };
    return map[a.severity ?? ""] ?? { label: a.severity ?? "Analisis", color: "bg-slate-50 text-slate-600" };
  }

  return null;
}

function getSeverityLabel(severity?: string): string {
  const map: Record<string, string> = {
    informative: "Observasi",
    mild: "Ringan",
    moderate: "Sedang",
  };
  return map[severity ?? ""] ?? severity ?? "-";
}

function getTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    papules: "Papula",
    pustules: "Pustula",
    nodules: "Nodul",
    cystic: "Kistik",
    comedonal: "Komedo",
    blackheads: "Komedo Hitam",
    whiteheads: "Komedo Putih",
  };
  return map[type ?? ""] ?? type ?? "-";
}

function computeDiff(prev: PhotoWithAnalysis, curr: PhotoWithAnalysis): DiffItem[] {
  const p = prev.ai_analysis;
  const c = curr.ai_analysis;
  if (!p || !c) return [];

  const [earlier, later] = prev.date <= curr.date ? [p, c] : [c, p];

  const diffs: DiffItem[] = [];

  if (earlier.types !== undefined && later.types !== undefined) {
    const gained = later.types.filter((t) => !earlier.types!.includes(t));
    const lost = earlier.types.filter((t) => !later.types!.includes(t));
    if (gained.length > 0) {
      diffs.push({
        type: gained.length > lost.length ? "worsened" : "info",
        text: `Jerawat baru: ${gained.map(getTypeLabel).join(", ")}`,
      });
    }
    if (lost.length > 0) {
      diffs.push({
        type: lost.length >= gained.length ? "improved" : "info",
        text: `Jerawat hilang: ${lost.map(getTypeLabel).join(", ")}`,
      });
    }
  }

  if (earlier.severity && later.severity && earlier.severity !== later.severity) {
    const rank: Record<string, number> = { informative: 0, mild: 1, moderate: 2 };
    const prevR = rank[earlier.severity] ?? 0;
    const curR = rank[later.severity] ?? 0;
    if (curR < prevR) {
      diffs.push({ type: "improved", text: `Severity turun: ${getSeverityLabel(earlier.severity)} → ${getSeverityLabel(later.severity)}` });
    } else {
      diffs.push({ type: "worsened", text: `Severity naik: ${getSeverityLabel(earlier.severity)} → ${getSeverityLabel(later.severity)}` });
    }
  }

  if (earlier.type && later.type && earlier.type !== later.type) {
    const improved = later.type === "normal" || (later.type === "purging" && earlier.type === "breakout");
    diffs.push({
      type: improved ? "improved" : "worsened",
      text: `Reaksi: ${earlier.type} → ${later.type}`,
    });
  }

  return diffs;
}

function AnalysisDetailModal({ photo, onClose }: { photo: PhotoWithAnalysis; onClose: () => void }) {
  const a = photo.ai_analysis;
  if (!a) return null;

  const isPurging = photo.analysis_type === "purging";
  const badge = getBadge(photo);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pb-24" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl w-full max-w-md p-5 animate-fade-in-up max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Detail Analisis</h3>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-slate-700 rounded-lg hover:bg-slate-50">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4">
          <img src={photo.url} alt="Scan" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
        <p className="text-xs text-muted mb-3">{photo.date}{badge ? ` · ` : ""}{badge && <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>{badge.label}</span>}</p>

        {isPurging ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Reaksi</span>
                <span className="text-xs font-bold text-slate-800">{a.type ?? "-"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Confidence</span>
                <span className="text-xs font-bold text-slate-800">{a.confidence ? `${Math.round(a.confidence * 100)}%` : "-"}</span>
              </div>
            </div>
            {a.product_name && (
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Produk</span>
                <span className="text-xs font-bold text-slate-800">{a.product_name}</span>
              </div>
            )}
            {a.description && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Deskripsi</span>
                <p className="text-xs text-slate-700">{a.description}</p>
              </div>
            )}
            {a.recommendations && a.recommendations.length > 0 && (
              <div className="p-3 bg-sky-50 rounded-xl">
                <span className="text-[10px] font-bold text-sky-700 block mb-2">Rekomendasi</span>
                {a.recommendations.map((r, i) => (
                  <p key={i} className="text-xs text-slate-700 flex items-start gap-1 mb-1">
                    <span className="text-sky-500 font-bold shrink-0">{i + 1}.</span> {r}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Jenis</span>
                <span className="text-xs font-bold text-slate-800">{a.types?.map(getTypeLabel).join(", ") || (photo.ai_analysis?.types?.length === 0 ? "Kulit bersih" : "-")}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Severity</span>
                <span className="text-xs font-bold text-slate-800">{getSeverityLabel(a.severity)}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Lokasi</span>
                <span className="text-xs font-bold text-slate-800">{a.location || "-"}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Confidence</span>
                <span className="text-xs font-bold text-slate-800">{a.confidence ? `${Math.round(a.confidence * 100)}%` : "-"}</span>
              </div>
            </div>
            {a.triggers && a.triggers.length > 0 && (
              <div className="p-3 bg-rose-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Pemicu</span>
                <span className="text-xs font-bold text-slate-800">{a.triggers.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { activePlan } = useUser();
  const isPro = activePlan === "pro";
  const [range, setRange] = useState<Range>("30");
  const [chartData, setChartData] = useState<Record<Range, ChartData>>({
    "7": { labels: [], scores: [] },
    "30": { labels: [], scores: [] },
    "90": { labels: [], scores: [] },
  });
  const [loaded, setLoaded] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [allPhotos, setAllPhotos] = useState<PhotoWithAnalysis[]>([]);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [leftPhoto, setLeftPhoto] = useState<string | null>(null);
  const [leftLabel, setLeftLabel] = useState("");
  const [leftData, setLeftData] = useState<PhotoWithAnalysis | null>(null);
  const [rightPhoto, setRightPhoto] = useState<string | null>(null);
  const [rightLabel, setRightLabel] = useState("");
  const [rightData, setRightData] = useState<PhotoWithAnalysis | null>(null);
  const [chartAnimated, setChartAnimated] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [breakdown, setBreakdown] = useState<ScoreBreakdownItem[]>([]);
  const [insightItems, setInsightItems] = useState<{ title: string; description: string; type: string }[]>([]);
  const [pickerSide, setPickerSide] = useState<"left" | "right" | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [analysisDetail, setAnalysisDetail] = useState<PhotoWithAnalysis | null>(null);
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
        const logs = (j.logs || []) as DailyLog[];
        const logsByDate: Record<string, DailyLog> = {};
        for (const log of logs) {
          logsByDate[log.date as string] = log;
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
        const latest = [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
        setBreakdown(breakdownScore(latest));
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
        const logs = (j.logs || []) as DailyLog[];
        const logsByDate: Record<string, DailyLog> = {};
        for (const log of logs) {
          logsByDate[log.date as string] = log;
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
        const latest = [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
        setBreakdown(breakdownScore(latest));
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
            data.photos.map((p: { id: string; url: string; date: string; ai_analysis: AiAnalysis | null; analysis_type: string | null; notes?: string }, i: number) => ({
              id: p.id,
              url: p.url,
              date: p.date,
              label: i === 0 ? "Terbaru" : `Foto ${i + 1}`,
              ai_analysis: p.ai_analysis,
              analysis_type: p.analysis_type,
              notes: p.notes,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/report")
      .then((r) => r.json())
      .then((report) => {
        if (report.insights?.length) {
          setInsightItems(report.insights);
        }
      })
      .catch(() => {});
  }, []);

  const filteredPhotos = allPhotos
    .filter((p) => filterType === "all" || p.analysis_type === filterType)
    .sort((a, b) => {
      if (sortBy === "severity") {
        const rank: Record<string, number> = { moderate: 3, mild: 2, informative: 1 };
        const aRank = a.ai_analysis?.severity ? rank[a.ai_analysis.severity] ?? 0 : 0;
        const bRank = b.ai_analysis?.severity ? rank[b.ai_analysis.severity] ?? 0 : 0;
        if (aRank !== bRank) return bRank - aRank;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const data = chartData[range];
  const photos = showAllPhotos ? filteredPhotos : filteredPhotos.slice(0, 4);

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

  const pickPhoto = (idx: number) => {
    if (!pickerSide || idx < 0 || idx >= allPhotos.length) return;
    const selected = allPhotos[idx];
    if (pickerSide === "left") {
      setLeftPhoto(selected.url);
      setLeftLabel(selected.date);
      setLeftData(selected);
    } else {
      setRightPhoto(selected.url);
      setRightLabel(selected.date);
      setRightData(selected);
    }
    setPickerSide(null);
  };

  const avgScore = data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0;
  const scoreChange = data.scores.length > 1 ? data.scores[data.scores.length - 1] - data.scores[0] : 0;
  const changePct = data.scores.length > 1 && data.scores[0] > 0 ? Math.round((scoreChange / data.scores[0]) * 100) : 0;

  const handleGenerateReport = async () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write("<html><body style='display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;color:#94a3b8'><p>Menyiapkan laporan...</p></body></html>");
    w.document.close();

    const res = await fetch(`/api/report?range=${range}&export=1`);
    const report = await res.json();
    if (!report || report.error) {
      w.document.write("<html><body style='display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif'><p style='color:#ef4444'>Gagal membuat laporan.</p></body></html>");
      w.document.close();
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Narehat</title>
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
  <h1>Laporan Narehat</h1>
  <p>${report.userName} &bull; ${report.skinType} &bull; ${report.rangeLabel}</p>
</div>

<div class="card">
  <div class="section-title" style="margin-top:0">Skin Score</div>
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
  <p style="font-size:0.75rem;color:#94a3b8;">${report.loggingDays}/${range} hari terisi tracker</p>
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

    w.document.write(html);
    w.document.close();
  };

  // Compare section helpers
  const leftBadge = leftData ? getBadge(leftData) : null;
  const rightBadge = rightData ? getBadge(rightData) : null;
  const diffItems = leftData && rightData && leftData.ai_analysis && rightData.ai_analysis ? computeDiff(leftData, rightData) : [];

  const compareAnalysis = (side: "left" | "right") => {
    const photo = side === "left" ? leftData : rightData;
    if (photo?.ai_analysis) setAnalysisDetail(photo);
  };

  return (
    <main className="max-w-md md:max-w-4xl mx-auto">
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
              <path d={`${polyline} Z`} fill="url(#scoreGrad)" opacity={chartAnimated ? 1 : 0} style={{ transition: "opacity 0.5s ease" }} />
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
              <span className="material-symbols-outlined text-indigo-500 text-lg">task_alt</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Kontribusi Skor Hari Ini</h3>
              <p className="text-[10px] text-muted">Berapa poin dari setiap kebiasaan hari ini</p>
            </div>
          </div>
          {breakdown.length > 0 ? (
            <>
              <div className="space-y-3">
                {breakdown.map((b) => {
                  const pct = Math.min(100, Math.round((b.current / b.max) * 100));
                  const good = pct >= 70;
                  return (
                    <div key={b.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{b.label}</span>
                        <span className={`font-bold ${good ? "text-emerald-600" : "text-amber-600"}`}>
                          {b.current}/{b.max}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${good ? "bg-emerald-400" : "bg-amber-400"}`}
                          style={{ width: barsAnimated ? `${pct}%` : "0%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const diffs = breakdown.map((b) => ({ b, loss: b.max - b.current }));
                const top = diffs.sort((a, c) => c.loss - a.loss)[0];
                if (top.loss > 0) {
                  return (
                    <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">
                      Peluang terbesar: <b>{top.b.label}</b> (kurang {top.loss} poin). {top.b.evidenceText}
                    </p>
                  );
                }
                return (
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-emerald-50 rounded-xl p-3">
                    Semua kebiasaan hari ini sudah maksimal. Pertahankan!
                  </p>
                );
              })()}
              <p className="mt-3 text-[10px] text-muted-light">Skor adalah rangkuman kebiasaanmu, bukan diagnosis medis.</p>
            </>
          ) : (
            <p className="text-xs text-muted text-center py-2">Isi tracker hari ini untuk melihat kontribusi skor.</p>
          )}
        </div>
      </section>

      {/* Timeline Foto with Analysis */}
      <section className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 text-base">Timeline Foto</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors"
            >
              {showAllPhotos ? "Sembunyikan" : "Lihat semua"}
            </button>
          </div>
        </div>

        {/* Filter & Sort */}
        <div className="flex gap-2 mb-4">
          <div className="flex bg-slate-50 p-0.5 rounded-lg border border-border-light">
            {(["all", "detect", "purging"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                  filterType === f ? "bg-white text-primary shadow-sm" : "text-muted hover:text-slate-700"
                }`}
              >
                {f === "all" ? "Semua" : f === "detect" ? "Deteksi" : "Purging"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortBy(sortBy === "newest" ? "severity" : "newest")}
            className="btn-press px-2.5 py-1 bg-slate-50 border border-border-light rounded-lg text-[10px] font-bold text-muted hover:text-slate-700 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[12px]">{sortBy === "newest" ? "schedule" : "sort"}</span>
            {sortBy === "newest" ? "Terbaru" : "Severity"}
          </button>
        </div>

        {/* Photo Grid */}
        <div className={`grid gap-3 ${showAllPhotos ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible no-scrollbar pb-2 snap-x snap-mandatory"}`}>
          {photos.length > 0 ? photos.map((p, i) => {
            const badge = getBadge(p);
            return (
              <div
                key={p.id || p.date}
                className={`${showAllPhotos ? "" : "min-w-[140px] md:min-w-0"} snap-start border rounded-2xl p-2.5 relative card-hover shadow-sm cursor-pointer ${
                  i === 0 && filterType === "all"
                    ? "bg-gradient-to-b from-primary-light/60 to-white border-primary/10"
                    : "bg-white border-border-subtle"
                }`}
                onClick={() => {
                  if (p.ai_analysis) setAnalysisDetail(p);
                }}
              >
                <div className="mb-2 px-1 flex justify-between items-center">
                  <div>
                    <span className={`text-[10px] block font-bold ${i === 0 && filterType === "all" ? "text-primary" : "text-slate-500"}`}>{p.label}</span>
                    <span className="text-[10px] text-muted-light">{p.date}</span>
                  </div>
                  {i === 0 && filterType === "all" && <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">Now</span>}
                </div>
                <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden relative">
                  <img src={thumbUrlFor(p.url)} alt={p.label} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  {badge && (
                    <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-bold rounded-md ${badge.color} shadow-sm`}>
                      {badge.label}
                    </span>
                  )}
                  {p.ai_analysis?.confidence && (
                    <span className="absolute bottom-1.5 left-1.5 px-1 py-0.5 bg-black/50 text-white text-[8px] font-bold rounded-md backdrop-blur-sm">
                      {Math.round(p.ai_analysis.confidence * 100)}%
                    </span>
                  )}
                </div>
                {p.ai_analysis && (
                  <div className="mt-1.5 px-1">
                    <p className="text-[9px] text-muted truncate">
                      {p.analysis_type === "purging"
                        ? p.ai_analysis.type
                        : p.ai_analysis.types && p.ai_analysis.types.length > 0
                          ? p.ai_analysis.types.map(getTypeLabel).join(", ")
                          : "Bersih"}
                    </p>
                  </div>
                )}
                <Link
                  href={`/scan?photo=${p.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-press mt-2 w-full py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Buka di Scan
                </Link>
              </div>
            );
          }) : (
            <div className="w-full py-8 text-center">
              <p className="text-xs text-muted">Belum ada foto. Upload dari tracker untuk melihat timeline.</p>
            </div>
          )}
        </div>
      </section>

      {/* Analysis Detail Modal */}
      {analysisDetail && (
        <AnalysisDetailModal photo={analysisDetail} onClose={() => setAnalysisDetail(null)} />
      )}

      {/* Compare Section with Analysis */}
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
              { side: "left" as const, photo: leftPhoto, setPhoto: setLeftPhoto, setData: setLeftData, label: leftLabel, badge: "Sebelum", badgeColor: "text-muted", onClick: () => setPickerSide("left") },
              { side: "right" as const, photo: rightPhoto, setPhoto: setRightPhoto, setData: setRightData, label: rightLabel, badge: "Sekarang", badgeColor: "bg-emerald-50 text-emerald-600", onClick: () => setPickerSide("right") },
            ].map((s) => (
              <div key={s.side} className="flex-1">
                {s.photo ? (
                  <div className="relative">
                    <img src={thumbUrlFor(s.photo)} alt={s.label} loading="lazy" decoding="async" className="w-full aspect-square object-cover rounded-2xl mb-2" />
                    <button onClick={() => { s.setPhoto(null); s.setData(null); }} className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg hover:bg-white transition-colors">
                      <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                    </button>
                    {s.side === "left" ? leftBadge && (
                      <span className={`absolute bottom-3 left-2 px-2 py-0.5 text-[10px] font-bold rounded-md ${leftBadge.color} shadow-sm`}>{leftBadge.label}</span>
                    ) : rightBadge && (
                      <span className={`absolute bottom-3 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md ${rightBadge.color} shadow-sm`}>{rightBadge.label}</span>
                    )}
                    <button onClick={() => compareAnalysis(s.side)} className="absolute top-2 left-2 p-1 bg-white/80 rounded-lg hover:bg-white transition-colors">
                      <span className="material-symbols-outlined text-primary text-sm">info</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={s.onClick} className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2 hover:border-primary/30 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-slate-300">{allPhotos.length > 0 ? "photo_library" : "add_a_photo"}</span>
                  </button>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                  <span className={`text-[10px] font-bold rounded ${s.badgeColor}`}>{s.badge}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">compare</span>
              </div>
            </div>
          </div>

          {/* Analysis Comparison */}
          {leftData?.ai_analysis && rightData?.ai_analysis && (
            <div className="mt-4 space-y-3">
              {/* Diff Summary */}
              {diffItems.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-border-light">
                  <span className="text-[10px] font-bold text-slate-700 block mb-2">Perubahan</span>
                  {diffItems.map((d, i) => (
                    <p key={i} className={`text-xs flex items-start gap-1.5 mb-1 last:mb-0 ${
                      d.type === "improved" ? "text-emerald-700" : d.type === "worsened" ? "text-red-600" : "text-slate-600"
                    }`}>
                      <span className="material-symbols-outlined text-[14px] shrink-0 mt-px">
                        {d.type === "improved" ? "arrow_downward" : d.type === "worsened" ? "arrow_upward" : "remove"}
                      </span>
                      {d.text}
                    </p>
                  ))}
                </div>
              )}

              {/* Side by Side Analysis */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Jenis", left: leftData.ai_analysis.types?.map(getTypeLabel).join(", ") || "-", right: rightData.ai_analysis.types?.map(getTypeLabel).join(", ") || "-" },
                  { label: "Severity", left: getSeverityLabel(leftData.ai_analysis.severity), right: getSeverityLabel(rightData.ai_analysis.severity) },
                  { label: "Lokasi", left: leftData.ai_analysis.location || "-", right: rightData.ai_analysis.location || "-" },
                  { label: "Confidence", left: leftData.ai_analysis.confidence ? `${Math.round(leftData.ai_analysis.confidence * 100)}%` : "-", right: rightData.ai_analysis.confidence ? `${Math.round(rightData.ai_analysis.confidence * 100)}%` : "-" },
                ].map((row) => (
                  <div key={row.label} className="col-span-2 grid grid-cols-[1fr_auto_1fr] gap-2 items-center p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 text-center">{row.left}</span>
                    <span className="text-[9px] text-muted font-semibold">{row.label}</span>
                    <span className="text-[10px] font-bold text-slate-500 text-center">{row.right}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compare empty state */}
          {(!leftData || !rightData) && (
            <p className="text-[11px] text-muted text-center mt-3">Pilih dua foto untuk membandingkan perubahan kulit.</p>
          )}
        </div>
      </section>

      {pickerSide && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center pb-24" onClick={() => setPickerSide(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-5 animate-fade-in-up max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Pilih Foto</h3>
              <button onClick={() => setPickerSide(null)} className="p-1.5 text-muted hover:text-slate-700 rounded-lg hover:bg-slate-50">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allPhotos.map((p, i) => {
                const badge = getBadge(p);
                return (
                  <button
                    key={i}
                    onClick={() => pickPhoto(i)}
                    className="text-left rounded-xl overflow-hidden border border-border-light hover:border-primary/50 transition-all bg-white"
                  >
                    <div className="aspect-square bg-slate-50 relative">
                      <img src={thumbUrlFor(p.url)} alt={p.date} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      {badge && (
                        <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-bold rounded-md ${badge.color} shadow-sm`}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <span className="text-[11px] font-semibold text-slate-700 block">{p.label}</span>
                      <span className="text-[10px] text-muted">{p.date}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <section className="px-6 mb-8">
        <h2 className="font-bold text-slate-900 text-base mb-4">Insight Minggu Ini</h2>
        <div className="space-y-3">
          {data.scores.length > 0 || insightItems.length > 0 ? (
            <>
              {data.scores.length > 0 && (
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
              {insightItems.map((insight, i) => {
                const idx = i + 1;
                const icon = insight.type === "recommendation" ? "lightbulb" : insight.type === "trend" ? "trending_up" : "hub";
                const bg = insight.type === "recommendation" ? "bg-violet-50" : insight.type === "trend" ? "bg-emerald-50" : "bg-blue-50";
                const fg = insight.type === "recommendation" ? "text-violet-500" : insight.type === "trend" ? "text-emerald-500" : "text-blue-500";
                return (
                  <div key={i} onClick={() => setExpandedInsight(expandedInsight === idx ? null : idx)} className="bg-white border border-border-subtle rounded-2xl shadow-sm card-hover cursor-pointer overflow-hidden transition-all">
                    <div className="p-4 flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                        <span className={`material-symbols-outlined text-sm ${fg}`}>{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">{insight.title}</p>
                          <span className={`material-symbols-outlined text-muted-light text-sm transition-transform ${expandedInsight === idx ? "rotate-180" : ""}`}>expand_more</span>
                        </div>
                        <p className={`text-xs text-muted mt-0.5 transition-all ${expandedInsight === idx ? "max-h-32 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-4 text-center">
              <p className="text-xs text-muted">Isi tracker secara rutin untuk melihat insight personal. Semakin sering tracking, semakin akurat insight yang muncul.</p>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 mb-8">
        {isPro ? (
          <>
            <button
              onClick={handleGenerateReport}
              className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">description</span>
              Export Laporan {range} Hari
            </button>
            <p className="text-center text-[10px] text-muted mt-2">Laporan akan terbuka di tab baru untuk di-print atau disimpan sebagai PDF</p>
          </>
        ) : (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary">lock</span>
            </div>
            <p className="text-sm font-bold text-foreground">Export Laporan {range} Hari</p>
            <p className="text-xs text-muted mt-1 mb-3">Export laporan PDF tersedia untuk member Pro. Upgrade sekarang dan dapatkan rekap progres, insight personal, dan rekomendasi rutinitas.</p>
            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-1 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              Upgrade ke Pro
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
