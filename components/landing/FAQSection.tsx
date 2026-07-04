"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Apakah Narehat menggantikan dokter kulit?",
    answer:
      "Tidak. Narehat adalah alat bantu untuk memahami pola dan pemicu jerawatmu. Untuk diagnosis medis dan pengobatan, tetap konsultasi dengan dokter kulit.",
  },
  {
    question: "Apakah data fotoku aman?",
    answer:
      "Sangat aman. Foto dienkripsi end-to-end dan tidak akan digunakan untuk training AI tanpa persetujuanmu. Kami mematuhi UU Perlindungan Data Pribadi Indonesia.",
  },
  {
    question: "Berapa lama sampai lihat hasil?",
    answer:
      "Banyak user mulai melihat pola dalam 1–2 minggu. Insight yang lebih mendalam biasanya muncul setelah 3–4 minggu konsisten mencatat kebiasaan.",
  },
  {
    question: "Bisa batalkan subscription kapan saja?",
    answer:
      "Tentu! Kamu bisa batalkan kapan saja tanpa biaya tambahan. Akses premium tetap aktif sampai akhir periode berlangganan.",
  },
];

export default function FAQSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="faq" className="py-16 px-5 lg:py-24">
      <div className="container-narrow">
        <div
          ref={headerRef}
          className={`text-center mb-10 lg:mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            FAQ
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Pertanyaan Umum
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} delay={index * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  delay: number;
}

function FAQItem({ question, answer, delay }: FAQItemProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <details
      ref={ref}
      className={`group bg-white border border-border-subtle rounded-2xl overflow-hidden transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
        <span className="text-sm lg:text-base font-semibold text-slate-800 pr-4">{question}</span>
        <ChevronDown className="w-5 h-5 text-muted transition-transform duration-300 group-open:rotate-180 shrink-0" />
      </summary>
      <div className="px-5 pb-5">
        <p className="text-xs lg:text-sm text-muted leading-relaxed">{answer}</p>
      </div>
    </details>
  );
}
