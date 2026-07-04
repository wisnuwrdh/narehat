"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  User,
  Info,
  TrendingUp,
  Lightbulb,
  Monitor,
  ChevronRight,
  Bedtime,
  Droplets,
  Brain,
  Footprints,
  Sparkles,
  CalendarDays,
  Camera,
  Bot,
  Edit3,
  BellRing,
  SentimentSatisfied,
} from "lucide-react";

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export default function DashboardPage() {
  const score = useAnimatedCounter(72);
  const circumference = 2 * Math.PI * 45;
  const progress = 72;
  const offset = circumference - (progress / 100) * circumference;

  const quickActions = [
    { icon: CalendarDays, label: "Tracker", href: "/tracker" },
    { icon: Camera, label: "Foto\nKulit", href: "/tracker" },
    { icon: Bot, label: "AI Consult", href: "/ai-consult", pro: true },
    { icon: Edit3, label: "Catatan", href: "/tracker" },
    { icon: BellRing, label: "Pengingat", href: "/settings" },
  ];

  const dailySummary = [
    { icon: Bedtime, label: "Tidur", value: "6.2", unit: "jam", progress: 78, color: "bg-indigo-400", dot: "bg-emerald-400" },
    { icon: Droplets, label: "Air", value: "1.5", unit: "L", progress: 60, color: "bg-blue-400", dot: "bg-emerald-400" },
    { icon: Brain, label: "Stress", value: "Sedang", progress: 55, color: "bg-amber-400", dot: "bg-amber-400" },
    { icon: Footprints, label: "Olahraga", value: "30", unit: "mnt", progress: 100, color: "bg-emerald-400", dot: "bg-emerald-400" },
    { icon: Sparkles, label: "Skincare", value: "2x", progress: 100, color: "bg-violet-400", dot: "bg-emerald-400" },
  ];

  const progressPhotos = [
    { label: "Hari ini", date: "3 Jul", isNow: true },
    { label: "Kemarin", date: "2 Jul", isNow: false },
    { label: "Lalu", date: "30 Jun", isNow: false },
  ];

  return (
    <div className="pb-36">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-start sticky top-0 bg-white z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Halo, Wisnu</h1>
            <span className="text-lg">👋</span>
          </div>
          <p className="text-sm text-muted">Yuk, jaga konsistensi hari ini.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-press p-2.5 bg-slate-50 border border-border-light rounded-2xl hover:bg-slate-100 transition-colors relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <Link
            href="/settings"
            className="btn-press p-2.5 bg-slate-50 border border-border-light rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <User className="w-5 h-5 text-slate-600" />
          </Link>
        </div>
      </header>

      {/* Streak */}
      <section className="px-6 mb-5">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl">
          <span className="text-base">🔥</span>
          <div className="flex-1">
            <span className="text-xs font-semibold text-orange-700">Streak 5 hari</span>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-1.5 bg-orange-400 rounded-full" />
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="w-6 h-1.5 bg-orange-200 rounded-full" />
              ))}
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-1 rounded-lg border border-orange-100">7 hari target</span>
        </div>
      </section>

      {/* Skin Score Card */}
      <section className="px-6 mb-6">
        <div
          className="bg-white border border-border-subtle rounded-3xl p-6 relative overflow-hidden card-hover"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 20px -2px rgba(53, 37, 205, 0.06)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-light/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">Skin Score Hari Ini</span>
                <button className="btn-press p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <Info className="w-4 h-4 text-muted-light" />
                </button>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-6xl font-extrabold text-slate-900 tracking-tight">{score}</span>
                <span className="text-lg text-muted-light font-medium">/100</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1.5 bg-primary-light text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                  Cukup Baik
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +6 dari kemarin
                </span>
              </div>
              <div className="flex gap-1 pt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 bg-primary rounded-full" />
                ))}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 bg-primary-light rounded-full" />
                ))}
              </div>
            </div>
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0 ml-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e9e7ff" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3525cd"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-light to-white rounded-full flex items-center justify-center shadow-sm">
                  <SentimentSatisfied className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insight Card */}
      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50/80 to-violet-50/40 rounded-3xl border border-indigo-100/80 p-5 relative overflow-hidden card-hover">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-accent/5 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100/50">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Insight Hari Ini</span>
                  <span className="text-[10px] text-muted">Berdasarkan data 7 hari terakhir</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-primary text-[10px] font-bold rounded-lg border border-indigo-100 shadow-sm">Baru</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 mb-4">
              Kurang tidur <span className="font-bold text-slate-900">3 hari terakhir</span> berkorelasi dengan munculnya{" "}
              <span className="font-bold text-primary italic">jerawat baru di dagu</span>.
            </p>
            <div className="flex items-center gap-3 mb-4 px-3 py-2.5 bg-white/70 rounded-xl border border-white/50">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">😴</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600">Tidur</span>
                  <span className="text-[10px] text-muted">↓ 5.8 jam</span>
                </div>
              </div>
              <span className="text-primary-muted text-sm">→</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🔴</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600">Jerawat</span>
                  <span className="text-[10px] text-muted">↑ +3 baru</span>
                </div>
              </div>
            </div>
            <button className="btn-press w-full flex items-center justify-between text-xs text-primary font-bold bg-white/80 hover:bg-white p-3 rounded-xl transition-colors border border-indigo-100/50">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Lihat penjelasan lengkap
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Aksi Cepat</h2>
          <button className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
            Edit
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="btn-press flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 bg-white border border-border-light rounded-2xl flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-md transition-all duration-200 shadow-sm relative">
                <action.icon className="w-6 h-6 text-primary" />
                {action.pro && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">
                    PRO
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium text-muted group-hover:text-slate-700 transition-colors text-center leading-tight whitespace-pre-line">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Summary */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Ringkasan Hari Ini</h2>
          <Link
            href="/tracker"
            className="btn-press flex items-center gap-1 text-xs font-bold text-muted hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-slate-50"
          >
            Detail
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {dailySummary.map((item, index) => (
            <div
              key={index}
              className="min-w-[100px] snap-start bg-white border border-border-subtle rounded-2xl p-3.5 flex flex-col items-center text-center relative card-hover shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${item.color.replace("bg-", "bg-").replace("-400", "-50")}`}>
                <item.icon className={`w-5 h-5 ${item.color.replace("bg-", "text-").replace("-400", "-500")}`} />
              </div>
              <span className="text-[10px] text-muted-light mb-1">{item.label}</span>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className="text-base font-bold text-slate-800">{item.value}</span>
                {item.unit && <span className="text-[10px] text-muted-light">{item.unit}</span>}
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.progress}%` }} />
              </div>
              <span className="text-[9px] text-muted-light mt-1">
                {item.progress === 100 ? "target tercapai" : `target ${item.label.toLowerCase()}`}
              </span>
              <div className={`absolute top-3 right-3 w-2 h-2 ${item.dot} rounded-full`} />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Progress */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Perkembangan Terbaru</h2>
          <Link
            href="/progress"
            className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors"
          >
            Lihat semua
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {progressPhotos.map((photo, index) => (
            <div
              key={index}
              className={`min-w-[140px] snap-start rounded-2xl p-2.5 relative card-hover shadow-sm ${
                photo.isNow
                  ? "bg-gradient-to-b from-primary-light/60 to-white border border-primary/10"
                  : "bg-white border border-border-subtle"
              }`}
            >
              <div className="mb-2 px-1 flex justify-between items-center">
                <div>
                  <span className={`text-[10px] block font-bold ${photo.isNow ? "text-primary" : "text-slate-500"}`}>
                    {photo.label}
                  </span>
                  <span className="text-[10px] text-muted-light">{photo.date}</span>
                </div>
                {photo.isNow && (
                  <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">Now</span>
                )}
              </div>
              <div className="relative">
                <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  <Camera className="w-8 h-8 text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="px-6 mb-12">
        <div className="bg-gradient-to-br from-primary-light/40 to-indigo-50/30 border border-primary/10 rounded-3xl p-5 relative overflow-hidden flex items-center gap-4 card-hover">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="flex-1 space-y-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-primary/10">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-bold text-slate-800">Rekomendasi AI</span>
              <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRO</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Fokus pada <span className="font-bold text-slate-800">kualitas tidur dan hidrasi</span>. Kulitmu butuh pemulihan setelah 3 hari kurang istirahat.
            </p>
            <Link
              href="/recommendations"
              className="btn-press text-[10px] font-bold text-primary flex items-center gap-1 bg-white/80 hover:bg-white px-3 py-2 rounded-xl transition-colors border border-primary/10 w-fit"
            >
              Lihat rencana lengkap
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="relative w-16 h-16 shrink-0 z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-light to-white rounded-2xl flex items-center justify-center shadow-sm border border-primary/10 rotate-3">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
