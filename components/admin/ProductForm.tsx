"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ["Cleanser", "Moisturizer", "Sunscreen", "Treatment"];

const SKIN_TYPES: { value: string; label: string }[] = [
  { value: "oily", label: "Berminyak" },
  { value: "dry", label: "Kering" },
  { value: "combination", label: "Kombinasi" },
  { value: "normal", label: "Normal" },
  { value: "sensitive", label: "Sensitif" },
];

const CONCERNS: { value: string; label: string }[] = [
  { value: "clear_acne", label: "Jerawat hilang" },
  { value: "fade_scars", label: "Bekas jerawat" },
  { value: "brighter_skin", label: "Kulit lebih cerah" },
  { value: "anti_aging", label: "Anti-aging" },
  { value: "barrier", label: "Skin barrier" },
];

export interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  rating: string;
  reviews: string;
  affiliate_link: string;
  shopee_link: string;
  tokopedia_link: string;
  image_url: string;
  ingredients: string;
  why: string;
  skin_types: string[];
  concerns: string[];
}

const emptyForm: ProductFormData = {
  name: "",
  brand: "",
  category: "Cleanser",
  description: "",
  price: "",
  rating: "",
  reviews: "",
  affiliate_link: "",
  shopee_link: "",
  tokopedia_link: "",
  image_url: "",
  ingredients: "",
  why: "",
  skin_types: [],
  concerns: [],
};

export interface ProductFormProps {
  initialData?: ProductFormData & { id?: string };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initialData || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const isEdit = !!initialData?.id;

  const handleChange = (field: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !initialData?.id) {
      setError("Simpan produk dulu, lalu pilih gambar untuk diupload.");
      return;
    }
    setUploadingImage(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("productId", initialData.id);
      fd.append("file", selectedFile);
      const res = await fetch("/api/photos/product", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengupload gambar");
        return;
      }
      setForm((prev) => ({ ...prev, image_url: data.url }));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setSelectedFile(null);
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleArray = (field: "skin_types" | "concerns", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        ...(isEdit ? { id: initialData!.id } : {}),
        name: form.name,
        brand: form.brand,
        category: form.category,
        description: form.description,
        price: form.price ? parseInt(form.price.replace(/\D/g, "")) : 0,
        rating: form.rating ? parseFloat(form.rating) : 0,
        reviews: form.reviews ? parseInt(form.reviews.replace(/\D/g, "")) : 0,
        affiliate_link: form.affiliate_link || form.shopee_link || "",
        shopee_link: form.shopee_link,
        tokopedia_link: form.tokopedia_link,
        image_url: form.image_url,
        ingredients: form.ingredients,
        why: form.why,
        skin_types: form.skin_types,
        concerns: form.concerns,
      };

      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan produk");
        return;
      }

      router.push("/admin/products");
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-light hover:text-slate-700 transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Kembali
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Produk *</label>
            <input
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Brand *</label>
            <input
              required
              value={form.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori *</label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Harga (Rp)</label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="89000"
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Kenapa Direkomendasikan</label>
          <textarea
            value={form.why}
            onChange={(e) => handleChange("why", e.target.value)}
            rows={2}
            placeholder="Cocok untuk kulit berminyak, non-comedogenic..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Cocok untuk Tipe Kulit</label>
          <div className="flex flex-wrap gap-2">
            {SKIN_TYPES.map((s) => {
              const active = form.skin_types.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleArray("skin_types", s.value)}
                  className={`btn-press px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-border-light text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-1">Kosongkan semua = cocok untuk semua tipe kulit</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Cocok untuk Concern</label>
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map((c) => {
              const active = form.concerns.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleArray("concerns", c.value)}
                  className={`btn-press px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-border-light text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-1">Kosongkan semua = cocok untuk semua concern</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Active Ingredients / Kandungan</label>
          <textarea
            value={form.ingredients}
            onChange={(e) => handleChange("ingredients", e.target.value)}
            rows={2}
            placeholder="Niacinamide, Zinc PCA, Aqua..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Link Shopee</label>
            <input
              value={form.shopee_link}
              onChange={(e) => handleChange("shopee_link", e.target.value)}
              placeholder="https://shopee.co.id/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Link Tokopedia</label>
            <input
              value={form.tokopedia_link}
              onChange={(e) => handleChange("tokopedia_link", e.target.value)}
              placeholder="https://tokopedia.com/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Foto Produk</label>
          {(form.image_url || previewUrl) && (
            <div className="mb-2 w-24 h-24 bg-slate-100 rounded-xl overflow-hidden">
              <img
                src={previewUrl || form.image_url}
                alt="Preview produk"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm file:font-semibold hover:file:bg-slate-200"
            />
            {selectedFile && (
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={uploadingImage}
                className="btn-press shrink-0 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50"
              >
                {uploadingImage ? "Uploading..." : "Upload"}
              </button>
            )}
          </div>
          <p className="text-xs text-muted mt-1">
            {isEdit
              ? "Pilih file lalu klik Upload. Gambar disimpan otomatis ke produk."
              : "Simpan produk dulu untuk bisa upload gambar."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Rating</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => handleChange("rating", e.target.value)}
              placeholder="4.8"
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah Review</label>
            <input
              type="text"
              value={form.reviews}
              onChange={(e) => handleChange("reviews", e.target.value)}
              placeholder="2100"
              className="w-full px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-press w-full py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}