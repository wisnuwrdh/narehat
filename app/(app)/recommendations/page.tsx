"use client";

import Link from "next/link";

const products = [
  {
    id: 1,
    category: "Cleanser",
    name: "Cetaphil Gentle Skin Cleanser",
    desc: "Pembersih lembut untuk kulit sensitif dan berjerawat. Non-comedogenic.",
    price: "Rp89.000",
    rating: "4.8",
    reviews: "2.1k",
    why: "Formula gentle cocok untuk kulit kombinasi berjerawat. pH balanced.",
    catColor: "text-primary bg-primary-light",
    catLabel: "Cleanser",
  },
  {
    id: 2,
    category: "Treatment",
    name: "The Ordinary Niacinamide 10%",
    desc: "Mengurangi minyak berlebih dan memudarkan bekas jerawat.",
    price: "Rp145.000",
    rating: "4.7",
    reviews: "5.3k",
    why: "Niacinamide terbukti efektif mengontrol sebum dan mencerahkan bekas jerawat.",
    catColor: "text-violet-600 bg-violet-50",
    catLabel: "Treatment",
  },
  {
    id: 3,
    category: "Sunscreen",
    name: "Skin Aqua UV Moisture Milk",
    desc: "SPF 50 PA++++, ringan, tidak greasy, cocok untuk kulit berminyak.",
    price: "Rp65.000",
    rating: "4.9",
    reviews: "8.7k",
    why: "Tekstur milk yang ringan cocok untuk kulit kombinasi. Tidak memicu jerawat.",
    catColor: "text-blue-600 bg-blue-50",
    catLabel: "Sunscreen",
  },
];

const categories = ["Semua", "Cleanser", "Moisturizer", "Sunscreen", "Treatment"];

export default function RecommendationsPage() {
  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="btn-press p-2 -ml-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Rekomendasi</h1>
            <p className="text-sm text-muted">Produk yang cocok untuk kulitmu</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((c, i) => (
            <button key={c} className={`btn-press px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${i === 0 ? "bg-primary text-white" : "bg-white border border-border-light text-slate-600 hover:bg-slate-50"}`}>
              {c}
            </button>
          ))}
        </div>
      </header>

      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50/60 to-violet-50/30 border border-indigo-100/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            <span className="text-xs font-bold text-primary">Direkomendasikan untukmu</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Berdasarkan tipe kulit <span className="font-bold text-slate-800">kombinasi</span> dan concern <span className="font-bold text-slate-800">jerawat aktif</span>.
          </p>
        </div>
      </section>

      <section className="px-6 mb-6 space-y-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-border-subtle rounded-3xl p-4 shadow-sm card-hover">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl text-slate-300">inventory_2</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.catColor}`}>{p.catLabel}</span>
                    <h3 className="font-bold text-slate-800 text-sm mt-1 truncate">{p.name}</h3>
                  </div>
                  <button className="btn-press p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <span className="material-symbols-outlined text-lg">favorite_border</span>
                  </button>
                </div>
                <p className="text-xs text-muted mt-1 line-clamp-2">{p.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-extrabold text-slate-900">{p.price}</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                    <span className="text-xs font-bold text-slate-700">{p.rating}</span>
                    <span className="text-[10px] text-muted">({p.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {["Shopee", "Tokopedia"].map((platform) => (
                <a key={platform} href="#" className={`btn-press flex-1 py-2.5 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1 ${platform === "Shopee" ? "bg-primary text-white hover:bg-primary/90" : "bg-white border border-border-light text-slate-700 hover:bg-slate-50"}`}>
                  <span className="material-symbols-outlined text-sm">{platform === "Shopee" ? "shopping_bag" : "store"}</span>
                  {platform}
                </a>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <p className="text-[10px] text-muted">
                <span className="font-semibold text-slate-600">Kenapa direkomendasikan:</span> {p.why}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="px-6 pb-8">
        <button className="btn-press w-full py-3.5 bg-white border border-border-light text-sm font-semibold text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors">
          Lihat lebih banyak
        </button>
      </div>
    </main>
  );
}
