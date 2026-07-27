"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ["Semua", "Cleanser", "Moisturizer", "Sunscreen", "Treatment"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = category === "Semua" ? "" : `?category=${encodeURIComponent(category)}`;
      const res = await fetch(`/api/admin/products${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleToggleActive = async (id: string, current: boolean) => {
    if (current) {
      if (!confirm("Nonaktifkan produk ini?")) return;
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    } else {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: true }),
      });
    }
    fetchProducts();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) =>
    `Rp${price.toLocaleString("id-ID")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Produk</h1>
          <p className="text-sm text-muted">Kelola katalog produk rekomendasi</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-press px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors"
        >
          + Tambah Produk
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari produk atau brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-muted-light mb-3">inventory_2</span>
          <p className="text-sm font-semibold text-slate-600">Tidak ada produk</p>
          <Link href="/admin/products/new" className="text-primary text-sm font-bold mt-2 inline-block">
            Tambah produk pertama
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border-subtle rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Produk</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Brand</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Harga</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border-subtle hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.brand}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(p.id, p.is_active)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                        p.is_active
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-primary text-xs font-bold hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}