"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

const skinTypes = [
  { key: "oily", label: "Berminyak", icon: "🔹" },
  { key: "dry", label: "Kering", icon: "💧" },
  { key: "combination", label: "Kombinasi", icon: "⚡" },
  { key: "normal", label: "Normal", icon: "✨" },
  { key: "sensitive", label: "Sensitif", icon: "🌿" },
];

const budgets = [
  { key: "low", label: "<Rp100rb/produk" },
  { key: "mid", label: "Rp100rb-Rp300rb" },
  { key: "high", label: ">Rp300rb" },
];

const concerns = [
  { key: "acne", label: "Jerawat aktif" },
  { key: "scar", label: "Bekas jerawat" },
  { key: "brightening", label: "Mencerahkan" },
  { key: "anti_aging", label: "Anti-aging" },
  { key: "barrier", label: "Skin barrier" },
];

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  time_of_day: string | null;
  active: boolean | null;
  notes: string | null;
}

const timeLabels: Record<string, string> = {
  am: "Pagi",
  pm: "Malam",
  spot: "Spot",
};

export default function RoutinePage() {
  const { user, activePlan, planActive } = useUser();

  if (activePlan !== "pro" || !planActive) {
    return (
      <main className="max-w-md md:max-w-4xl mx-auto">
        <header className="px-6 pt-6 pb-4 flex items-center gap-3">
          <Link href="/dashboard" className="btn-press p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-xl text-slate-600">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Rutinitas AI</h1>
        </header>
        <section className="px-6 py-16 text-center">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">diamond</span>
          </div>
          <h2 className="text-base font-bold text-slate-700 mb-1">Fitur Pro</h2>
          <p className="text-sm text-muted mb-4">Analisis rutinitas &amp; routine builder tersedia untuk user Pro.</p>
          <Link href="/settings" className="inline-block px-6 py-3 bg-primary text-white text-sm font-bold rounded-2xl">
            Upgrade ke Pro 👑
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-md md:max-w-4xl mx-auto">
      <header className="px-6 pt-6 pb-4 flex items-center gap-3 bg-white sticky top-0 z-10 border-b border-border-subtle">
        <Link href="/dashboard" className="btn-press p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-xl text-slate-600">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Rutinitas AI 👑</h1>
          <p className="text-xs text-muted">Analisis &amp; bangun rutinitas skincare</p>
        </div>
        <RoutineQuotaBadge />
      </header>

      <MyProductsSection />
      <AnalyzeSection />
      <BuildSection userSkinType={user.skin_type} userGoal={user.goal} />
      <HistorySection />
    </main>
  );
}

function RoutineQuotaBadge() {
  const [quota, setQuota] = useState<{ analyze: { used: number; limit: number }; build: { used: number; limit: number } } | null>(null);

  const fetchQuota = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/quota", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setQuota({ analyze: data.routine_analyze, build: data.routine_build });
    } catch {}
  }, []);

  useEffect(() => {
    fetchQuota();
    const onFocus = () => fetchQuota();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchQuota]);

  if (!quota) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[10px] font-semibold text-slate-500">
        Analisis {quota.analyze.used}/{quota.analyze.limit}
      </span>
      <span className="text-[10px] font-semibold text-slate-500">
        Builder {quota.build.used}/{quota.build.limit}
      </span>
    </div>
  );
}

function MyProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("am");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/skincare-products");
      if (!res.ok) return;
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/skincare-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brand, category, time_of_day: timeOfDay }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setName("");
      setBrand("");
      setCategory("");
      setShowForm(false);
      await fetchProducts();
    } catch { setError("Gagal terhubung ke server."); }
    finally { setSaving(false); }
  };

  const toggleActive = async (p: Product) => {
    const next = !(p.active ?? true);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: next } : x)));
    await fetch(`/api/skincare-products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
  };

  const removeProduct = async (id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id));
    await fetch(`/api/skincare-products/${id}`, { method: "DELETE" });
  };

  const activeCount = products.filter((p) => p.active ?? true).length;

  return (
    <section className="px-6 mb-6 pt-4">
      <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-sky-500">inventory_2</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Produk Saya</h3>
            <p className="text-xs text-muted">
              {loading ? "Memuat..." : `${activeCount} produk aktif digunakan untuk analisis`}
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-press p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
            aria-label="Tambah produk"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-border-light space-y-3 animate-scale-in">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama produk *"
              className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand"
                className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kategori (contoh: serum)"
                className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              {(["am", "pm", "spot"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeOfDay(t)}
                  className={`btn-press px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    timeOfDay === t ? "bg-primary text-white" : "bg-white text-slate-600 border border-border-light"
                  }`}
                >
                  {timeLabels[t]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!name.trim() || saving}
                className={`btn-press flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  name.trim() && !saving ? "bg-primary text-white hover:bg-primary/90" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-press px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="text-xs text-muted text-center py-4">
            Belum ada produk. Tambahkan skincare yang kamu pakai agar analisis lebih personal.
          </p>
        )}

        {products.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {products.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${
                  p.active === false ? "bg-slate-50 border-border-light opacity-60" : "bg-slate-50/60 border-border-light"
                }`}
              >
                <button
                  onClick={() => toggleActive(p)}
                  className={`btn-press w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    p.active === false ? "bg-slate-200 text-slate-400" : "bg-emerald-500 text-white"
                  }`}
                  aria-label="Toggle aktif"
                >
                  {p.active === false ? (
                    <span className="material-symbols-outlined text-xs">close</span>
                  ) : (
                    <span className="material-symbols-outlined text-xs">check</span>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 block truncate">{p.name}</span>
                  <span className="text-[10px] text-muted">
                    {[p.brand, p.category, p.time_of_day ? timeLabels[p.time_of_day] : ""]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </div>
                <button
                  onClick={() => removeProduct(p.id)}
                  className="btn-press p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Hapus"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AnalyzeSection() {
  const [mode, setMode] = useState<"saved" | "manual">("saved");
  const [products, setProducts] = useState("");
  const [result, setResult] = useState<{
    issues: { type: string; detail: string }[];
    warnings: string[];
    suggestions: { step: string; reason: string }[];
    disclaimer: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const typeLabels: Record<string, string> = {
    conflict: "Konflik Produk",
    over_exfoliation: "Over-Exfoliation",
    wrong_order: "Urutan Salah",
    missing_step: "Langkah Hilang",
    irritant: "Bahan Iritan",
    duplicate: "Duplikasi",
  };

  const typeIcons: Record<string, string> = {
    conflict: "⚠️",
    over_exfoliation: "🫣",
    wrong_order: "🔄",
    missing_step: "❓",
    irritant: "🌶️",
    duplicate: "🔄",
  };

  const handleAnalyze = async () => {
    const lines = products.split("\n").filter((l) => l.trim());
    if (mode === "manual" && lines.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/routine-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "saved" ? { use_my_products: true } : { products: lines }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menganalisis."); return; }
      setResult(data);
    } catch { setError("Gagal terhubung ke server."); }
    finally { setLoading(false); }
  };

  return (
    <section className="px-6 mb-6">
      <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-500">find_in_page</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Analisis Rutinitas</h3>
            <p className="text-xs text-muted">Cek apakah skincare-mu sudah optimal</p>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("saved")}
            className={`btn-press px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              mode === "saved" ? "bg-primary text-white" : "bg-slate-50 text-slate-600 border border-border-light"
            }`}
          >
            Produk Saya
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`btn-press px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              mode === "manual" ? "bg-primary text-white" : "bg-slate-50 text-slate-600 border border-border-light"
            }`}
          >
            Manual
          </button>
        </div>

        {mode === "manual" && (
          <textarea
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            placeholder="Tulis produk yang kamu pakai, 1 per baris...&#10;Contoh:&#10;Cetaphil Gentle Cleanser&#10;The Ordinary Niacinamide&#10;Skin Aqua SPF 50"
            rows={5}
            className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-3"
          />
        )}

        {mode === "saved" && (
          <div className="mb-3 p-3 bg-slate-50 border border-border-light rounded-xl text-xs text-muted flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">info</span>
            Analisis otomatis memakai semua produk aktif di daftar "Produk Saya" di atas, ditambah konteks scan &amp; insight terbaru kamu.
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || (mode === "manual" && !products.trim())}
          className={`btn-press w-full py-3 rounded-xl text-sm font-bold transition-colors ${
            loading || (mode === "manual" && !products.trim())
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {loading ? "Menganalisis..." : "Analisis Rutinitas"}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3 animate-scale-in">
            {result.issues.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Masalah Ditemukan:</span>
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-xl mb-2">
                    <span className="text-lg shrink-0">{typeIcons[issue.type] || "•"}</span>
                    <div>
                      <span className="text-xs font-bold text-red-700">{typeLabels[issue.type] || issue.type}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{issue.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.issues.length === 0 && (
              <div className="p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
                <span className="text-lg">✅</span>
                <p className="text-xs text-emerald-700">Tidak ditemukan masalah besar dalam rutinitasmu!</p>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-xs font-bold text-amber-700 block mb-1">⚠️ Perhatian:</span>
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-slate-600">• {w}</p>
                ))}
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div className="p-3 bg-indigo-50 rounded-xl">
                <span className="text-xs font-bold text-indigo-700 block mb-1">💡 Saran Perbaikan:</span>
                {result.suggestions.map((s, i) => (
                  <p key={i} className="text-xs text-slate-600 mb-1">
                    <strong>{s.step}</strong> — {s.reason}
                  </p>
                ))}
              </div>
            )}

            <p className="text-[10px] text-muted italic">{result.disclaimer}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function BuildSection({ userSkinType, userGoal }: { userSkinType: string; userGoal: string }) {
  const [skinType, setSkinType] = useState(userSkinType || "combination");
  const [budget, setBudget] = useState("mid");
  const [concern, setConcern] = useState(userGoal === "clear_acne" ? "acne" : userGoal === "fade_scars" ? "scar" : userGoal === "brighter_skin" ? "brightening" : "acne");
  const [result, setResult] = useState<{
    am_routine: { step: number; name: string; description: string; productHint: string }[];
    pm_routine: { step: number; name: string; description: string; productHint: string }[];
    tips: string[];
    disclaimer: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuild = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/routine-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skin_type: skinType, budget, concern }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal membuat rutinitas."); return; }
      setResult(data);
    } catch { setError("Gagal terhubung ke server."); }
    finally { setLoading(false); }
  };

  return (
    <section className="px-6 mb-6">
      <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-500">auto_awesome</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Routine Builder</h3>
            <p className="text-xs text-muted">Bangun rutinitas personal dari nol</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Tipe Kulit</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {skinTypes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSkinType(t.key)}
                  className={`btn-press px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    skinType === t.key
                      ? "bg-primary text-white"
                      : "bg-slate-50 text-slate-600 border border-border-light hover:bg-slate-100"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Concern Utama</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {concerns.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setConcern(c.key)}
                  className={`btn-press px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    concern === c.key
                      ? "bg-primary text-white"
                      : "bg-slate-50 text-slate-600 border border-border-light hover:bg-slate-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Budget</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {budgets.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setBudget(b.key)}
                  className={`btn-press px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    budget === b.key
                      ? "bg-primary text-white"
                      : "bg-slate-50 text-slate-600 border border-border-light hover:bg-slate-100"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleBuild}
          disabled={loading}
          className={`btn-press w-full py-3 rounded-xl text-sm font-bold transition-colors ${
            !loading
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Menyusun rutinitas..." : "Generate Rutinitas ✨"}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-4 animate-scale-in">
            <RoutineCard title="🌅 Rutinitas Pagi" steps={result.am_routine} />
            <RoutineCard title="🌙 Rutinitas Malam" steps={result.pm_routine} />

            {result.tips.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-xs font-bold text-amber-700 block mb-1">💡 Tips:</span>
                {result.tips.map((t, i) => (
                  <p key={i} className="text-xs text-slate-600">• {t}</p>
                ))}
              </div>
            )}

            <p className="text-[10px] text-muted italic">{result.disclaimer}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function RoutineCard({ title, steps }: { title: string; steps: { step: number; name: string; description: string; productHint: string }[] }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-border-light">
      <span className="text-sm font-bold text-slate-800 block mb-3">{title}</span>
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.step} className="flex gap-3">
            <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
              {s.step}
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-slate-800">{s.name}</span>
              <p className="text-xs text-muted mt-0.5">{s.description}</p>
              {s.productHint && (
                <p className="text-[10px] text-primary mt-1 bg-primary-light px-2 py-0.5 rounded-lg inline-block">
                  Cari: {s.productHint}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistorySection() {
  const [reports, setReports] = useState<{
    id: string;
    type: string;
    input: { products?: string[]; skin_type?: string; concern?: string; use_my_products?: boolean };
    created_at: string;
  }[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/ai/routine/history");
      if (!res.ok) return;
      const data = await res.json();
      setReports(data.reports || []);
    } catch {}
    finally { setLoaded(true); }
  };

  useEffect(() => {
    if (open && !loaded) load();
  }, [open, loaded]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <section className="px-6 mb-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-press w-full flex items-center gap-3 p-4 bg-white border border-border-subtle rounded-3xl shadow-sm"
      >
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-amber-500">history</span>
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-bold text-slate-800">Riwayat</h3>
          <p className="text-xs text-muted">{loaded ? `${reports.length} laporan tersimpan` : "Muat riwayat analisis & rutinitas"}</p>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="mt-2 space-y-2 animate-scale-in">
          {!loaded && <p className="text-xs text-muted text-center py-4">Memuat...</p>}
          {loaded && reports.length === 0 && (
            <p className="text-xs text-muted text-center py-4">Belum ada laporan. Hasil analisis &amp; rutinitas akan tersimpan di sini.</p>
          )}
          {reports.map((r) => (
            <div key={r.id} className="p-3 bg-white border border-border-subtle rounded-2xl flex items-center gap-3">
              <span className="text-lg shrink-0">{r.type === "analyze" ? "🔍" : "✨"}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-700 block">
                  {r.type === "analyze" ? "Analisis Rutinitas" : "Rutinitas Dibuat"}
                </span>
                <span className="text-[10px] text-muted block truncate">
                  {r.type === "analyze"
                    ? r.input?.use_my_products
                      ? `Produk Saya (${r.input.products?.length ?? 0} item)`
                      : r.input?.products?.join(", ") || "—"
                    : `${r.input?.concern || "acne"} · ${r.input?.skin_type || "combination"}`}
                </span>
              </div>
              <span className="text-[10px] text-muted shrink-0">{formatDate(r.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
