"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
      <div className="container-narrow max-w-2xl mx-auto">
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
            FAQ
          </span>
          <h2 className="section-title font-extrabold text-slate-900 leading-tight">
            Pertanyaan Umum
          </h2>
        </div>

        <div className={`space-y-3 ${visible ? "reveal visible" : "reveal"}`}>
          {[
            {
              q: "Apa bedanya Premium vs Pro?",
              a: "Premium (Rp29rb/bln) buat kamu yang mau kepastian: AI Deteksi 30x/bulan dengan model GPT-5 terbaru, AI Consult 100x/bulan, dan Purging Checker 10x/bulan. Pro (Rp49rb/bln) buat kamu yang mau AI urus semuanya: AI Deteksi 100x/bulan dengan GPT-5 penuh, AI Consult 300x/bulan, Purging Checker 30x/bulan, analisis rutinitas skincare, dan laporan mingguan export PDF.",
            },
            {
              q: "Apakah purging checker bisa dipakai gratis?",
              a: "Ya, semua user free dapat 1x purging checker per bulan, biar kamu bisa cicipin fiturnya. Premium 10x/bulan, Pro 30x/bulan.",
            },
            {
              q: "Kenapa ada batas pemakaian?",
              a: "Kami mau AI-nya tetap cepat dan harga langganan tetap terjangkau. Semua batas direset otomatis tiap awal bulan — kamu gak akan kehilangan kuota yang belum terpakai di pertengahan bulan.",
            },
            {
              q: "Bedanya kualitas analisis tiap plan?",
              a: "Free memakai model gpt-4o-mini — cepat dan solid untuk deteksi dasar. Premium naik ke gpt-5-mini, analisis lebih detail. Pro memakai GPT-5 penuh untuk analisis paling mendalam, plus akses model AI baru lebih awal.",
            },
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
              a: "Untuk fitur instan (purging checker, AI detect, skin quiz), hasil langsung keluar dalam hitungan detik. Untuk insight korelasi jangka panjang, biasanya mulai terlihat setelah 2-4 minggu konsisten tracking.",
            },
            {
              q: "Bisa batalkan subscription kapan saja?",
              a: "Tentu! Kamu bisa batalkan kapan saja tanpa biaya tambahan. Akses premium/pro tetap aktif sampai akhir periode berlangganan.",
            },
          ].map((faq, i) => (
            <details key={i} className="group bg-white border border-border-subtle rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors list-none">
                <span className="text-sm lg:text-base font-bold text-slate-800 pr-4">{faq.q}</span>
                <span className="material-symbols-outlined text-muted text-lg shrink-0 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
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
