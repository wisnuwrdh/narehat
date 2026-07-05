"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const CATEGORIES = ["Semua", "Cleanser", "Moisturizer", "Sunscreen", "Treatment"];

const PLATFORMS = ["Shopee", "Tokopedia"] as const;

const catColor: Record<string, string> = {
  Cleanser: "text-primary bg-primary-light",
  Moisturizer: "text-emerald-600 bg-emerald-50",
  Sunscreen: "text-blue-600 bg-blue-50",
  Treatment: "text-violet-600 bg-violet-50",
};

const platformStyles: Record<string, { active: string; inactive: string }> = {
  Shopee: {
    active: "bg-primary text-white hover:bg-primary/90",
    inactive: "bg-white border border-border-light text-slate-700 hover:bg-slate-50",
  },
  Tokopedia: {
    active: "bg-green-600 text-white hover:bg-green-700",
    inactive: "bg-white border border-border-light text-slate-700 hover:bg-slate-50",
  },
};

interface Product {
  id: string;
  category: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  affiliate_link: string;
  image_url: string;
  why: string;
}

const ITEMS_PER_PAGE = 6;

export default function RecommendationsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("narehat-favorites");
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setVisibleCount(ITEMS_PER_PAGE);
    const params = activeCategory === "Semua" ? "" : `?category=${encodeURIComponent(activeCategory)}`;
    fetch(`/api/recommendations${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [activeCategory]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );

  const hasMore = visibleCount < products.length;

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          showToast("Dihapus dari favorit");
        } else {
          next.add(id);
          showToast("Ditambahkan ke favorit");
        }
        localStorage.setItem("narehat-favorites", JSON.stringify([...next]));
        return next;
      });
    },
    [showToast]
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, products.length));
  }, [products.length]);

  const formatPrice = (price: number) =>
    `Rp${price.toLocaleString("id-ID")}`;

  const formatRating = (rating: number) => rating.toFixed(1);

  const formatReviews = (reviews: number) => {
    if (reviews >= 1000) return `${(reviews / 1000).toFixed(1).replace(".0", "")}k`;
    return reviews.toString();
  };

  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/dashboard"
            className="btn-press p-2 -ml-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Rekomendasi</h1>
            <p className="text-sm text-muted">Produk yang cocok untuk kulitmu</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`btn-press px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                c === activeCategory
                  ? "bg-primary text-white"
                  : "bg-white border border-border-light text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      {toast && (
        <div className="px-6 mb-4">
          <div className="animate-fade-in-up p-3 bg-primary-light border border-primary/10 rounded-2xl text-center">
            <span className="text-xs font-bold text-primary flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {toast}
            </span>
          </div>
        </div>
      )}

      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50/60 to-violet-50/30 border border-indigo-100/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            <span className="text-xs font-bold text-primary">Direkomendasikan untukmu</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Berdasarkan tipe kulit{" "}
            <span className="font-bold text-slate-800">kombinasi</span> dan concern{" "}
            <span className="font-bold text-slate-800">jerawat aktif</span>.
          </p>
        </div>
      </section>

      <section className="px-6 mb-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-border-subtle rounded-3xl p-4 shadow-sm animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-16" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-muted-light mb-3">
              inventory_2
            </span>
            <p className="text-sm font-semibold text-slate-600">
              Tidak ada produk di kategori ini
            </p>
            <p className="text-xs text-muted mt-1">
              Coba pilih kategori lain
            </p>
          </div>
        ) : (
          visibleProducts.map((p) => {
            const isFav = favorites.has(p.id);
            return (
              <div
                key={p.id}
                className="bg-white border border-border-subtle rounded-3xl p-4 shadow-sm card-hover"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl text-slate-300">
                      inventory_2
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            catColor[p.category] || "text-slate-600 bg-slate-50"
                          }`}
                        >
                          {p.category}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm mt-1 truncate">
                          {p.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleFavorite(p.id)}
                        className="btn-press p-1.5 rounded-lg transition-colors hover:bg-red-50"
                      >
                        <span
                          className={`material-symbols-outlined text-lg transition-colors ${
                            isFav ? "text-red-500" : "text-muted hover:text-red-500"
                          }`}
                        >
                          {isFav ? "favorite" : "favorite_border"}
                        </span>
                      </button>
                    </div>
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatPrice(p.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-400 text-sm">
                          star
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {formatRating(p.rating)}
                        </span>
                        <span className="text-[10px] text-muted">
                          ({formatReviews(p.reviews)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {PLATFORMS.map((platform) => {
                    const styles = platformStyles[platform];
                    return (
                      <a
                        key={platform}
                        href={p.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn-press flex-1 py-2.5 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1 ${
                          platform === "Shopee" ? styles.active : styles.inactive
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {platform === "Shopee" ? "shopping_bag" : "store"}
                        </span>
                        {platform}
                      </a>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <p className="text-[10px] text-muted">
                    <span className="font-semibold text-slate-600">
                      Kenapa direkomendasikan:
                    </span>{" "}
                    {p.why}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </section>

      {hasMore && (
        <div className="px-6 pb-8">
          <button
            onClick={handleLoadMore}
            className="btn-press w-full py-3.5 bg-white border border-border-light text-sm font-semibold text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Lihat lebih banyak ({products.length - visibleCount} produk)
          </button>
        </div>
      )}

      {!loading && products.length === 0 && activeCategory === "Semua" && (
        <div className="px-6 pb-8">
          <button
            onClick={() => fetch("/api/recommendations")
              .then((r) => r.json())
              .then((d) => {
                setProducts(d.recommendations || []);
                setLoading(false);
              })}
            className="btn-press w-full py-3.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      )}
    </main>
  );
}
