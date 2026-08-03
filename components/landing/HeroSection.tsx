"use client";

import Link from "next/link";
import Image from "next/image";

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
                Kenali Pemicu Jerawatmu<br />
                <span className="shimmer-text">dalam Hitungan Detik</span>
              </h1>
              <p className="animate-fade-in-up delay-200 hero-subtitle text-muted mt-4 max-w-sm mx-auto lg:mx-0 leading-relaxed lg:max-w-md">
                Upload foto atau tanya langsung ke AI kami. Kamu bakal tahu pemicu jerawatmu, purging atau breakout, dan rutinitas yang beneran cocok, semua di 1 app.
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

          {/* Right: App Preview — real dashboard screenshot */}
          <div className="animate-scale-in delay-400 relative max-w-[320px] md:max-w-[380px] lg:max-w-[340px] mx-auto mt-10 lg:mt-0">
            <div className="relative bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl shadow-slate-900/20">
              <div className="bg-slate-950 rounded-[2rem] overflow-hidden">
                <Image
                  src="/screens/dashboard.webp"
                  alt="Tampilan dashboard Narehat: skin score, insight harian, dan tracker"
                  width={700}
                  height={1595}
                  priority
                  unoptimized
                  className="w-full h-auto"
                />
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
