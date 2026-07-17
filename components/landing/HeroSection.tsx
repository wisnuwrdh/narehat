"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 px-5 overflow-hidden gradient-mesh lg:pt-36 lg:pb-24">
      <div className="absolute top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-blob lg:w-96 lg:h-96" />
      <div className="absolute -bottom-10 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: "-4s" }} />

      <div className="container-narrow relative">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <h1 className="animate-fade-in-up delay-100 hero-title font-extrabold text-slate-900 tracking-tight">
                Jerawatmu Ada<br />
                <span className="shimmer-text">Polanya</span>. Kami Temukan.
              </h1>
              <p className="animate-fade-in-up delay-200 hero-subtitle text-muted mt-4 max-w-sm mx-auto lg:mx-0 leading-relaxed lg:max-w-md">
                Upload foto atau tanya langsung, AI kami analisis pemicu jerawatmu, deteksi purging vs breakout, dan bangun rutinitas yang beneran cocok. Semua dalam 1 app.
              </p>
            </div>

            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-3 max-w-xs mx-auto lg:mx-0 mb-10 lg:mb-0">
              <Link
                href="/register"
                className="btn-press w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl text-center shadow-xl shadow-primary/25 text-base whitespace-nowrap"
              >
                Coba Gratis
              </Link>
              <Link
                href="#how-it-works"
                className="btn-press w-full sm:w-auto px-8 py-4 bg-white border border-border-light rounded-2xl font-semibold text-sm text-slate-700 text-center hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Lihat Cara Kerjanya
              </Link>
            </div>
          </div>

          {/* Right: App Preview — 1:1 onboarding quiz */}
          <div className="animate-scale-in delay-400 relative max-w-[320px] md:max-w-[380px] lg:max-w-[340px] mx-auto mt-10 lg:mt-0">
            <div className="relative bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl shadow-slate-900/20">
              <div className="bg-white rounded-[2rem] overflow-hidden">
                {/* Status bar area */}
                <div className="bg-white pt-6 pb-2">
                  <div className="flex items-center justify-between px-5">
                    <span className="text-[10px] font-bold text-slate-900">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                      <div className="w-4 h-4 rounded-full bg-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Dashboard */}
                <div className="px-5 pt-3 pb-3">
                  {/* Greeting + streak */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-muted">Kamis, 15 Mei 2025</p>
                      <h3 className="text-sm font-extrabold text-slate-900">Halo, User! 👋</h3>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full">
                      <span className="text-[10px]">🔥</span>
                      <span className="text-[10px] font-bold text-amber-600">3 hari</span>
                    </div>
                  </div>

                  {/* Skin Score */}
                  <div className="flex items-center gap-4 mb-3 p-3 bg-gradient-to-br from-primary-light/20 to-white rounded-2xl border border-primary/10">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#3525cd" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray="150.8" strokeDashoffset="39" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-900">74</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted font-medium">Skin Score</p>
                      <p className="text-xs font-bold text-primary">Cukup Baik</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] text-emerald-500 font-bold">+3</span>
                        <span className="text-[9px] text-muted">dari kemarin</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[
                      { icon: "edit_calendar", label: "Tracker", color: "bg-indigo-50 text-indigo-500" },
                      { icon: "trending_up", label: "Progress", color: "bg-blue-50 text-blue-500" },
                      { icon: "smart_toy", label: "AI Cons", color: "bg-amber-50 text-amber-500" },
                      { icon: "photo_camera", label: "Deteksi", color: "bg-violet-50 text-violet-500" },
                    ].map((a) => (
                      <div key={a.label} className="flex flex-col items-center gap-1">
                        <div className={`w-9 h-9 ${a.color} rounded-xl flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-sm">{a.icon}</span>
                        </div>
                        <span className="text-[8px] font-semibold text-slate-600">{a.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Insight card */}
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-border-light">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0">lightbulb</span>
                    <div>
                      <p className="text-[9px] font-bold text-slate-800 mb-0.5">Insight Hari Ini</p>
                      <p className="text-[8px] text-muted leading-relaxed">Jerawat muncul setelah gorengan & begadang. Coba kurangi minyak & tidur lebih awal.</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Nav — from real app layout */}
                <div className="flex items-center justify-between px-3 py-2 bg-white/95 border-t border-border-subtle">
                  {[
                    { icon: "home", label: "Beranda" },
                    { icon: "edit_calendar", label: "Tracker" },
                    { icon: "trending_up", label: "Progress" },
                    { icon: "smart_toy", label: "AI", pro: true },
                    { icon: "person", label: "Akun" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 py-1 px-2 relative">
                      <span className={`material-symbols-outlined text-lg ${i === 0 ? "text-primary" : "text-muted"}`}>
                        {item.icon}
                      </span>
                      <span className={`text-[8px] ${i === 0 ? "font-bold text-primary" : "font-medium text-muted"}`}>
                        {item.label}
                      </span>
                      {item.pro && (
                        <span className="absolute -top-1 -right-0 px-1 py-0.5 bg-primary text-white text-[6px] font-bold rounded leading-none">
                          PRO
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center pb-1.5">
                  <div className="w-20 h-1 bg-slate-300 rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating card — AI detection preview */}
            <div className="absolute -top-3 -right-4 bg-white rounded-2xl shadow-lg shadow-primary/15 p-3 animate-float">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted">AI Deteksi</p>
                  <p className="text-xs font-bold text-slate-900">Papules, Pipi Kiri</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-2 -left-6 bg-white rounded-2xl shadow-lg shadow-primary/15 p-3 animate-float" style={{ animationDelay: "-2s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-success text-sm">psychology</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted">Purging Checker</p>
                  <p className="text-xs font-bold text-slate-900">Kemungkinan Purging</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
