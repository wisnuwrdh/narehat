"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { thumbUrlFor } from "@/lib/storage/thumb-url";
import { computeSkinScore } from "@/lib/insights/skin-score";

interface DashboardData {
  userName: string;
  dailyLog: {
    sleep_hours: number;
    water_ml: number;
    exercise_minutes: number;
    stress_level: number;
    skincare_morning: boolean;
    skincare_evening: boolean;
    touched_face: boolean;
    junk_food: boolean;
    notes: string;
  } | null;
  insights: { title: string; description: string; type: string }[];
  photos: { url: string; date: string }[];
  streak: number;
  skinScore: number;
  skinScoreDelta: number;
  hasLogs: boolean;
}

const getScoreLabel = (s: number) => {
  if (s < 30) return { label: "Perlu Perbaikan", emoji: "sentiment_very_dissatisfied", color: "text-red-500" };
  if (s < 60) return { label: "Cukup", emoji: "sentiment_dissatisfied", color: "text-amber-500" };
  if (s < 80) return { label: "Cukup Baik", emoji: "sentiment_satisfied", color: "text-primary" };
  return { label: "Sangat Baik", emoji: "sentiment_very_satisfied", color: "text-emerald-500" };
};

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-500", blue: "bg-blue-50 text-blue-500",
  amber: "bg-amber-50 text-amber-500", emerald: "bg-emerald-50 text-emerald-500",
  violet: "bg-violet-50 text-violet-500", rose: "bg-rose-50 text-rose-500",
};
const barColorMap: Record<string, string> = {
  indigo: "bg-indigo-400", blue: "bg-blue-400", amber: "bg-amber-400",
  emerald: "bg-emerald-400", violet: "bg-violet-400", rose: "bg-rose-400",
};
const statusColorMap: Record<string, string> = { emerald: "bg-emerald-400", amber: "bg-amber-400" };

const quickActions = [
  { href: "/recommendations", icon: "soap", label: "Rekomendasi Produk", tier: "free" as const },
  { href: "/ai-consult", icon: "smart_toy", label: "AI Consult", tier: "premium" as const },
  { href: "/scan", icon: "photo_camera", label: "AI Deteksi", tier: "premium" as const },
  { href: "/scan?section=purging", icon: "science", label: "Purging Checker", tier: "free" as const },
  { href: "/routine", icon: "auto_awesome", label: "Routine", tier: "pro" as const },
];

function computeStreak(logs: { date: string }[]): number {
  if (logs.length === 0) return 0;
  const dates = logs.map((l) => l.date).sort().reverse();
  let streak = 0;
  const checkDate = new Date();
  for (const dateStr of dates) {
    const d = checkDate.toISOString().split("T")[0];
    if (dateStr === d) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (streak === 0 && dateStr < d) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

type WeekLog = {
  date: string; sleep_hours: number; water_ml: number; stress_level: number;
  exercise_minutes: number; skincare_morning: boolean; skincare_evening: boolean;
  junk_food: boolean; touched_face: boolean;
};

function compareWeeks(allLogs: WeekLog[]): DashboardData["insights"] {
  if (allLogs.length < 6) return [];
  const iso = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };
  const curLogs = allLogs.filter(l => l.date >= iso(-7) && l.date <= iso(0));
  const prevLogs = allLogs.filter(l => l.date >= iso(-14) && l.date <= iso(-8));
  if (curLogs.length < 2 || prevLogs.length < 2) return [];

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const avgField = (logs: WeekLog[], f: (l: WeekLog) => number) => avg(logs.map(f));
  const countField = (logs: WeekLog[], f: (l: WeekLog) => boolean) => logs.filter(f).length;

  const msgs: DashboardData["insights"] = [];

  const curSleep = avgField(curLogs, l => l.sleep_hours);
  const prevSleep = avgField(prevLogs, l => l.sleep_hours);
  if (curSleep - prevSleep >= 0.3) {
    msgs.push({ type: "positive", title: `Tidur membaik: ${prevSleep.toFixed(1)} → ${curSleep.toFixed(1)} jam`, description: "Rata-rata tidur naik pekan ini. Konsistensi tidur cukup mendukung regenerasi kulit." });
  } else if (prevSleep - curSleep >= 0.3) {
    msgs.push({ type: "warning", title: `Tidur turun: ${prevSleep.toFixed(1)} → ${curSleep.toFixed(1)} jam`, description: "Tidurmu berkurang. Targetkan 7-8 jam untuk pemulihan kulit." });
  }

  const curStress = avgField(curLogs, l => l.stress_level);
  const prevStress = avgField(prevLogs, l => l.stress_level);
  if (curStress - prevStress >= 0.3) {
    msgs.push({ type: "warning", title: `Stress naik: ${prevStress.toFixed(1)} → ${curStress.toFixed(1)}/5`, description: "Stress adalah faktor dengan bukti kuat untuk jerawat. Coba relaksasi 5 menit sebelum tidur." });
  } else if (prevStress - curStress >= 0.3) {
    msgs.push({ type: "positive", title: `Stress turun: ${prevStress.toFixed(1)} → ${curStress.toFixed(1)}/5`, description: "Level stress membaik. Pertahankan teknik relaksasi yang kamu lakukan." });
  }

  const curSk = countField(curLogs, l => l.skincare_morning && l.skincare_evening);
  const prevSk = countField(prevLogs, l => l.skincare_morning && l.skincare_evening);
  if (curSk > prevSk) {
    msgs.push({ type: "positive", title: `Skincare lebih konsisten: ${prevSk} → ${curSk} hari/minggu`, description: "Rutinitas pagi & malam naik. Konsistensi ini kunci progress kulit." });
  } else if (curSk < prevSk) {
    msgs.push({ type: "warning", title: `Skincare jarang: ${prevSk} → ${curSk} hari/minggu`, description: "Skincare pagi & malam berkurang. Usahakan minimal rutin di pagi hari." });
  }

  const curJunk = countField(curLogs, l => l.junk_food);
  const prevJunk = countField(prevLogs, l => l.junk_food);
  if (curJunk > prevJunk) {
    msgs.push({ type: "warning", title: `Junk food naik: ${prevJunk} → ${curJunk} hari/minggu`, description: "Frekuensi makan junk food bertambah. Makanan junk termasuk faktor makanan dengan bukti terkuat untuk jerawat." });
  } else if (curJunk < prevJunk) {
    msgs.push({ type: "positive", title: `Junk food turun: ${prevJunk} → ${curJunk} hari/minggu`, description: "Pola makan membaik. Kurangi gula/junk food untuk membantu kulit." });
  }

  const curTouch = countField(curLogs, l => l.touched_face);
  const prevTouch = countField(prevLogs, l => l.touched_face);
  if (curTouch > prevTouch) {
    msgs.push({ type: "warning", title: `Sentuh wajah lebih sering: ${prevTouch} → ${curTouch} hari/minggu`, description: "Sering menyentuh wajah bisa memindahkan bakteri. Usahakan lebih jarang." });
  } else if (curTouch < prevTouch) {
    msgs.push({ type: "positive", title: `Sentuh wajah berkurang: ${prevTouch} → ${curTouch} hari/minggu`, description: "Kamu lebih jarang menyentuh wajah pekan ini. Pertahankan." });
  }

  const curEx = countField(curLogs, l => l.exercise_minutes >= 30);
  const prevEx = countField(prevLogs, l => l.exercise_minutes >= 30);
  if (curEx > prevEx) {
    msgs.push({ type: "positive", title: `Olahraga lebih rutin: ${prevEx} → ${curEx} hari/minggu`, description: "Jumlah hari berolahraga naik. Pertahankan target 30 menit." });
  } else if (curEx < prevEx) {
    msgs.push({ type: "warning", title: `Olahraga berkurang: ${prevEx} → ${curEx} hari/minggu`, description: "Frekuensi olahraga turun. Buat jadwal ringan beberapa kali seminggu." });
  }

  const order: Record<string, number> = { warning: 0, positive: 1, neutral: 2 };
  msgs.sort((a, b) => order[a.type] - order[b.type]);
  return msgs.slice(0, 3);
}

export default function DashboardPage() {
  const { user, activePlan, planActive, daysLeft, refreshUser } = useUser();
  const [data, setData] = useState<DashboardData>({
    userName: "",
    dailyLog: null,
    insights: [],
    photos: [],
    streak: 0,
    skinScore: 0,
    skinScoreDelta: 0,
    hasLogs: false,
  });
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [compareExpanded, setCompareExpanded] = useState(false);
  const lastLoadRef = useRef(0);

  useEffect(() => {
    if (!window.location.search.includes("payment=success")) return;
    setShowSuccessBanner(true);
    window.history.replaceState({}, "", window.location.pathname);
    const started = Date.now();
    const timer = setInterval(async () => {
      await refreshUser();
      if (Date.now() - started > 30000) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [refreshUser]);

  const loadDashboard = useCallback(async () => {
    lastLoadRef.current = Date.now();
    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      const dates: string[] = [];
      const d = new Date();
      for (let i = 0; i < 7; i++) {
        dates.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() - 1);
      }

      const [weekRes, photosRes, allLogsRes] = await Promise.all([
        fetch(`/api/tracker?dates=${dates.join(",")}`),
        fetch("/api/photos"),
        fetch("/api/tracker"),
      ]);

      const weekData = await weekRes.json();
      const photosData = await photosRes.json();
      const allLogsData = await allLogsRes.json();

      const weekLogs = weekData.logs || [];
      const allLogs = allLogsData.logs || [];
      const log = weekLogs.find((l: { date: string }) => l.date === today) || null;
      const photos = (photosData.photos || []).slice(0, 4);

      const skinScore = computeSkinScore(log);
      let skinScoreDelta = 0;

      const yesterdayLog = weekLogs.find((l: { date: string }) => l.date === yesterdayStr);
      if (yesterdayLog) {
        skinScoreDelta = skinScore - computeSkinScore(yesterdayLog);
      } else if (weekLogs.length > 1) {
        skinScoreDelta = skinScore - computeSkinScore(weekLogs[0] === log ? weekLogs[1] : weekLogs[0]);
      }

      const streak = computeStreak(allLogs);
      const insights = compareWeeks(allLogs as WeekLog[]);
      const userName = user.name || "User";

      setData({ userName, dailyLog: log, insights, photos, streak, skinScore, skinScoreDelta, hasLogs: allLogs.length > 0 });

      let s = 0;
      const duration = 1200;
      const stepTime = Math.max(Math.floor(duration / (skinScore || 1)), 16);
      const timer = setInterval(() => {
        s += 1;
        setAnimatedScore(s);
        if (s >= skinScore) clearInterval(timer);
      }, stepTime);

      let st = 0;
      const _streak = streak;
      const streakDuration = 80;
      const streakTimer = setInterval(() => {
        st += 1;
        setAnimatedStreak(st);
        if (st >= _streak) clearInterval(streakTimer);
      }, streakDuration);

      return () => { clearInterval(timer); clearInterval(streakTimer); };
    } catch {
      setData((d) => ({ ...d, userName: "User" }));
    }
  }, [user.name]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastLoadRef.current > 60000) {
        loadDashboard();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadDashboard]);

  useEffect(() => {
    if (user.name) {
      setData((d) => ({ ...d, userName: user.name }));
    }
  }, [user.name]);

  const score = animatedScore;
  const scoreMeta = getScoreLabel(animatedScore);
  const segments = Math.max(1, Math.ceil(animatedScore / 20));
  const delta = data.skinScoreDelta;
  const streak = animatedStreak;

  const deltaSign = delta > 0 ? "+" : "";
  const deltaColor = delta >= 0 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50";
  const deltaIcon = delta >= 0 ? "trending_up" : "trending_down";

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
    { icon: "pan_tool", color: "rose" as const, label: "Sentuh Wajah", value: dailyLog.touched_face ? "Ya" : "Tidak", unit: "", pct: dailyLog.touched_face ? 0 : 100, target: "hindari", status: dailyLog.touched_face ? "amber" as const : "emerald" as const, text: true as const },
    { icon: "fastfood", color: "rose" as const, label: "Junk Food", value: dailyLog.junk_food ? "Ya" : "Tidak", unit: "", pct: dailyLog.junk_food ? 0 : 100, target: "hindari", status: dailyLog.junk_food ? "amber" as const : "emerald" as const, text: true as const },
  ] : [
    { icon: "edit_calendar", color: "indigo" as const, label: "Belum ada data", value: "Tracker", unit: "", pct: 0, target: "isi tracker dulu", status: "amber" as const, text: true as const },
  ];

  const showEmptyCTA = !dailyLog;
  const isNewUser = !data.hasLogs;

  const photoDates = data.photos.length > 0 ? data.photos.map((p) => ({
    url: p.url,
    label: "",
    date: p.date,
    active: false,
  })) : [
    { url: "", label: "Belum ada", date: "", active: true },
  ];

  return (
    <main className="max-w-md md:max-w-4xl mx-auto">
        <header className="px-6 pt-6 pb-4 flex justify-between items-start bg-white sticky top-0 z-20">
          <div className="animate-fade-in-up">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Halo, {data.userName || "User"}</h1>
          <p className="text-sm text-muted">{showEmptyCTA ? (isNewUser ? "Mulai dengan mengisi tracker harianmu." : "Catat kebiasaanmu hari ini untuk menjaga konsistensi.") : "Yuk, jaga konsistensi hari ini."}</p>
        </div>
      </header>

      {showSuccessBanner && (
        <section className="px-6 mb-5 animate-scale-in">
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl">
            <span className="text-xl">💜</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">
                {planActive ? `Pembayaran berhasil! Selamat datang di ${activePlan === "pro" ? "Pro" : "Premium"} 👑` : "Pembayaran berhasil! Mengaktifkan plan kamu..."}
              </p>
              <p className="text-xs text-emerald-700/70">
                {planActive ? `Plan aktif ${daysLeft} hari. Semua fitur ${activePlan === "pro" ? "Pro" : "Premium"} sudah terbuka.` : "Pembayaran sedang diproses, mohon tunggu sebentar..."}
              </p>
            </div>
          </div>
        </section>
      )}

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
                {streak >= 7 ? `${streak} hari` : "7 hari target"}
              </span>
        </div>
      </section>

      {showEmptyCTA && (
      <section className="px-6 mb-6 animate-fade-in-up delay-150">
        <Link href="/tracker" className="block bg-gradient-to-r from-primary to-accent rounded-2xl p-4 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">edit_calendar</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{isNewUser ? "Isi Tracker Pertamamu" : "Isi Tracker Hari Ini"}</p>
              <p className="text-xs text-white/70">{isNewUser ? "Catat kebiasaan harian untuk mulai dapat insight personal →" : "Catat kebiasaan hari ini untuk menjaga konsistensi →"}</p>
            </div>
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </Link>
      </section>
      )}

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
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${deltaColor}`}>
                  <span className="material-symbols-outlined text-sm">{deltaIcon}</span>
                  {deltaSign}{delta} dari kemarin
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
            <button
              onClick={() => insights.length > 0 && setCompareExpanded(!compareExpanded)}
              className={`w-full flex justify-between items-start mb-4 ${insights.length > 0 ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100/50">
                  <span className="material-symbols-outlined text-primary">insights</span>
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-800 text-sm block">Perbandingan Pekan Ini</span>
                  <span className="text-[10px] text-muted">7 hari terakhir vs 7 hari sebelumnya</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {insights.length > 0 && (
                  <span className="px-2.5 py-1 bg-white text-primary text-[10px] font-bold rounded-lg border border-indigo-100 shadow-sm">Baru</span>
                )}
                {insights.length > 0 && (
                  <span className={`material-symbols-outlined text-primary text-lg transition-transform ${compareExpanded ? "rotate-180" : ""}`}>expand_more</span>
                )}
              </div>
            </button>

            {insights.length === 0 ? (
              dailyLog ? (
                <p className="text-sm leading-relaxed text-slate-700">
                  Perbandingan antar pekan muncul setelah kamu tracking lebih dari satu minggu.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-slate-700 mb-4">
                  Isi tracker harianmu sekarang untuk melihat perbandingan kebiasaan antar pekan.
                </p>
              )
            ) : !compareExpanded ? (
              <div className="flex items-center gap-2.5 p-3 bg-white/70 rounded-xl border border-white/50 text-left">
                <span className={`material-symbols-outlined text-base ${
                  insights[0].type === "warning" ? "text-amber-500" : insights[0].type === "positive" ? "text-emerald-500" : "text-primary"
                }`}>
                  {insights[0].type === "warning" ? "trending_down" : insights[0].type === "positive" ? "trending_up" : "tune"}
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold text-slate-800 truncate w-full">{insights[0].title}</span>
                  <span className="text-[10px] text-muted">{insights.length} perubahan total</span>
                </span>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {insights.slice(0, 3).map((ins, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-white/70 rounded-xl border border-white/50">
                      <span className={`material-symbols-outlined text-base mt-0.5 ${ins.type === "warning" ? "text-amber-500" : ins.type === "positive" ? "text-emerald-500" : "text-primary"}`}>
                        {ins.type === "warning" ? "trending_down" : ins.type === "positive" ? "trending_up" : "tune"}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{ins.title}</p>
                        <p className="text-[10px] text-muted mt-0.5">{ins.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href="/tracker" className="btn-press px-3 py-2 bg-primary-light text-primary text-[10px] font-bold rounded-xl hover:bg-primary-light/70 transition-colors">Ke Tracker</Link>
                  <Link href="/recommendations" className="btn-press px-3 py-2 bg-white border border-border-light text-[10px] font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Lihat Rekomendasi</Link>
                </div>
              </>
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
                {item.tier !== "free" && (
                  (item.tier === "premium" && user.plan === "free") || (item.tier === "pro" && !user.plan.includes("pro")) ? (
                    <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-white text-[8px] font-bold rounded-md ${item.tier === "pro" ? "bg-violet-600" : "bg-primary"}`}>
                      {item.tier === "premium" ? "PREMIUM" : "PRO"}
                    </span>
                  ) : null
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
        <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto md:overflow-visible no-scrollbar pb-2 snap-x snap-mandatory">
          {summaryItems.map((item) => (
            <Link
              key={item.label}
              href="/tracker"
              className="min-w-[100px] md:min-w-0 snap-start bg-white border border-border-subtle rounded-2xl p-3.5 flex flex-col items-center text-center relative card-hover shadow-sm cursor-pointer"
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
        <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto md:overflow-visible no-scrollbar pb-2 snap-x snap-mandatory">
          {photoDates.map((item, i) => (
            <Link
              key={item.date || i}
              href="/progress"
              className={`min-w-[140px] md:min-w-0 snap-start border rounded-2xl p-2.5 relative card-hover shadow-sm cursor-pointer ${"bg-white border-border-subtle"}`}
            >
              <div className="mb-2 px-1 flex justify-between items-center">
                <div>
                  <span className="text-[10px] block text-slate-500">{item.label || (i === 0 && item.url ? "Terbaru" : `Foto ${i + 1}`)}</span>
                  <span className="text-[10px] text-muted-light">{item.date}</span>
                </div>
                {i === 0 && item.url && <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">Now</span>}
              </div>
              <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                {item.url ? (
                  <img src={thumbUrlFor(item.url)} alt={`Foto ${item.date}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
                )}
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
              {dailyLog ? (
                <>Kulitmu butuh konsistensi. Tetap tracking dan AI akan memberikan rekomendasi yang lebih personal berdasarkan data-mu.</>
              ) : (
                <>Isi tracker harianmu dan upload foto progress secara rutin. AI Narehat akan menganalisis polamu dan memberikan rekomendasi yang dipersonalisasi.</>
              )}
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
