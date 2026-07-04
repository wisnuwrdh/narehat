"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CheckCircle, Savings } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Untuk memulai perjalananmu",
    price: "Rp0",
    period: "selamanya",
    features: [
      "Tracker kebiasaan harian",
      "Progress foto & perbandingan",
      "Insight dasar",
      "Rekomendasi produk",
    ],
    cta: "Mulai Gratis",
    ctaStyle: "secondary" as const,
    popular: false,
  },
  {
    name: "Premium",
    description: "Bulanan, batalkan kapan saja",
    price: "Rp19.000",
    period: "/bulan",
    features: [
      "Semua fitur Free",
      "Deteksi jerawat AI",
      "Konsultasi AI (RAG)",
      "Insight & grafik mendalam",
      "Tema UI custom",
    ],
    cta: "Upgrade ke Premium",
    ctaStyle: "primary" as const,
    popular: true,
  },
  {
    name: "Premium Tahunan",
    description: "Hemat ~35%",
    price: "Rp149.000",
    period: "/tahun",
    badge: {
      icon: Savings,
      text: "Hemat Rp79.000 dibanding bulanan",
    },
    features: ["Semua fitur Premium Bulanan", "Akses fitur baru lebih awal"],
    cta: "Pilih Tahunan",
    ctaStyle: "secondary" as const,
    popular: false,
  },
];

export default function PricingSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="pricing" className="py-16 px-5 bg-slate-50/50 lg:py-24">
      <div className="container-narrow">
        <div
          ref={headerRef}
          className={`text-center mb-10 lg:mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Harga
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Pilih Plan yang Cocok
          </h2>
          <p className="text-sm lg:text-base text-muted mt-3">Mulai gratis. Upgrade kapan saja.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-start">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  period: string;
  badge?: {
    icon: React.ElementType;
    text: string;
  };
  features: string[];
  cta: string;
  ctaStyle: "primary" | "secondary";
  popular: boolean;
  delay: number;
}

function PricingCard({
  name,
  description,
  price,
  period,
  badge,
  features,
  cta,
  ctaStyle,
  popular,
  delay,
}: PricingCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`pricing-card ${
        popular ? "popular" : ""
      } bg-white border border-border-subtle rounded-2xl p-6 lg:p-8 relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg shadow-primary/20">
            PALING POPULER
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base lg:text-lg">{name}</h3>
          <p className="text-xs lg:text-sm text-muted">{description}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl lg:text-3xl font-extrabold ${popular ? "text-primary" : "text-slate-900"}`}>
            {price}
          </p>
          <p className="text-[10px] lg:text-xs text-muted">{period}</p>
        </div>
      </div>

      {badge && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-success-light/50 rounded-xl">
          <badge.icon className="text-success w-4 h-4" />
          <span className="text-xs text-success font-semibold">{badge.text}</span>
        </div>
      )}

      <ul className="space-y-2.5 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-xs lg:text-sm text-slate-600">
            <CheckCircle
              className={`w-4 h-4 ${popular ? "text-primary" : "text-success"} shrink-0`}
            />
            <span className={i === 0 && popular ? "font-semibold" : ""}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`btn-press w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
          ctaStyle === "primary"
            ? "bg-primary text-white shadow-xl shadow-primary/25"
            : "bg-white border-2 border-border-light text-slate-700 hover:border-primary/30 hover:text-primary"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}
