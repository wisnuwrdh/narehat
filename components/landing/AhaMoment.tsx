"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AhaMoment() {
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
    <section ref={ref} className="py-16 px-5 bg-primary relative overflow-hidden lg:py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 lg:w-96 lg:h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="container-narrow relative text-center">
        <div className={visible ? "reveal visible" : "reveal"}>
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="material-symbols-outlined text-white text-3xl lg:text-4xl">emoji_objects</span>
          </div>
          <h2 className="section-title font-extrabold text-white leading-tight mb-4">
            &quot;Akhirnya Aku Tahu<br className="hidden sm:block" /> Kenapa Jerawatku Balik&quot;
          </h2>
          <p className="text-sm lg:text-base text-white/70 leading-relaxed max-w-md mx-auto mb-8 lg:max-w-lg">
            Bukan karena produknya salah. Bukan karena skincare-nya mahal atau murah. Tapi karena selama ini kamu tidak punya tools untuk membaca polamu sendiri.
          </p>
          <Link
            href="/register"
            className="btn-press inline-block px-8 py-4 bg-white text-primary font-bold rounded-2xl shadow-xl shadow-black/10 lg:text-lg"
          >
            Temukan Polamu Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
}
