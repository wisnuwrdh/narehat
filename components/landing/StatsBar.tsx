"use client";

import { useEffect, useRef, useState } from "react";

export default function StatsBar() {
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
    <section ref={ref} className="py-10 px-5 border-y border-border-subtle bg-slate-50/50 lg:py-14">
      <div className="container-narrow">
        <div className="grid grid-cols-3 gap-4 text-center lg:gap-8">
          <div className={visible ? "reveal visible" : "reveal"}>
            <p className="stat-number text-2xl lg:text-4xl font-extrabold text-primary">2.4K+</p>
            <p className="text-[11px] lg:text-sm text-muted mt-1">User Aktif</p>
          </div>
          <div className={visible ? "reveal visible" : "reveal"} style={{ transitionDelay: "0.1s" }}>
            <p className="stat-number text-2xl lg:text-4xl font-extrabold text-primary">89%</p>
            <p className="text-[11px] lg:text-sm text-muted mt-1">Lebih Paham Pola</p>
          </div>
          <div className={visible ? "reveal visible" : "reveal"} style={{ transitionDelay: "0.2s" }}>
            <p className="stat-number text-2xl lg:text-4xl font-extrabold text-primary">15K+</p>
            <p className="text-[11px] lg:text-sm text-muted mt-1">Entri Jurnal</p>
          </div>
        </div>
      </div>
    </section>
  );
}
