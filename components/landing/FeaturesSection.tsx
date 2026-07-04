"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CalendarDays, Camera, Sparkles, Bot } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Tracker Harian",
    description: "Catat tidur, makanan, stres, dan kebiasaan lain dalam 30 detik.",
  },
  {
    icon: Camera,
    title: "Progress Foto",
    description: "Upload foto kondisi kulit dan lihat perubahan dari waktu ke waktu.",
  },
  {
    icon: Sparkles,
    title: "Insight AI",
    description: "Lihat korelasi antara kebiasaanmu dan kondisi jerawat secara otomatis.",
  },
  {
    icon: Bot,
    title: "Konsultasi AI",
    description: "Tanya apa saja tentang jerawatmu — berbasis jurnal dermatologi valid.",
  },
];

export default function FeaturesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="features"
      className="py-16 px-5 bg-gradient-to-b from-white via-primary-light/20 to-white lg:py-24"
    >
      <div className="container-narrow">
        <div
          ref={headerRef}
          className={`text-center mb-10 lg:mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Solusi
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Satu Jurnal untuk
            <br className="hidden sm:block" /> Semua Jawaban
          </h2>
          <p className="text-sm lg:text-base text-muted mt-3 max-w-md mx-auto">
            Hubungkan kebiasaan harian, produk skincare, dan AI untuk melihat polamu sendiri.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon: Icon, title, description, delay }: FeatureCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`feature-card bg-white border border-border-subtle rounded-2xl p-4 lg:p-6 card-hover transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="feature-icon w-10 h-10 lg:w-12 lg:h-12 bg-primary-light rounded-xl flex items-center justify-center mb-3">
        <Icon className="text-primary w-5 h-5 lg:w-6 lg:h-6 transition-colors" />
      </div>
      <h3 className="font-bold text-slate-800 text-xs lg:text-sm mb-1">{title}</h3>
      <p className="text-[11px] lg:text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}
