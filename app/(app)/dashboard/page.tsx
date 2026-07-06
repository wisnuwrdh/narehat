"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface DashboardData {
  userName: string;
  dailyLog: {
    sleep_hours: number;
    water_ml: number;
    exercise_minutes: number;
    stress_level: number;
    skincare_morning: boolean;
    skincare_evening: boolean;
    notes: string;
  } | null;
  insights: { title: string; description: string; type: string }[];
  photos: { url: string; date: string }[];
  streak: number;
  skinScore: number;
  skinScoreDelta: number;
}

function computeSkinScore(log: DashboardData["dailyLog"]): number {
  if (!log) return 0;
  let score = 50;
  score += Math.min(log.sleep_hours / 8, 1) * 15;
  score += Math.min(log.water_ml / 2500, 1) * 10;
  score += Math.min(log.exercise_minutes / 30, 1) * 10;
  score += (1 - (log.stress_level - 1) / 4) * 10;
  if (log.skincare_morning) score += 7;
  if (log.skincare_evening) score += 8;
  return Math.min(100, Math.round(score));
}

const getScoreLabel = (s: number) => {
  if (s < 30) return { label: "Perlu Perbaikan", emoji: "sentiment_very_dissatisfied", color: "text-red-500" };
  if (s < 60) return { label: "Cukup", emoji: "sentiment_dissatisfied", color: "text-amber-500" };
  if (s < 80) return { label: "Cukup Baik", emoji: "sentiment_satisfied", color: "text-primary" };
  return { label: "Sangat Baik", emoji: "sentiment_very_satisfied", color: "text-emerald-500" };
};

const summaryItems = [
  { icon: "bedtime", color: "indigo", label: "Tidur", value: "6.2", unit: "jam", pct: 78, target: "8 jam", status: "emerald" },
  { icon: "water_drop", color: "blue", label: "Air", value: "1.5", unit: "L", pct: 60, target: "2.5 L", status: "emerald" },
  { icon: "psychology", color: "amber", label: "Stress", value: "Sedang", unit: "", pct: 55, target: "6/10 level", status: "amber", text: true },
  { icon: "directions_run", color: "emerald", label: "Olahraga", value: "30", unit: "mnt", pct: 100, target: "target tercapai", status: "emerald" },
  { icon: "spa", color: "violet", label: "Skincare", value: "2x", unit: "", pct: 100, target: "target tercapai", status: "emerald", text: true },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-500", blue: "bg-blue-50 text-blue-500",
  amber: "bg-amber-50 text-amber-500", emerald: "bg-emerald-50 text-emerald-500",
  violet: "bg-violet-50 text-violet-500",
};
const barColorMap: Record<string, string> = {
  indigo: "bg-indigo-400", blue: "bg-blue-400", amber: "bg-amber-400",
  emerald: "bg-emerald-400", violet: "bg-violet-400",
};
const statusColorMap: Record<string, string> = { emerald: "bg-emerald-400", amber: "bg-amber-400" };

const quickActions = [
  { href: "/tracker", icon: "edit_calendar", label: "Tracker" },
  { href: "/tracker", icon: "add_a_photo", label: "Foto Kulit" },
  { href: "/ai-consult", icon: "smart_toy", label: "AI Consult", pro: true },
  { href: "/tracker", icon: "edit_note", label: "Catatan" },
  { href: "/settings", icon: "notifications_active", label: "Pengingat" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    userName: "",
    dailyLog: null,
    insights: [],
    photos: [],
    streak: 0,
    skinScore: 0,
    skinScoreDelta: 0,
  });
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    async function load() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const [sessionRes, trackerRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch(`/api/tracker?date=${today}`),
        ]);

        const session = await sessionRes.json();
        const tracker = await trackerRes.json();
        const log = tracker.logs?.[0] || null;

        const skinScore = computeSkinScore(log);
        const userName = session.user?.user_metadata?.name || session.user?.email?.split("@")[0] || "User";

        let streak = 0;
        const checkDate = new Date();
        for (let i = 0; i < 365; i++) {
          const d = checkDate.toISOString().split("T")[0];
          const r = await fetch(`/api/tracker?date=${d}`);
          const j = await r.json();
          if (j.logs?.[0]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (i === 0) {
            break;
          } else {
            break;
          }
        }

        let insights: DashboardData["insights"] = [];
        try {
          const iRes = await fetch("/api/ai/consult?q=insights");
          const iData = await iRes.json();
          if (iData.insights) insights = iData.insights;
        } catch {}

        setData({ userName, dailyLog: log, insights, photos: [], streak, skinScore, skinScoreDelta: 0 });

        let s = 0;
        const duration = 1200;
        const stepTime = Math.max(Math.floor(duration / skinScore), 16);
        const timer = setInterval(() => {
          s += 1;
          setAnimatedScore(s);
          if (s >= skinScore) clearInterval(timer);
        }, stepTime);

        let st = 0;
        const streakDuration = 200;
        const streakTimer = setInterval(() => {
          st += 1;
          setAnimatedStreak(st);
          if (st >= streak) clearInterval(streakTimer);
        }, streakDuration);

        return () => { clearInterval(timer); clearInterval(streakTimer); };
      } catch {
        setData((d) => ({ ...d, userName: "User" }));
      }
    }
    load();
  }, []);

  const score = animatedScore;
  const scoreMeta = getScoreLabel(animatedScore);
  const segments = Math.max(1, Math.ceil(animatedScore / 20));
  const delta = 2;
  const streak = animatedStreak;

  const toggleInfo = useCallback(() => {
    const next = !showInfo;
    setShowInfo(next);
    if (next) setTimeout(() => setShowInfo(false), 4000);
  }, [showInfo]);

  const { dailyLog, insights } = data;

  const summaryItems = dailyLog ? [
    { icon: "bedtime", color: "indigo" as const, label: "Tidur", value: dailyLog.sleep_hours.toString(), unit: "jam", pct: Math.round((dailyLog.sleep_hours / 8) * 100), target: "8 jam", status: dailyLog.sleep_hours >= 6 ? "emerald" as const : "amber" as const },
    { icon: "water_drop", color: "blue" as const, label: "Air", value: (dailyLog.water_ml / 1000).toFixed(1), unit: "L", pct: Math.round((dailyLog.water_ml / 2500) * 100), target: "2.5 L", status: dailyLog.water_ml >= 1500 ? "emerald" as const : "amber" as const },
    { icon: "psychology", color: "amber" as const, label: "Stress", value: dailyLog.stress_level <= 2 ? "Santai" : dailyLog.stress_level <= 3 ? "Sedang" : "Tinggi", unit: "", pct: Math.round((1 - (dailyLog.stress_level - 1) / 4) * 100), target: `${dailyLog.stress_level}/5 level`, status: dailyLog.stress_level <= 2 ? "emerald" as const : "amber" as const, text: true as const },
    { icon: "directions_run", color: "emerald" as const, label: "Olahraga", value: dailyLog.exercise_minutes.toString(), unit: "mnt", pct: Math.round((dailyLog.exercise_minutes / 30) * 100), target: dailyLog.exercise_minutes >= 30 ? "target tercapai" : `kurang ${30 - dailyLog.exercise_minutes} mnt`, status: dailyLog.exercise_minutes >= 20 ? "emerald" as const : "amber" as const },
    { icon: "spa", color: "violet" as const, label: "Skincare", value: [dailyLog.skincare_morning && "Pagi", dailyLog.skincare_evening && "Malam"].filter(Boolean).join("+") || "0x", unit: "", pct: [dailyLog.skincare_morning, dailyLog.skincare_evening].filter(Boolean).length * 50, target: "2x rutinitas", status: dailyLog.skincare_morning || dailyLog.skincare_evening ? "emerald" as const : "amber" as const, text: true as const },
  ] : [
    { icon: "edit_calendar", color: "indigo" as const, label: "Tracker", value: "Kosong", unit: "", pct: 0, target: "isi tracker dulu", status: "amber" as const, text: true as const },
  ];

  const photoDates = data.photos.length > 0 ? data.photos.map((p, i) => ({
    label: i === 0 ? "Terbaru" : `Foto ${i + 1}`,
    date: p.date,
    active: i === 0,
  })) : [
    { label: "Belum ada", date: "", active: true },
  ];

  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4 flex justify-between items-start bg-white sticky top-0 z-20">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Halo, {data.userName || "User"}</h1>
            <span className="text-lg">👋</span>
          </div>
          <p className="text-sm text-muted">Yuk, jaga konsistensi hari ini.</p>
        </div>
        <div className="flex gap-2 animate-fade-in-up delay-100">
          <button
            onClick={() => alert('Notifikasi: Belum ada notifikasi baru')}
            className="btn-press p-2.5 bg-slate-50 border border-border-light rounded-2xl hover:bg-slate-100 transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl text-slate-600">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <Link href="/settings" className="btn-press p-2.5 bg-slate-50 border border-border-light rounded-2xl hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-xl text-slate-600">person</span>
          </Link>
        </div>
      </header>

      <section className="px-6 mb-5 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl">
          <span className="text-base">🔥</span>
          <div className="flex-1">
            <span className="text-xs font-semibold text-orange-700">Streak {animatedStreak} hari</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-colors duration-300 ${i < streak ? "bg-orange-400" : "bg-orange-200"}`}
                />
              ))}
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-1 rounded-lg border border-orange-100">
            7 hari target
          </span>
        </div>
      </section>

      <section className="px-6 mb-6 animate-fade-in-up delay-200">
        <div className="bg-white border border-border-subtle rounded-3xl p-6 relative overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 20px -2px rgba(53, 37, 205, 0.06)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-light/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 relative">
                <span className="text-sm font-semibold text-slate-700">Skin Score Hari Ini</span>
                <button onClick={toggleInfo} className="btn-press p-1 hover:bg-slate-100 rounded-lg transition-colors relative">
                  <span className="material-symbols-outlined text-lg text-muted-light">info</span>
                </button>
                {showInfo && (
                  <div className="absolute top-10 left-0 z-30 bg-white border border-border-subtle rounded-2xl p-4 shadow-xl w-64 animate-scale-in">
                    <p className="text-xs font-bold text-slate-800 mb-1">Apa itu Skin Score?</p>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Skin Score dihitung dari konsistensi tracker harian, kondisi kulit, dan progress foto. Semakin tinggi, semakin sehat kulitmu berdasarkan data yang tercatat.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-6xl font-extrabold text-slate-900 tracking-tight stat-number">{score}</span>
                <span className="text-lg text-muted-light font-medium">/100</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1.5 bg-primary-light text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                  {scoreMeta.label}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  {delta > 0 ? "+" : ""}{delta} dari kemarin
                </span>
              </div>
              <div className="flex gap-1 pt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i < segments ? "bg-primary" : "bg-primary-light"}`}
                  />
                ))}
              </div>
            </div>
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0 ml-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e9e7ff" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#3525cd" strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (score / 100) * 283} style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-light to-white rounded-full flex items-center justify-center shadow-sm">
                  <span className={`material-symbols-outlined text-3xl ${scoreMeta.color}`}>{scoreMeta.emoji}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6 animate-fade-in-up delay-300">
        <div className="bg-gradient-to-br from-indigo-50/80 to-violet-50/40 rounded-3xl border border-indigo-100/80 p-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-accent/5 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100/50">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Insight Hari Ini</span>
                  <span className="text-[10px] text-muted">Berdasarkan data 7 hari terakhir</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-primary text-[10px] font-bold rounded-lg border border-indigo-100 shadow-sm">Baru</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 mb-4">
              {insights.length > 0 ? (
                insights[0].title
              ) : dailyLog ? (
                <>Tracker harian sudah terisi. Semakin sering tracking, insight akan semakin akurat.</>
              ) : (
                <>Kamu belum mengisi tracker hari ini. Isi sekarang untuk melihat insight personal.</>
              )}
            </p>
            {dailyLog && (
            <div className="flex items-center gap-3 mb-4 px-3 py-2.5 bg-white/70 rounded-xl border border-white/50">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">😴</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600">Tidur</span>
                  <span className="text-[10px] text-muted">{dailyLog.sleep_hours} jam</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary-muted text-sm">arrow_forward</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">💧</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600">Air</span>
                  <span className="text-[10px] text-muted">{(dailyLog.water_ml / 1000).toFixed(1)}L</span>
                </div>
              </div>
            </div>
            )}
            <button
              onClick={() => setInsightExpanded(!insightExpanded)}
              className="btn-press w-full flex items-center justify-between text-xs text-primary font-bold bg-white/80 hover:bg-white p-3 rounded-xl transition-colors border border-indigo-100/50"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">monitoring</span>
                {insightExpanded ? "Sembunyikan" : "Lihat penjelasan lengkap"}
              </div>
              <span className={`material-symbols-outlined text-sm transition-transform ${insightExpanded ? "rotate-180" : ""}`}>expand_more</span>
            </button>
            {insightExpanded && (
              <div className="mt-3 p-4 bg-white/60 rounded-xl border border-indigo-100/50 animate-scale-in">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insights.length > 0 ? insights[0].description : (dailyLog ? "Berdasarkan data tracker hari ini, kami sedang menganalisis pola kebiasaanmu. Semakin konsisten kamu tracking, semakin personal insight yang akan muncul." : "Kamu belum mengisi tracker hari ini. Yuk, isi sekarang supaya AI Narehat bisa menganalisis pola kebiasaanmu dan memberikan insight yang personal.")}
                </p>
                <div className="flex gap-2 mt-3">
                  <Link href="/tracker" className="btn-press px-3 py-2 bg-primary-light text-primary text-[10px] font-bold rounded-xl hover:bg-primary-light/70 transition-colors">Ke Tracker</Link>
                  <Link href="/recommendations" className="btn-press px-3 py-2 bg-white border border-border-light text-[10px] font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Lihat Rekomendasi</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 mb-8 animate-fade-in-up delay-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Aksi Cepat</h2>
          <span className="text-[10px] text-muted">Tap untuk akses cepat</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {quickActions.map((item) => (
            <Link key={item.label} href={item.href} className="btn-press flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-white border border-border-light rounded-2xl flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-md transition-all duration-200 shadow-sm relative">
                <span className="material-symbols-outlined text-2xl text-primary">{item.icon}</span>
                {item.pro && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">PRO</span>
                )}
              </div>
              <span className="text-[10px] font-medium text-muted group-hover:text-slate-700 transition-colors text-center leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 mb-8 animate-fade-in-up delay-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Ringkasan Hari Ini</h2>
          <Link href="/tracker" className="btn-press flex items-center gap-1 text-xs font-bold text-muted hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-slate-50">
            Detail <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {summaryItems.map((item) => (
            <Link
              key={item.label}
              href="/tracker"
              className="min-w-[100px] snap-start bg-white border border-border-subtle rounded-2xl p-3.5 flex flex-col items-center text-center relative card-hover shadow-sm cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${colorMap[item.color]}`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <span className="text-[10px] text-muted-light mb-1">{item.label}</span>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className={`text-base font-bold ${item.text && item.color === "amber" ? "text-amber-600" : "text-slate-800"}`}>
                  {item.value}
                </span>
                {item.unit && <span className="text-[10px] text-muted-light">{item.unit}</span>}
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColorMap[item.color]}`} style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-[9px] text-muted-light mt-1">{item.target}</span>
              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${statusColorMap[item.status] || "bg-emerald-400"}`} />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Perkembangan Terbaru</h2>
          <Link href="/progress" className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors">Lihat semua</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {photoDates.map((item, i) => (
            <Link
              key={item.date}
              href="/progress"
              className={`min-w-[140px] snap-start border rounded-2xl p-2.5 relative card-hover shadow-sm cursor-pointer ${item.active ? "bg-gradient-to-b from-primary-light/60 to-white border-primary/10" : "bg-white border-border-subtle"}`}
            >
              <div className="mb-2 px-1 flex justify-between items-center">
                <div>
                  <span className={`text-[10px] block font-bold ${item.active ? "text-primary" : "text-slate-500"}`}>{item.label}</span>
                  <span className="text-[10px] text-muted-light">{item.date}</span>
                </div>
                {i === 0 && <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">Now</span>}
              </div>
              <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 mb-12 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
        <div className="bg-gradient-to-br from-primary-light/40 to-indigo-50/30 border border-primary/10 rounded-3xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="flex-1 space-y-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-primary/10">
                <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
              </div>
              <span className="text-xs font-bold text-slate-800">Rekomendasi AI</span>
              <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRO</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Fokus pada <span className="font-bold text-slate-800">kualitas tidur dan hidrasi</span>. Kulitmu butuh pemulihan setelah 3 hari kurang istirahat.
            </p>
            <Link href="/recommendations" className="btn-press text-[10px] font-bold text-primary flex items-center gap-1 bg-white/80 hover:bg-white px-3 py-2 rounded-xl transition-colors border border-primary/10 w-fit">
              Lihat rencana lengkap <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
          <div className="relative w-16 h-16 shrink-0 z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-light to-white rounded-2xl flex items-center justify-center shadow-sm border border-primary/10 rotate-3">
              <span className="material-symbols-outlined text-2xl text-primary">lightbulb</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
