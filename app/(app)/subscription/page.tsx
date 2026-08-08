"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/contexts/ToastContext";

type Billing = "monthly" | "yearly";

const billingLabels: Record<Billing, string> = { monthly: "Bulanan", yearly: "Tahunan" };

const plans = [
  {
    name: "Free",
    price: { monthly: "Rp0", yearly: "Rp0" },
    period: { monthly: "selamanya", yearly: "selamanya" },
    features: [
      "Skin type quiz + profil personal",
      "Tracker harian (tidur, air, stress, skincare)",
      "Progress foto (upload & timeline)",
      "Rekomendasi produk + link belanja",
      "AI Deteksi jerawat: 2x/bulan",
      "AI Consult: 10x/bulan",
      "Purging Checker: 1x/bulan",
    ],
    planId: "free" as const,
    badge: null,
    featured: false,
  },
  {
    name: "Premium",
    price: { monthly: "Rp29.000", yearly: "Rp199.000" },
    period: { monthly: "/bulan", yearly: "/tahun" },
    features: [
      "Semua fitur Free",
      "AI Deteksi 15x/bulan — model GPT-5 terbaru",
      "AI Consult: 100x/bulan",
      "Purging Checker: 10x/bulan",
      "Deep insight & grafik korelasi",
      "Progress foto unlimited",
    ],
    planId: "premium" as const,
    monthlyPlan: "premium_monthly" as const,
    yearlyPlan: "premium_yearly" as const,
    badge: "PALING POPULER",
    featured: true,
  },
  {
    name: "Pro",
    price: { monthly: "Rp49.000", yearly: "Rp399.000" },
    period: { monthly: "/bulan", yearly: "/tahun" },
    features: [
      "Semua fitur Premium",
      "AI Deteksi 30x/bulan — GPT-5 penuh, analisis paling dalam",
      "AI Consult: 300x/bulan",
      "Purging Checker: 30x/bulan",
      "Personalized routine builder",
      "Weekly skin report + export PDF",
      "Akses fitur baru & model AI lebih awal",
    ],
    planId: "pro" as const,
    monthlyPlan: "pro_monthly" as const,
    yearlyPlan: "pro_yearly" as const,
    badge: "FITUR LENGKAP",
    featured: false,
  },
];

export default function SubscriptionPage() {
  const { activePlan, planActive, daysLeft } = useUser();
  const { showToast } = useToast();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [savingPlan, setSavingPlan] = useState<string | null>(null);

  const currentPlanId = activePlan;
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then((r) => r.json())
      .then((d) => {
        if (d.pending_plan) setPendingPlan(d.pending_plan);
      })
      .catch(() => {});
  }, []);

  const handleCancel = async () => {
    try {
      const res = await fetch("/api/payment/cancel", { method: "POST" });
      const data = await res.json();
      showToast(data.message || data.error, res.ok ? "success" : "error");
      if (res.ok) setPendingPlan(null);
    } catch {
      showToast("Gagal terhubung ke server.", "error");
    }
  };

  const handleUpgrade = async (plan: string) => {
    setSavingPlan(plan);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
      } else {
        showToast(data.error || "Gagal membuat pembayaran.", "error");
      }
    } catch {
      showToast("Gagal terhubung ke server.", "error");
    }
    setSavingPlan(null);
  };

  return (
    <main className="max-w-md md:max-w-4xl mx-auto pb-8">
      <header className="px-6 pt-6 pb-4 flex items-center gap-3">
        <Link href="/settings" className="p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pilih Plan</h1>
          <p className="text-sm text-muted">Upgrade untuk fitur lebih lengkap</p>
        </div>
      </header>

      <section className="px-6 mb-4">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-border-subtle">
          {(["monthly", "yearly"] as Billing[]).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${billing === b ? "text-primary bg-white shadow-sm" : "text-muted hover:bg-white hover:shadow-sm"}`}
            >
              {billingLabels[b]}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted mt-2">
          {billing === "yearly"
            ? "Premium hemat 43% · Pro hemat 32% · bayar sekali via QRIS, aktif 365 hari"
            : "Bayar sekali via QRIS · tanpa auto-perpanjang · aktif 30 hari"}
        </p>
      </section>

      <section className="px-6 space-y-4">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.planId;
          const apiPlan = billing === "monthly" ? (plan as typeof plans[1]).monthlyPlan : (plan as typeof plans[1]).yearlyPlan;

          return (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-6 transition-all ${
                plan.featured
                  ? "bg-white border-2 border-primary shadow-lg shadow-primary/10"
                  : "bg-white border border-border-subtle shadow-sm"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg">
                    Plan Aktif
                  </span>
                </div>
              )}
              {!isCurrent && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 text-white text-[10px] font-bold rounded-full shadow-lg ${plan.planId === "pro" ? "bg-slate-800 shadow-slate-800/20" : "bg-primary shadow-primary/20"}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-primary">{plan.price[billing]}</span>
                    <span className="text-xs text-muted block">{plan.period[billing]}</span>
                  </div>
                </div>
                <p className="text-xs text-muted mt-1">
                  {plan.name === "Free" ? "Rasakan lega pertama" : plan.name === "Premium" ? "Kepastian penuh" : "Semua diurus"}
                </p>

                <ul className="space-y-2 mt-4 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="material-symbols-outlined text-sm text-success">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.planId === "free" ? (
                  <div className="w-full py-3 text-center text-xs font-bold text-muted bg-slate-50 rounded-2xl">
                    {isCurrent ? "Plan Kamu Saat Ini" : "Termasuk Saat Daftar"}
                  </div>
                ) : isCurrent ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 text-center text-xs font-bold text-primary bg-primary-light rounded-2xl">
                      {planActive ? `Plan Aktif · Sisa ${daysLeft} hari` : "Plan Kamu Saat Ini"}
                    </div>
                    {planActive && (
                      <button
                        onClick={() => apiPlan && handleUpgrade(apiPlan)}
                        disabled={savingPlan === apiPlan}
                        className="w-full py-2 text-xs font-semibold text-primary border border-primary/30 rounded-2xl hover:bg-primary-light/30 transition-colors disabled:opacity-50"
                      >
                        {savingPlan === apiPlan ? "Memproses..." : "Perpanjang +30 hari"}
                      </button>
                    )}
                  </div>
                ) : planActive && activePlan === "pro" && plan.planId === "premium" ? (
                  <div className="w-full py-3 text-center text-xs font-semibold text-muted bg-slate-50 rounded-2xl">
                    Kamu sudah di Pro · downgrade bisa setelah langganan Pro berakhir
                  </div>
                ) : pendingPlan === apiPlan ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 text-center text-xs font-bold text-amber-600 bg-amber-50 rounded-2xl">
                      Menunggu Pembayaran
                    </div>
                    <button
                      onClick={handleCancel}
                      className="w-full py-2 text-xs font-semibold text-red-500 border border-red-200 rounded-2xl hover:bg-red-50 transition-colors"
                    >
                      Batalkan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => apiPlan && handleUpgrade(apiPlan)}
                    disabled={savingPlan === apiPlan}
                    className={`btn-press w-full py-3 text-sm font-bold rounded-2xl transition-colors disabled:opacity-50 ${
                      plan.planId === "pro"
                        ? "bg-slate-800 text-white shadow-lg shadow-slate-800/20 hover:bg-slate-900"
                        : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                    }`}
                  >
                    {savingPlan === apiPlan ? "Memproses..." : plan.planId === "pro" ? `Upgrade Pro 👑` : `Upgrade Premium`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

    </main>
  );
}
