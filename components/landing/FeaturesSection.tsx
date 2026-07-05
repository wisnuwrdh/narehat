"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: "edit_calendar",
    title: "Tracker Harian",
    desc: "Catat tidur, makanan, stres, dan kebiasaan lain dalam 30 detik.",
  },
  {
    icon: "photo_camera",
    title: "Progress Foto",
    desc: "Upload foto kondisi kulit dan lihat perubahan dari waktu ke waktu.",
  },
  {
    icon: "auto_awesome",
    title: "Insight AI",
    desc: "Lihat korelasi antara kebiasaanmu dan kondisi jerawat secara otomatis.",
  },
  {
    icon: "smart_toy",
    title: "Konsultasi AI",
    desc: "Tanya apa saja tentang jerawatmu — berbasis jurnal dermatologi valid.",
  },
];

export default function FeaturesSection() {
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
    <section id="features" ref={ref} className="py-16 px-5 bg-gradient-to-b from-white via-primary-light/20 to-white lg:py-24">
      <div className="container-narrow">
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Solusi
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Satu Jurnal untuk<br className="hidden sm:block" /> Semua Jawaban
          </h2>
          <p className="text-sm lg:text-base text-muted mt-3 max-w-md mx-auto">
            Hubungkan kebiasaan harian, produk skincare, dan AI untuk melihat polamu sendiri.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature-card card-hover bg-white border border-border-subtle rounded-2xl p-4 lg:p-6 ${visible ? "reveal visible" : "reveal"}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="feature-icon w-10 h-10 lg:w-12 lg:h-12 bg-primary-light rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-primary text-lg lg:text-xl transition-colors group-hover:text-white">{f.icon}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-xs lg:text-sm mb-1">{f.title}</h3>
              <p className="text-[11px] lg:text-xs text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
