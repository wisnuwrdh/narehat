"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    initial: "R",
    color: "from-pink-100 to-purple-100 text-pink-500",
    name: "Rina, 22",
    skin: "Kulit kombinasi",
    text: '"Baru sadar jerawatku muncul tiap kali deadline tugas. Narehat nunjukin korelasi stres sama jerawatku secara jelas."',
  },
  {
    initial: "A",
    color: "from-blue-100 to-cyan-100 text-blue-500",
    name: "Andi, 24",
    skin: "Kulit berminyak",
    text: '"Udah coba 10+ produk tapi gak ada yang ngefek. Ternyata masalahnya bukan produk, tapi pola tidurku yang berantakan."',
  },
  {
    initial: "D",
    color: "from-green-100 to-emerald-100 text-green-500",
    name: "Dewi, 20",
    skin: "Kulit sensitif",
    text: '"Fitur AI-nya ngebantu banget! Bisa tanya apa aja tentang jerawat dan jawabannya berbasis jurnal, bukan asal-asalan."',
  },
];

export default function Testimonials() {
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
        <div className="text-center mb-8 lg:mb-12">
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Testimoni
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Yang Mereka Rasakan
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-2 no-scrollbar lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`shrink-0 w-[280px] md:w-[320px] lg:w-auto snap-start bg-white border border-border-subtle rounded-2xl p-5 lg:p-6 shadow-sm ${visible ? "reveal visible" : "reveal"}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-sm font-bold`}>
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-[10px] text-muted">{t.skin}</p>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">{t.text}</p>
              <div className="flex gap-1 mt-3">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-amber-400 text-sm">star</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
