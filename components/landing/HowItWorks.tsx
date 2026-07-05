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
            Cukup 3 Langkah
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
              <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">Catat kebiasaan harianmu</h3>
              <p className="text-xs lg:text-sm text-muted leading-relaxed">
                Input tidur, makanan, stres level, olahraga, dan produk skincare yang dipakai hari itu. Cuma 30 detik.
              </p>
              <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-border-subtle inline-block">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-muted text-sm">schedule</span>
                  <span className="text-[11px] text-muted">Tidur: 5 jam</span>
                  <span className="text-[11px] text-warning">● Stres: Tinggi</span>
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
              <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">Upload foto progress</h3>
              <p className="text-xs lg:text-sm text-muted leading-relaxed">
                Ambil foto kondisi kulitmu setiap hari. AI akan menganalisis dan melacak perubahan secara otomatis.
              </p>
              <div className="mt-3 flex gap-2 md:justify-center">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-100 rounded-xl border border-border-subtle flex items-center justify-center">
                  <span className="material-symbols-outlined text-muted-light text-lg">image</span>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-100 rounded-xl border border-border-subtle flex items-center justify-center">
                  <span className="material-symbols-outlined text-muted-light text-lg">image</span>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary-light rounded-xl border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">add</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`step-item relative flex gap-4 md:flex-col md:text-center ${visible ? "reveal visible" : "reveal"}`} style={{ transitionDelay: "0.2s" }}>
            <div className="relative z-10 w-12 h-12 lg:w-14 lg:h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20 md:mx-auto md:mb-4">
              3
            </div>
            <div className="pt-1 lg:pt-2">
              <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">Dapatkan insight personal</h3>
              <p className="text-xs lg:text-sm text-muted leading-relaxed">
                Lihat korelasi yang hanya berlaku untukmu. &quot;Jerawatmu sering muncul setelah begadang dan makan gorengan.&quot;
              </p>
              <div className="mt-3 bg-gradient-to-r from-primary-light/60 to-white rounded-xl p-3 border border-primary/10 inline-block max-w-sm">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                  <p className="text-[11px] lg:text-xs text-slate-700 leading-relaxed">
                    <strong>Insight:</strong> 3 hari terakhir tidur &lt; 6 jam = muncul jerawat baru di pipi. Coba tidur lebih awal! 💤
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
