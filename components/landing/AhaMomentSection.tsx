"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Lightbulb } from "lucide-react";

export default function AhaMomentSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-16 px-5 bg-primary relative overflow-hidden lg:py-24">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 lg:w-96 lg:h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-narrow relative text-center">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Lightbulb className="text-white w-8 h-8 lg:w-10 lg:h-10" />
          </div>
          <h2 className="section-title font-extrabold text-white leading-tight mb-4">
            &ldquo;Akhirnya Aku Tahu
            <br className="hidden sm:block" /> Kenapa Jerawatku Balik&rdquo;
          </h2>
          <p className="text-sm lg:text-base text-white/70 leading-relaxed max-w-md mx-auto mb-8 lg:max-w-lg">
            Bukan karena produknya salah. Bukan karena skincare-nya mahal atau murah. Tapi karena
            aku tidak pernah melihat polaku sendiri.
          </p>
          <a
            href="#cta"
            className="btn-press inline-block px-8 py-4 bg-white text-primary font-bold rounded-2xl shadow-xl shadow-black/10 lg:text-lg"
          >
            Temukan Polamu Sekarang
          </a>
        </div>
      </div>
    </section>
  );
}
