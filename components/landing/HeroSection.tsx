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
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs font-bold text-primary">Beta — Daftar Sekarang</span>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="animate-fade-in-up delay-100 hero-title font-extrabold text-slate-900 tracking-tight">
                Pahami <span className="shimmer-text">Pemicu</span><br />
                Jerawatmu
              </h1>
              <p className="animate-fade-in-up delay-200 hero-subtitle text-muted mt-4 max-w-sm mx-auto lg:mx-0 leading-relaxed lg:max-w-md">
                Catat kebiasaan harian, lacak progres kulit, dan temukan pola yang sebenarnya memicu jerawatmu — bukan sekadar tebak-tebakan produk.
              </p>
            </div>

            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-3 max-w-xs mx-auto lg:mx-0 mb-10 lg:mb-0">
              <Link
                href="/register"
                className="btn-press w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl text-center shadow-xl shadow-primary/25 text-base whitespace-nowrap"
              >
                Mulai Jurnal Gratis
              </Link>
              <Link
                href="#how-it-works"
                className="btn-press w-full sm:w-auto px-8 py-4 bg-white border border-border-light rounded-2xl font-semibold text-sm text-slate-700 text-center hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Lihat Cara Kerjanya
              </Link>
            </div>
          </div>

          {/* Right: App Preview */}
          <div className="animate-scale-in delay-400 relative max-w-[320px] md:max-w-[380px] lg:max-w-[340px] mx-auto mt-10 lg:mt-0">
            <div className="relative bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl shadow-slate-900/20">
              <div className="bg-white rounded-[2rem] overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-muted font-medium">Selamat pagi,</p>
                      <p className="text-sm font-bold text-slate-900">Rina 👋</p>
                    </div>
                    <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">notifications</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50/80 to-violet-50/40 rounded-2xl border border-indigo-100/80 p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted font-medium mb-1">Skor Kulit Hari Ini</p>
                        <p className="text-2xl font-extrabold text-primary">78<span className="text-sm font-semibold text-muted">/100</span></p>
                      </div>
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#e9e7ff" strokeWidth="10" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#3525cd" strokeWidth="10" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="58" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-lg">sentiment_satisfied</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-border-subtle rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-amber-500 text-sm">lightbulb</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 mb-0.5">Insight Hari Ini</p>
                        <p className="text-[11px] text-muted leading-relaxed">3 hari tidur &lt; 6 jam = munculnya jerawat baru di pipi. Coba tidur lebih awal malam ini! 💤</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-white/90 border-t border-border-subtle mt-2">
                  <div className="flex flex-col items-center gap-0.5 text-primary py-1.5 px-3">
                    <span className="material-symbols-outlined text-lg">home</span>
                    <span className="text-[9px] font-bold">Beranda</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-muted py-1.5 px-3">
                    <span className="material-symbols-outlined text-lg">edit_calendar</span>
                    <span className="text-[9px] font-medium">Tracker</span>
                  </div>
                  <div className="relative -top-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/25">
                      <span className="material-symbols-outlined text-xl">add</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-muted py-1.5 px-3">
                    <span className="material-symbols-outlined text-lg">trending_up</span>
                    <span className="text-[9px] font-medium">Progress</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-muted py-1.5 px-3">
                    <span className="material-symbols-outlined text-lg">person</span>
                    <span className="text-[9px] font-medium">Akun</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg shadow-primary/10 p-3 animate-float">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-success text-sm">trending_up</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted">Progres Minggu Ini</p>
                  <p className="text-xs font-bold text-slate-900">+12% lebih baik</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-2 -left-6 bg-white rounded-2xl shadow-lg shadow-primary/10 p-3 animate-float" style={{ animationDelay: "-2s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted">AI Terdeteksi</p>
                  <p className="text-xs font-bold text-slate-900">2 jerawat aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
