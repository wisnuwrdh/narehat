"use client";

import { useEffect, useRef, useState } from "react";

export default function HowItWorks() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="py-16 px-5 lg:py-24">
      <div className="container-narrow">
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Cara Kerja
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Dari Bingung ke &quot;Oh Ini Toh&quot;
          </h2>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 md:gap-6">
          {/* Step 1 */}
          <div className={`step-item relative flex gap-4 pb-8 md:flex-col md:text-center md:pb-0 ${visible ? "reveal visible" : "reveal"}`}>
            <div className="hidden md:block absolute left-1/2 top-12 w-px h-8 bg-gradient-to-b from-primary to-primary-light" />
            <div className="relative z-10 w-12 h-12 lg:w-14 lg:h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20 md:mx-auto md:mb-4">
              1
            </div>
            <div className="pt-1 lg:pt-2">
              <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">Kenali tipe kulitmu</h3>
              <p className="text-xs lg:text-sm text-muted leading-relaxed">
                Quiz 1 menit: tipe kulit, kebiasaan, produk yang dipakai. Langsung dapat insight personal, ingredients yang cocok &amp; yang harus dihindari.
              </p>
              <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-border-subtle inline-block">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌀</span>
                  <span className="text-[11px] font-semibold text-primary">Kombinasi</span>
                  <span className="text-[10px] text-muted-light">• terdeteksi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`step-item relative flex gap-4 pb-8 md:flex-col md:text-center md:pb-0 ${visible ? "reveal visible" : "reveal"}`} style={{ transitionDelay: "0.1s" }}>
            <div className="hidden md:block absolute left-1/2 top-12 w-px h-8 bg-gradient-to-b from-primary to-primary-light" />
            <div className="relative z-10 w-12 h-12 lg:w-14 lg:h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20 md:mx-auto md:mb-4">
              2
            </div>
            <div className="pt-1 lg:pt-2">
              <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">AI analisis kulitmu</h3>
              <p className="text-xs lg:text-sm text-muted leading-relaxed">
                Upload foto jerawat atau kirim pertanyaan. AI deteksi jenis jerawat, cek purging vs breakout, dan analisis rutinitas skincare-mu, instan.
              </p>
              <div className="mt-3 flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-border-subtle">
                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                <span className="text-[11px] text-slate-700">Papules, Pipi Kiri</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`step-item relative flex gap-4 md:flex-col md:text-center ${visible ? "reveal visible" : "reveal"}`} style={{ transitionDelay: "0.2s" }}>
            <div className="relative z-10 w-12 h-12 lg:w-14 lg:h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20 md:mx-auto md:mb-4">
              3
            </div>
            <div className="pt-1 lg:pt-2">
              <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">Dapatkan insight + rutinitas</h3>
              <p className="text-xs lg:text-sm text-muted leading-relaxed">
                AI bangun rutinitas yang beneran cocok buat kulitmu, lengkap dengan produk rekomendasi. Laporan mingguan biar kamu tahu progresmu.
              </p>
              <div className="mt-3 bg-gradient-to-r from-primary-light/60 to-white rounded-xl p-3 border border-primary/10 inline-block max-w-sm">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">verified</span>
                  <p className="text-[11px] lg:text-xs text-slate-700 leading-relaxed">
                    <strong>Rutinitas kamu:</strong> Cleanser → Niacinamide → Moisturizer → Sunscreen. Aman untuk kulit kombinasi. ✅
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
