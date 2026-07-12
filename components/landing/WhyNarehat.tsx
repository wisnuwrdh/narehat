"use client";

import { useEffect, useRef, useState } from "react";

const comparisons = [
  {
    icon: "smart_toy",
    title: "AI berbasis jurnal, bukan opini",
    desc: "Setiap jawaban AI kami grounded di jurnal dermatologi peer-reviewed: PubMed, AAD, British Journal of Dermatology. Bukan opini influencer atau tebak-tebakan.",
    vs: "Kebanyakan konten skincare cuma general advice yang belum tentu cocok buat kamu.",
  },
  {
    icon: "person_search",
    title: "Analisis personal, bukan template",
    desc: "AI kami analisis kulitmu, rutinitasmu, dan produkmu secara spesifik. Hasilnya berbeda untuk setiap orang, karena kulitmu unik.",
    vs: "Google dan TikTok kasih jawaban yang sama buat semua orang, tanpa tahu kondisi kulitmu.",
  },
  {
    icon: "bolt",
    title: "Instan, tanpa nunggu dokter",
    desc: "Purging atau breakout? Produkmu konflik ingredients? Dapatkan jawaban dalam hitungan detik, 24/7, tanpa appointment.",
    vs: "Konsultasi dokter: Rp150-350rb, nunggu antrian, dan sering cuma 5-10 menit.",
  },
];

export default function WhyNarehat() {
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
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Mengapa Narehat
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Beda dari Cara Lama
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {comparisons.map((item, i) => (
            <div
              key={i}
              className={`bg-white border border-border-subtle rounded-2xl p-5 lg:p-7 ${visible ? "reveal visible" : "reveal"}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary-light rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-xl lg:text-2xl">{item.icon}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-2">{item.title}</h3>
              <p className="text-xs lg:text-sm text-muted leading-relaxed mb-3">{item.desc}</p>
              <div className="border-t border-border-subtle pt-3 mt-auto">
                <span className="text-[10px] lg:text-xs text-muted-light italic flex items-start gap-1">
                  <span className="material-symbols-outlined text-[14px] text-muted-light shrink-0 mt-0.5">block</span>
                  {item.vs}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
