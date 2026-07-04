"use client";

import { useState } from "react";
import {
  Sparkles,
  Heart,
  Star,
  ShoppingBag,
  Store,
} from "lucide-react";
import AppHeader from "@/components/app/AppHeader";

const categories = ["Semua", "Cleanser", "Moisturizer", "Sunscreen", "Treatment"];

const products = [
  {
    id: 1,
    name: "Cetaphil Gentle Skin Cleanser",
    category: "Cleanser",
    categoryColor: "text-primary",
    categoryBg: "bg-primary-light",
    price: "Rp89.000",
    rating: 4.8,
    reviews: "2.1k",
    description: "Pembersih lembut untuk kulit sensitif dan berjerawat. Non-comedogenic.",
    whyRecommended: "Formula gentle cocok untuk kulit kombinasi berjerawat. pH balanced.",
  },
  {
    id: 2,
    name: "The Ordinary Niacinamide 10%",
    category: "Treatment",
    categoryColor: "text-violet-600",
    categoryBg: "bg-violet-50",
    price: "Rp145.000",
    rating: 4.7,
    reviews: "5.3k",
    description: "Mengurangi minyak berlebih dan memudarkan bekas jerawat.",
    whyRecommended: "Niacinamide terbukti efektif mengontrol sebum dan mencerahkan bekas jerawat.",
  },
  {
    id: 3,
    name: "Skin Aqua UV Moisture Milk",
    category: "Sunscreen",
    categoryColor: "text-blue-600",
    categoryBg: "bg-blue-50",
    price: "Rp65.000",
    rating: 4.9,
    reviews: "8.7k",
    description: "SPF 50 PA++++, ringan, tidak greasy, cocok untuk kulit berminyak.",
    whyRecommended: "Tekstur milk yang ringan cocok untuk kulit kombinasi. Tidak memicu jerawat.",
  },
];

export default function RecommendationsPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filteredProducts =
    activeCategory === "Semua"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="pb-36">
      <AppHeader
        title="Rekomendasi"
        subtitle="Produk yang cocok untuk kulitmu"
        showBack
        backHref="/dashboard"
      />

      {/* Category Filter */}
      <section className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn-press px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white border border-border-light text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Why Recommended */}
      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50/60 to-violet-50/30 border border-indigo-100/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">Direkomendasikan untukmu</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Berdasarkan tipe kulit <span className="font-bold text-slate-800">kombinasi</span> dan concern{" "}
            <span className="font-bold text-slate-800">jerawat aktif</span>.
          </p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="px-6 mb-6 space-y-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-border-subtle rounded-3xl p-4 shadow-sm card-hover"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold ${product.categoryColor} ${product.categoryBg} px-2 py-0.5 rounded-md`}>
                      {product.category}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm mt-1 truncate">{product.name}</h3>
                  </div>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="btn-press p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-extrabold text-slate-900">{product.price}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                    <span className="text-[10px] text-muted">({product.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href="#"
                className="btn-press flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-4 h-4" />
                Shopee
              </a>
              <a
                href="#"
                className="btn-press flex-1 py-2.5 bg-white border border-border-light text-xs font-bold text-slate-700 rounded-xl text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
              >
                <Store className="w-4 h-4" />
                Tokopedia
              </a>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <p className="text-[10px] text-muted">
                <span className="font-semibold text-slate-600">Kenapa direkomendasikan:</span>{" "}
                {product.whyRecommended}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Load More */}
      <div className="px-6 pb-8">
        <button className="btn-press w-full py-3.5 bg-white border border-border-light text-sm font-semibold text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors">
          Lihat lebih banyak
        </button>
      </div>
    </div>
  );
}
