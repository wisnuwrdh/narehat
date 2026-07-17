"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function RoutinePage() {
  const { user } = useUser();

  if (!user.plan.includes("pro")) {
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
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rutinitas AI 👑</h1>
          <p className="text-xs text-muted">Analisis &amp; bangun rutinitas skincare</p>
        </div>
      </header>

      <AnalyzeSection />
      <BuildSection userSkinType={user.skin_type} />
    </main>
  );
}

function AnalyzeSection() {
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
    if (lines.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/routine-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: lines }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch { setError("Gagal terhubung ke server."); }
    finally { setLoading(false); }
  };

  return (
    <section className="px-6 mb-8 pt-4">
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

        <textarea
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="Tulis produk yang kamu pakai, 1 per baris...&#10;Contoh:&#10;Cetaphil Gentle Cleanser&#10;The Ordinary Niacinamide&#10;Skin Aqua SPF 50"
          rows={5}
          className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-3"
        />

        <button
          onClick={handleAnalyze}
          disabled={!products.trim() || loading}
          className={`btn-press w-full py-3 rounded-xl text-sm font-bold transition-colors ${
            products.trim() && !loading
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
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

function BuildSection({ userSkinType }: { userSkinType: string }) {
  const [skinType, setSkinType] = useState(userSkinType || "combination");
  const [budget, setBudget] = useState("mid");
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
        body: JSON.stringify({ skin_type: skinType, budget }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch { setError("Gagal terhubung ke server."); }
    finally { setLoading(false); }
  };

  return (
    <section className="px-6 mb-8">
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
