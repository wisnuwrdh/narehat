"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { HelpCircle, Wallet, SearchX } from "lucide-react";

const problems = [
  {
    icon: HelpCircle,
    iconColor: "text-red-400",
    bgColor: "bg-red-50",
    title: "Tidak tahu pemicu personal",
    description:
      "Setiap orang punya pemicu berbeda — tidur, makanan, stres, atau produk. Tapi kamu tidak pernah mencatatnya.",
  },
  {
    icon: Wallet,
    iconColor: "text-orange-400",
    bgColor: "bg-orange-50",
    title: "Buang uang trial & error",
    description:
      "Sudah coba puluhan produk tapi tidak pernah tahu mana yang benar-benar cocok untuk kulitmu.",
  },
  {
    icon: SearchX,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-50",
    title: "Informasi terlalu overwhelming",
    description:
      "TikTok bilang A, Instagram bilang B. Kamu butuh insight yang personal, bukan general.",
  },
];

export default function ProblemSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-16 px-5 lg:py-24">
      <div className="container-narrow">
        <div
          ref={headerRef}
          className={`text-center mb-10 lg:mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Problem
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Jerawatmu Balik Terus?
            <br className="hidden sm:block" /> Ini Kenapa
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {problems.map((problem, index) => (
            <ProblemCard key={index} {...problem} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProblemCardProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  delay: number;
}

function ProblemCard({ icon: Icon, iconColor, bgColor, title, description, delay }: ProblemCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`card-hover bg-white border border-border-subtle rounded-2xl p-5 lg:p-7 flex items-start gap-4 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`w-11 h-11 lg:w-14 lg:h-14 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}
      >
        <Icon className={`${iconColor} w-5 h-5 lg:w-6 lg:h-6`} />
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">{title}</h3>
        <p className="text-xs lg:text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
