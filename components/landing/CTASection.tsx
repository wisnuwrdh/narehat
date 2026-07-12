"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CTASection() {
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="cta" ref={ref} className="py-20 px-5 bg-primary relative overflow-hidden lg:py-28">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>
      <div className="container-narrow relative text-center">
        <div className={visible ? "reveal visible" : "reveal"}>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Siap Kenali Pemicu<br className="hidden sm:block" /> Jerawatmu?
          </h2>
          <p className="text-sm lg:text-lg text-white/70 leading-relaxed max-w-md mx-auto mb-8 lg:max-w-lg">
            Cukup upload foto atau tanya ke AI. Tidak perlu isi jurnal dulu. Hasil instan, gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <Link
              href="/register"
              className="btn-press w-full py-4 bg-white text-primary font-bold rounded-2xl shadow-xl shadow-black/10 text-base lg:text-lg"
            >
              Analisis Jerawatku Gratis
            </Link>
          </div>
          <p className="text-[11px] lg:text-xs text-white/50 mt-4">Hasil dalam hitungan detik • Tanpa kartu kredit</p>
        </div>
      </div>
    </section>
  );
}
