"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "Apakah Narehat menggantikan dokter kulit?",
    a: "Tidak. Narehat adalah alat bantu untuk memahami pola dan pemicu jerawatmu. Untuk diagnosis medis dan pengobatan, tetap konsultasi dengan dokter kulit.",
  },
  {
    q: "Apakah data fotoku aman?",
    a: "Sangat aman. Foto dienkripsi end-to-end dan tidak akan digunakan untuk training AI tanpa persetujuanmu. Kami mematuhi UU Perlindungan Data Pribadi Indonesia.",
  },
  {
    q: "Berapa lama sampai lihat hasil?",
    a: "Banyak user mulai melihat pola dalam 1–2 minggu. Insight yang lebih mendalam biasanya muncul setelah 3–4 minggu konsisten mencatat kebiasaan.",
  },
  {
    q: "Bisa batalkan subscription kapan saja?",
    a: "Tentu! Kamu bisa batalkan kapan saja tanpa biaya tambahan. Akses premium tetap aktif sampai akhir periode berlangganan.",
  },
];

export default function FAQSection() {
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
    <section id="faq" ref={ref} className="py-16 px-5 lg:py-24">
      <div className="container-narrow">
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            FAQ
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Pertanyaan Umum
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className={`group bg-white border border-border-subtle rounded-2xl overflow-hidden ${visible ? "reveal visible" : "reveal"}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <span className="text-sm lg:text-base font-semibold text-slate-800 pr-4">{faq.q}</span>
                <span className="material-symbols-outlined text-muted shrink-0 transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="px-5 pb-5">
                <p className="text-xs lg:text-sm text-muted leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
