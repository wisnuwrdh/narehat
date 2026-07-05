"use client";

import { useEffect, useRef, useState } from "react";

const problems = [
  {
    icon: "help_outline",
    color: "red",
    title: "Tidak tahu pemicu personal",
    desc: "Setiap orang punya pemicu berbeda — tidur, makanan, stres, atau produk. Tapi kamu tidak pernah mencatatnya.",
  },
  {
    icon: "payments",
    color: "orange",
    title: "Buang uang trial & error",
    desc: "Sudah coba puluhan produk tapi tidak pernah tahu mana yang benar-benar cocok untuk kulitmu.",
  },
  {
    icon: "search_off",
    color: "purple",
    title: "Informasi terlalu overwhelming",
    desc: "TikTok bilang A, Instagram bilang B. Kamu butuh insight yang personal, bukan general.",
  },
];

const colorMap: Record<string, string> = {
  red: "bg-red-50 text-red-400",
  orange: "bg-orange-50 text-orange-400",
  purple: "bg-purple-50 text-purple-400",
};

export default function ProblemSection() {
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
    <section ref={ref} className="py-16 px-5 lg:py-24">
      <div className="container-narrow">
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Problem
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Jerawatmu Balik Terus?<br className="hidden sm:block" /> Ini Kenapa
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {problems.map((p, i) => (
            <div
              key={i}
              className={`card-hover bg-white border border-border-subtle rounded-2xl p-5 lg:p-7 flex items-start gap-4 ${visible ? "reveal visible" : "reveal"}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={`w-11 h-11 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center shrink-0 ${colorMap[p.color]}`}>
                <span className="material-symbols-outlined lg:text-2xl">{p.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">{p.title}</h3>
                <p className="text-xs lg:text-sm text-muted leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
