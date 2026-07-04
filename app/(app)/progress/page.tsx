"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarMonth,
  Monitoring,
  Hub,
  Compare,
  TrendingUp,
  Warning,
  Droplets,
  Camera,
  ChevronRight,
} from "lucide-react";
import AppHeader from "@/components/app/AppHeader";

// Simple line chart component (SVG-based, no external lib)
function LineChart() {
  const data = [58, 60, 59, 63, 65, 64, 66, 68, 70, 72];
  const labels = ["5 Jun", "8 Jun", "11 Jun", "14 Jun", "17 Jun", "20 Jun", "23 Jun", "26 Jun", "29 Jun", "2 Jul"];

  const width = 320;
  const height = 160;
  const padding = { top: 10, right: 10, bottom: 30, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minY = 40;
  const maxY = 100;

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
  const yScale = (v: number) => padding.top + chartHeight - ((v - minY) / (maxY - minY)) * chartHeight;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d)}`).join(" ");
  const areaD = `${pathD} L ${xScale(data.length - 1)} ${yScale(minY)} L ${xScale(0)} ${yScale(minY)} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[50, 60, 70, 80, 90].map((y) => (
        <line
          key={y}
          x1={padding.left}
          y1={yScale(y)}
          x2={width - padding.right}
          y2={yScale(y)}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}

      {/* Area fill */}
      <path d={areaD} fill="rgba(53, 37, 205, 0.08)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#3525cd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(i)}
          cy={yScale(d)}
          r="4"
          fill="#3525cd"
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* X axis labels */}
      {[0, 2, 4, 6, 8, 9].map((i) => (
        <text
          key={i}
          x={xScale(i)}
          y={height - 8}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          {labels[i]}
        </text>
      ))}

      {/* Y axis labels */}
      {[50, 70, 90].map((y) => (
        <text
          key={y}
          x={padding.left - 5}
          y={yScale(y) + 3}
          textAnchor="end"
          fontSize="10"
          fill="#94a3b8"
        >
          {y}
        </text>
      ))}
    </svg>
  );
}

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState("30");

  const habitCorrelations = [
    { label: "Tidur cukup", score: "+12 poin", width: 85, color: "bg-emerald-400", isPositive: true },
    { label: "Minum air cukup", score: "+8 poin", width: 65, color: "bg-emerald-400", isPositive: true },
    { label: "Stress rendah", score: "+6 poin", width: 50, color: "bg-emerald-400", isPositive: true },
    { label: "Begadang", score: "-10 poin", width: 70, color: "bg-red-400", isPositive: false },
  ];

  const photos = [
    { label: "Hari ini", date: "3 Jul", isNow: true },
    { label: "Kemarin", date: "2 Jul", isNow: false },
    { label: "1 Minggu lalu", date: "26 Jun", isNow: false },
    { label: "2 Minggu lalu", date: "19 Jun", isNow: false },
  ];

  const insights = [
    { icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", title: "Skin score naik 8%", desc: "Konsistensi skincare 2x sehari berkontribusi besar" },
    { icon: Warning, iconBg: "bg-amber-50", iconColor: "text-amber-500", title: "Tidur kurang berkorelasi", desc: "3 hari tidur <6 jam = muncul jerawat baru" },
    { icon: Droplets, iconBg: "bg-blue-50", iconColor: "text-blue-500", title: "Hidrasi membaik", desc: "Rata-rata minum air naik dari 1.2L ke 1.8L" },
  ];

  return (
    <div className="pb-36">
      <AppHeader
        title="Perkembangan"
        subtitle="Lihat perubahan kulitmu dari waktu ke waktu"
        rightContent={
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border-light">
            <CalendarMonth className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-slate-700">30 hari</span>
          </div>
        }
      />

      {/* Time Range Selector */}
      <section className="px-6 mb-6">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-border-subtle">
          {["7", "30", "90"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                timeRange === range
                  ? "text-primary bg-white shadow-sm"
                  : "text-muted hover:bg-white hover:shadow-sm"
              }`}
            >
              {range} hari
            </button>
          ))}
        </div>
      </section>

      {/* Skin Score Chart */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <Monitoring className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Skin Score Trend</h3>
                <p className="text-[10px] text-muted">Rata-rata: 68/100</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg">↑ +8%</span>
          </div>
          <div className="h-48">
            <LineChart />
          </div>
        </div>
      </section>

      {/* Habit Correlation */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Hub className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Korelasi Kebiasaan</h3>
              <p className="text-[10px] text-muted">Pengaruh kebiasaan terhadap skin score</p>
            </div>
          </div>
          <div className="space-y-3">
            {habitCorrelations.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className={`font-bold ${item.isPositive ? "text-emerald-600" : "text-red-500"}`}>{item.score}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Timeline */}
      <section className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Timeline Foto</h2>
          <button className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
            Lihat semua
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {photos.map((photo, i) => (
            <div
              key={i}
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

      {/* Before/After */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Compare className="w-5 h-5 text-violet-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Bandingkan</h3>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
                <Camera className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">19 Jun</span>
                <span className="text-[10px] text-muted">Baseline</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
                <Camera className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">3 Jul</span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded">+8%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="px-6 mb-8">
        <h2 className="font-bold text-slate-900 text-base mb-4">Insight Minggu Ini</h2>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="bg-white border border-border-subtle rounded-2xl p-4 shadow-sm flex items-start gap-3 card-hover"
            >
              <div className={`w-8 h-8 ${insight.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                <insight.icon className={`w-4 h-4 ${insight.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{insight.title}</p>
                <p className="text-xs text-muted mt-0.5">{insight.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
