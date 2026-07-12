"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: "person_check",
    tag: null,
    title: "Skin Type Quiz",
    desc: "Tipe kulitmu, ingredients yang cocok, dan yang harus dihindari, langsung tahu di menit pertama.",
  },
  {
    icon: "question_exchange",
    tag: "Free 1x",
    title: "Purging Checker",
    desc: "\"Ini purging atau breakout?\" AI analisis produk barumu dan kasih jawaban dalam hitungan detik.",
  },
  {
    icon: "auto_awesome",
    tag: "PRO",
    title: "AI Deteksi Jerawat",
    desc: "Upload foto → AI identifikasi jenis jerawat, severity, dan estimasi pemicu. Akurat, instan.",
  },
  {
    icon: "smart_toy",
    tag: "Free 3x",
    title: "Konsultasi AI",
    desc: "Tanya apa saja tentang jerawat, jawaban berbasis jurnal dermatologi peer-reviewed, bukan asal-asalan.",
  },
  {
    icon: "photo_camera",
    tag: null,
    title: "Progress Foto",
    desc: "Foto mingguan, timeline visual, side-by-side comparison. Lihat perubahan kulitmu dari waktu ke waktu.",
  },
  {
    icon: "edit_calendar",
    tag: null,
    title: "Tracker Ringan",
    desc: "Tidur, air, stress, foto: 30 detik isi. Untuk yang ingin insight lebih dalam.",
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
            Fitur
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Tidak Perlu Nebak Lagi
          </h2>
          <p className="text-sm lg:text-base text-muted mt-3 max-w-md mx-auto">
            Mulai dari deteksi instan sampai insight jangka panjang, semua dalam 1 app.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature-card card-hover bg-white border border-border-subtle rounded-2xl p-4 lg:p-6 relative ${visible ? "reveal visible" : "reveal"}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              {f.tag && (
                <span className="absolute top-3 right-3 px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md leading-none">
                  {f.tag}
                </span>
              )}
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
