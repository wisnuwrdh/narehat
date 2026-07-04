"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Star } from "lucide-react";

const testimonials = [
  {
    initial: "R",
    gradient: "from-pink-100 to-purple-100",
    textColor: "text-pink-500",
    name: "Rina, 22",
    skinType: "Kulit kombinasi",
    quote:
      "Baru sadar jerawatku muncul tiap kali deadline tugas. Narehat nunjukin korelasi stres sama jerawatku secara jelas.",
  },
  {
    initial: "A",
    gradient: "from-blue-100 to-cyan-100",
    textColor: "text-blue-500",
    name: "Andi, 24",
    skinType: "Kulit berminyak",
    quote:
      "Udah coba 10+ produk tapi gak ada yang ngefek. Ternyata masalahnya bukan produk, tapi pola tidurku yang berantakan.",
  },
  {
    initial: "D",
    gradient: "from-green-100 to-emerald-100",
    textColor: "text-green-500",
    name: "Dewi, 20",
    skinType: "Kulit sensitif",
    quote:
      "Fitur AI-nya ngebantu banget! Bisa tanya apa aja tentang jerawat dan jawabannya berbasis jurnal, bukan asal-asalan.",
  },
];

export default function TestimonialsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-16 px-5 lg:py-24">
      <div className="container-narrow">
        <div
          ref={headerRef}
          className={`text-center mb-8 lg:mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            Testimoni
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Yang Mereka Rasakan
          </h2>
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 lg:hidden pb-2">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  initial: string;
  gradient: string;
  textColor: string;
  name: string;
  skinType: string;
  quote: string;
  delay?: number;
}

function TestimonialCard({ initial, gradient, textColor, name, skinType, quote, delay = 0 }: TestimonialCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`testimonial-card lg:w-auto bg-white border border-border-subtle rounded-2xl p-5 lg:p-6 shadow-sm transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-sm font-bold ${textColor}`}
        >
          {initial}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-[10px] text-muted">{skinType}</p>
        </div>
      </div>
      <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div className="flex gap-1 mt-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
      </div>
    </div>
  );
}
