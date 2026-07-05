"use client";

import Link from "next/link";

export default function AIConsultPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 pt-6 pb-3 flex items-center gap-3 bg-white sticky top-0 z-10 border-b border-border-subtle">
        <Link href="/dashboard" className="btn-press p-2 -ml-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center relative">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Narehat AI</h1>
            <p className="text-[10px] text-muted">Online • Berbasis jurnal dermatologi</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-lg">PRO</span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          </div>
          <div className="bg-slate-50 border border-border-subtle p-3.5 max-w-[85%]" style={{ borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem" }}>
            <p className="text-sm text-slate-700 leading-relaxed">Halo Wisnu! 👋 Aku adalah AI Consultant Narehat yang berbasis jurnal dermatologi peer-reviewed. Aku bisa bantu jawab pertanyaan seputar jerawat, skincare, dan kesehatan kulitmu. Tanyakan apa saja!</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <div className="bg-primary text-white p-3.5 max-w-[85%]" style={{ borderRadius: "1.25rem 1.25rem 0.25rem 1.25rem" }}>
            <p className="text-sm leading-relaxed">Kenapa jerawatku sering muncul di dagu ya? Apa hubungannya sama hormon?</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          </div>
          <div className="max-w-[85%] space-y-3">
            <div className="bg-slate-50 border border-border-subtle p-3.5" style={{ borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem" }}>
              <p className="text-sm text-slate-700 leading-relaxed">Berdasarkan jurnal dermatologi, jerawat di area dagu dan rahang memang sering berkaitan dengan faktor hormonal. Berikut penjelasannya:</p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">school</span> Faktor Penyebab:
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" /><span><strong>Fluktuasi hormon:</strong> Androgen meningkatkan produksi sebum di area dagu</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" /><span><strong>Stres:</strong> Meningkatkan kortisol yang memicu inflamasi</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" /><span><strong>Pola tidur:</strong> Tidur kurang dari 7 jam berkorelasi dengan jerawat hormonal</span></li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-border-subtle p-3.5" style={{ borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem" }}>
              <p className="text-sm text-slate-700 leading-relaxed">Dari data tracking-mu, aku melihat ada korelasi antara <span className="font-bold text-slate-900">kurang tidur</span> dan munculnya jerawat di dagu. Coba tingkatkan kualitas tidurmu dulu ya! 💤</p>
            </div>
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-[14px] text-muted-light">menu_book</span>
              <span className="text-[10px] text-muted-light">Sumber: J. Invest. Dermatol. (2023), AAD Guidelines</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[10px] text-muted font-semibold mb-2 px-1">Pertanyaan yang mungkin kamu punya:</p>
          <div className="flex flex-wrap gap-2">
            {["Apa bedanya jerawat hormonal dan bakteri?", "Skincare apa yang cocok untuk jerawat hormonal?", "Berapa lama jerawat hormonal biasanya sembuh?"].map((q) => (
              <button key={q} className="btn-press px-3 py-2 bg-white border border-border-light rounded-xl text-xs text-slate-600 hover:border-primary/30 hover:text-primary transition-all">{q}</button>
            ))}
          </div>
        </div>
      </main>

      <div className="px-4 py-3 bg-white border-t border-border-subtle" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-end gap-2">
          <button className="btn-press p-2.5 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <div className="flex-1 bg-slate-50 rounded-2xl border border-border-light flex items-end px-3 py-2">
            <textarea placeholder="Tanyakan sesuatu..." className="flex-1 bg-transparent text-sm resize-none outline-none max-h-24 py-1" rows={1} style={{ minHeight: "24px" }} />
            <button className="btn-press p-1.5 text-muted hover:text-primary transition-colors">
              <span className="material-symbols-outlined">mic</span>
            </button>
          </div>
          <button className="btn-press p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
