"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Clock, Image, Lightbulb } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Catat kebiasaan harianmu",
    description:
      "Input tidur, makanan, stres level, olahraga, dan produk skincare yang dipakai hari itu. Cuma 30 detik.",
    preview: (
      <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-border-subtle inline-block">
        <div className="flex items-center gap-3">
          <Clock className="text-muted w-4 h-4" />
          <span className="text-[11px] text-muted">Tidur: 5 jam</span>
          <span className="text-[11px] text-warning">● Stres: Tinggi</span>
        </div>
      </div>
    ),
  },
  {
    number: "2",
    title: "Upload foto progress",
    description:
      "Ambil foto kondisi kulitmu setiap hari. AI akan menganalisis dan melacak perubahan secara otomatis.",
    preview: (
      <div className="mt-3 flex gap-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-100 rounded-xl border border-border-subtle flex items-center justify-center"
          >
            <Image className="text-muted-light w-5 h-5" />
          </div>
        ))}
        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary-light rounded-xl border border-primary/20 flex items-center justify-center">
          <span className="text-primary text-lg font-bold">+</span>
        </div>
      </div>
    ),
  },
  {
    number: "3",
    title: "Dapatkan insight personal",
    description:
      'Lihat korelasi yang hanya berlaku untukmu. "Jerawatmu sering muncul setelah begadang dan makan gorengan."',
    preview: (
      <div className="mt-3 bg-gradient-to-r from-primary-light/60 to-white rounded-xl p-3 border border-primary/10 inline-block max-w-sm">
        <div className="flex items-start gap-2">
          <Lightbulb className="text-primary w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-[11px] lg:text-xs text-slate-700 leading-relaxed">
            <strong>Insight:</strong> 3 hari terakhir tidur &lt; 6 jam = muncul jerawat baru di pipi.
            Coba tidur lebih awal! 💤
          </p>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="how-it-works" className="py-16 px-5 lg:py-24">
      <div className="container-narrow">
        <div
          ref={headerRef}
          className={`text-center mb-10 lg:mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Cara Kerja
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Cukup 3 Langkah
          </h2>
        </div>

        {/* Mobile: Vertical with line */}
        <div className="flex flex-col md:hidden">
          {steps.map((step, index) => (
            <StepItem key={index} {...step} isLast={index === steps.length - 1} delay={index * 100} />
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface StepItemProps {
  number: string;
  title: string;
  description: string;
  preview: React.ReactNode;
  isLast: boolean;
  delay: number;
}

function StepItem({ number, title, description, preview, isLast, delay }: StepItemProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`relative flex gap-4 pb-8 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {!isLast && (
        <div
          className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary-light"
          style={{ left: "24px" }}
        />
      )}
      <div className="relative z-10 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20">
        {number}
      </div>
      <div className="pt-1">
        <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">{title}</h3>
        <p className="text-xs lg:text-sm text-muted leading-relaxed">{description}</p>
        {preview}
      </div>
    </div>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  preview: React.ReactNode;
  delay: number;
}

function StepCard({ number, title, description, preview, delay }: StepCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-primary/20">
        {number}
      </div>
      <h3 className="font-bold text-slate-800 text-base mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed mb-4">{description}</p>
      <div className="flex justify-center">{preview}</div>
    </div>
  );
}
