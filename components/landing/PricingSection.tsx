"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const plans = [
  {
    name: "Free",
    subtitle: "Kenali kulitmu, mulai dari sini",
    price: "Rp0",
    period: "selamanya",
    features: [
      "Skin type quiz + profil personal",
      "Tracker ringan (tidur, air, stress, foto)",
      "Progress foto mingguan",
      "Rekomendasi produk",
      "AI Consult: 3x (lifetime)",
      "Purging Checker: 1x (lifetime)",
    ],
    cta: "Mulai Gratis",
    href: "/register",
    featured: false,
  },
  {
    name: "Premium",
    subtitle: "AI sepuasnya, kapan saja",
    price: "Rp19.000",
    period: "/bulan",
    features: [
      "Semua fitur Free (unlimited)",
      "AI Consult UNLIMITED",
      "AI Deteksi jerawat dari foto",
      "Progress foto unlimited (harian)",
      "Deep insight & grafik korelasi",
    ],
    cta: "Upgrade Premium",
    href: "/register?plan=premium_monthly",
    featured: true,
    badge: "PALING POPULER",
  },
  {
    name: "Pro",
    subtitle: "AI urus semuanya untukmu",
    price: "Rp49.000",
    period: "/bulan",
    features: [
      "Semua fitur Premium",
      "AI Analisis rutinitas skincare",
      "Personalized routine builder",
      "Purging checker UNLIMITED",
      "Weekly skin report + export PDF",
      "Akses fitur baru lebih awal",
    ],
    cta: "Coba Pro",
    href: "/register?plan=pro_monthly",
    featured: true,
    badge: "FITUR LENGKAP",
  },
];

export default function PricingSection() {
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
    <section id="pricing" ref={ref} className="py-16 px-5 bg-slate-50/50 lg:py-24">
      <div className="container-narrow">
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Harga
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Pilih yang Cocok Buat Kamu
          </h2>
          <p className="text-sm lg:text-base text-muted mt-3">Mulai gratis. Upgrade kapan saja. Gak perlu kartu kredit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-start">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 lg:p-8 pricing-card transition-all duration-300 hover:-translate-y-1.5 ${
                plan.featured
                  ? i === 2
                    ? "bg-white border-2 border-primary shadow-xl shadow-primary/10"
                    : "bg-white border-2 border-primary shadow-xl shadow-primary/10 md:scale-105"
                  : "bg-white border border-border-subtle shadow-sm"
              } ${visible ? "reveal visible" : "reveal"}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 text-white text-[10px] font-bold rounded-full shadow-lg ${
                    i === 2 ? "bg-slate-800 shadow-slate-800/20" : "bg-primary shadow-primary/20"
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4 mt-1">
                <div>
                  <h3 className="font-bold text-slate-800 text-base lg:text-lg flex items-center gap-2">
                    {plan.name}
                    {i === 2 && <span className="text-lg">👑</span>}
                  </h3>
                  <p className="text-xs lg:text-sm text-muted">{plan.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl lg:text-3xl font-extrabold ${plan.featured ? "text-primary" : "text-slate-900"}`}>
                    {plan.price}
                  </p>
                  <p className="text-[10px] lg:text-xs text-muted">{plan.period}</p>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs lg:text-sm text-slate-600">
                    <span className={`material-symbols-outlined text-sm ${plan.featured ? "text-primary" : "text-success"}`}>
                      check_circle
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`btn-press block text-center w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  plan.featured
                    ? i === 2
                      ? "bg-slate-800 text-white shadow-xl shadow-slate-800/25"
                      : "bg-primary text-white shadow-xl shadow-primary/25"
                    : "bg-white border-2 border-border-light text-slate-700 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
