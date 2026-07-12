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
            <div className="animate-fade-in-up flex justify-center lg:justify-start mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light/60 border border-primary/10 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-primary">Analisis Jerawat Pertamamu Gratis</span>
              </div>
            </div>

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
                Analisis Jerawatku Gratis
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

                {/* Onboarding quiz — Step 1 */}
                <div className="px-5 pt-3 pb-4">
                  {/* Progress bar */}
                  <div className="flex gap-1.5 mb-5">
                    <div className="h-1.5 flex-1 bg-primary rounded-full" />
                    <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
                    <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
                    <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
                    <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
                  </div>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Step 1/5</p>
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">Tipe kulit kamu apa?</h3>
                  <p className="text-[10px] text-muted mb-4">Ini membantu kami memberikan insight yang lebih akurat.</p>

                  {/* Options */}
                  <div className="space-y-2">
                    {[
                      { emoji: "🌿", label: "Berminyak", desc: "Wajah sering mengkilap", active: false },
                      { emoji: "🌀", label: "Kombinasi", desc: "Berminyak di T-zone", active: true },
                      { emoji: "💧", label: "Kering", desc: "Kulit terasa kencang", active: false },
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                          opt.active
                            ? "bg-primary-light/30 border-primary"
                            : "bg-slate-50 border-border-light"
                        }`}
                      >
                        <span className="text-sm">{opt.emoji}</span>
                        <div className="flex-1">
                          <span className={`text-[11px] font-semibold ${opt.active ? "text-primary" : "text-slate-700"}`}>
                            {opt.label}
                          </span>
                          <span className="text-[9px] text-muted block">{opt.desc}</span>
                        </div>
                        {opt.active && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                      </div>
                    ))}
                  </div>

                  {/* Next button */}
                  <div className="mt-4 w-full py-2.5 bg-primary text-white text-[11px] font-bold rounded-xl text-center">
                    Lanjut
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
