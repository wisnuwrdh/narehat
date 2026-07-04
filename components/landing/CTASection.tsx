"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="cta" className="py-20 px-5 bg-primary relative overflow-hidden lg:py-28">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container-narrow relative text-center">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Siap Pahami
            <br className="hidden sm:block" /> Jerawatmu?
          </h2>
          <p className="text-sm lg:text-lg text-white/70 leading-relaxed max-w-md mx-auto mb-8 lg:max-w-lg">
            Daftar gratis hari ini dan mulai jurnal pertamamu. Tidak perlu kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <button className="btn-press w-full py-4 bg-white text-primary font-bold rounded-2xl shadow-xl shadow-black/10 text-base lg:text-lg">
              Buat Jurnal Gratis
            </button>
          </div>
          <p className="text-[11px] lg:text-xs text-white/50 mt-4">Butuh waktu kurang dari 1 menit</p>
        </div>
      </div>
    </section>
  );
}
