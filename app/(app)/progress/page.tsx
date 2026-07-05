"use client";

import Link from "next/link";

const correlationItems = [
  { label: "Tidur cukup", points: "+12 poin", color: "emerald", pct: 85 },
  { label: "Minum air cukup", points: "+8 poin", color: "emerald", pct: 65 },
  { label: "Stress rendah", points: "+6 poin", color: "emerald", pct: 50 },
  { label: "Begadang", points: "-10 poin", color: "red", pct: 70 },
];

const photoTimeline = [
  { label: "Hari ini", date: "3 Jul", active: true },
  { label: "Kemarin", date: "2 Jul" },
  { label: "1 Minggu lalu", date: "26 Jun" },
  { label: "2 Minggu lalu", date: "19 Jun" },
];

const insights = [
  { icon: "trending_up", color: "emerald", title: "Skin score naik 8%", desc: "Konsistensi skincare 2x sehari berkontribusi besar" },
  { icon: "warning", color: "amber", title: "Tidur kurang berkorelasi", desc: "3 hari tidur <6 jam = muncul jerawat baru" },
  { icon: "water_drop", color: "blue", title: "Hidrasi membaik", desc: "Rata-rata minum air naik dari 1.2L ke 1.8L" },
];

export default function ProgressPage() {
  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Perkembangan</h1>
          <p className="text-sm text-muted">Lihat perubahan kulitmu dari waktu ke waktu</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border-light">
          <span className="material-symbols-outlined text-lg text-primary">calendar_month</span>
          <span className="text-sm font-semibold text-slate-700">30 hari</span>
        </div>
      </header>

      <section className="px-6 mb-6">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-border-subtle">
          {["7 hari", "30 hari", "90 hari"].map((r, i) => (
            <button key={r} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${i === 1 ? "text-primary bg-white shadow-sm" : "text-muted hover:bg-white hover:shadow-sm"}`}>
              {r}
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
                <p className="text-[10px] text-muted">Rata-rata: 68/100</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg">↑ +8%</span>
          </div>
          <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-border-subtle">
            <span className="text-xs text-muted-light">Chart akan muncul setelah ada data</span>
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
            {correlationItems.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{c.label}</span>
                  <span className={`font-bold ${c.color === "red" ? "text-red-500" : "text-emerald-600"}`}>{c.points}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.color === "red" ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-base">Timeline Foto</h2>
          <button className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors">Lihat semua</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {photoTimeline.map((p) => (
            <div key={p.date} className={`min-w-[140px] snap-start border rounded-2xl p-2.5 relative card-hover shadow-sm ${p.active ? "bg-gradient-to-b from-primary-light/60 to-white border-primary/10" : "bg-white border-border-subtle"}`}>
              <div className="mb-2 px-1 flex justify-between items-center">
                <div>
                  <span className={`text-[10px] block font-bold ${p.active ? "text-primary" : "text-slate-500"}`}>{p.label}</span>
                  <span className="text-[10px] text-muted-light">{p.date}</span>
                </div>
                {p.active && <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">Now</span>}
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
              { label: "19 Jun", badge: "Baseline" },
              { label: "3 Jul", badge: "+8%", badgeColor: "bg-emerald-50 text-emerald-600" },
            ].map((side, i) => (
              <div key={i} className="flex-1">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
                  <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">{side.label}</span>
                  <span className={`text-[10px] font-bold rounded ${side.badgeColor || "text-muted"}`}>{side.badge}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-8">
        <h2 className="font-bold text-slate-900 text-base mb-4">Insight Minggu Ini</h2>
        <div className="space-y-3">
          {insights.map((ins) => (
            <div key={ins.title} className="bg-white border border-border-subtle rounded-2xl p-4 shadow-sm flex items-start gap-3 card-hover">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ins.color === "emerald" ? "bg-emerald-50" : ins.color === "amber" ? "bg-amber-50" : "bg-blue-50"}`}>
                <span className={`material-symbols-outlined text-sm ${ins.color === "emerald" ? "text-emerald-500" : ins.color === "amber" ? "text-amber-500" : "text-blue-500"}`}>{ins.icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{ins.title}</p>
                <p className="text-xs text-muted mt-0.5">{ins.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
