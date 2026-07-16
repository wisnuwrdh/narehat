"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = [
  {
    id: 1,
    title: "Tipe kulit kamu apa?",
    sub: "Ini membantu kami memberikan insight yang lebih akurat.",
    type: "radio" as const,
    name: "skin-type",
    options: [
      { value: "oily", emoji: "🌿", label: "Berminyak", desc: "Wajah sering mengkilap, pori-pori besar" },
      { value: "dry", emoji: "💧", label: "Kering", desc: "Kulit terasa kencang, mudah mengelupas" },
      { value: "combination", emoji: "🌀", label: "Kombinasi", desc: "Berminyak di T-zone, kering di pipi" },
      { value: "normal", emoji: "✨", label: "Normal", desc: "Seimbang" },
      { value: "sensitive", emoji: "🌸", label: "Sensitif", desc: "Mudah merah, gatal, atau iritasi" },
    ],
  },
  {
    id: 2,
    title: "Seberapa parah jerawatmu?",
    sub: "Pilih yang paling mendeskripsikan kondisimu saat ini.",
    type: "radio" as const,
    name: "acne-severity",
    options: [
      { value: "mild", emoji: "🙂", label: "Ringan", desc: "Beberapa jerawat kecil, jarang muncul" },
      { value: "moderate", emoji: "😕", label: "Sedang", desc: "Jerawat terlihat jelas" },
      { value: "severe", emoji: "😟", label: "Parah", desc: "Banyak jerawat aktif, meradang" },
    ],
  },
  {
    id: 3,
    title: "Kebiasaan sehari-hari",
    sub: "Pilih yang sering kamu lakukan.",
    type: "checkbox" as const,
    name: "habits",
    options: [
      { value: "sleep-late", emoji: "🌙", label: "Sering begadang", desc: "Tidur kurang dari 6 jam" },
      { value: "less-water", emoji: "💧", label: "Jarang minum air", desc: "Kurang dari 1.5L sehari" },
      { value: "touch-face", emoji: "🤚", label: "Sering pegang muka", desc: "Tangan belum dicuci" },
      { value: "junk-food", emoji: "🍔", label: "Makan berminyak/manis", desc: "Fast food, gorengan" },
      { value: "stress", emoji: "😤", label: "Stress tinggi", desc: "Cemas atau tertekan" },
    ],
  },
  {
    id: 4,
    title: "Produk skincare",
    sub: "Produk apa yang sedang kamu pakai sekarang?",
    type: "text" as const,
    name: "products",
    fields: [
      { name: "cleanser", label: "Cleanser / Face Wash", placeholder: "Contoh: Cetaphil Gentle Skin Cleanser" },
      { name: "moisturizer", label: "Moisturizer", placeholder: "Contoh: Wardah Nature Daily" },
      { name: "sunscreen", label: "Sunscreen", placeholder: "Contoh: Skin Aqua UV" },
      { name: "treatment", label: "Treatment / Serum", placeholder: "Contoh: The Ordinary Niacinamide" },
    ],
  },
  {
    id: 5,
    title: "Goal kamu apa?",
    sub: "Pilih yang paling kamu inginkan saat ini.",
    type: "radio" as const,
    name: "goal",
    options: [
      { value: "clear_acne", emoji: "🎯", label: "Jerawat hilang", desc: "Mengurangi jerawat aktif" },
      { value: "fade_scars", emoji: "✨", label: "Bekas jerawat memudar", desc: "Mengurangi PIH" },
      { value: "brighter_skin", emoji: "🌟", label: "Kulit lebih cerah", desc: "Skin radiance" },
      { value: "all", emoji: "🚀", label: "Semua di atas", desc: "Jerawat, bekas, dan cerah" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    skin_type: "combination",
    acne_severity: "mild",
    habits: [] as string[],
    goal: "clear_acne",
  });
  const totalSteps = 5;
  const step = steps[currentStep - 1];

  const handleRadioChange = (name: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      habits: prev.habits.includes(value)
        ? prev.habits.filter((h) => h !== value)
        : [...prev.habits, value],
    }));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skin_type: answers.skin_type,
          acne_severity: answers.acne_severity,
          goal: answers.goal,
        }),
      });
    } catch {}
    setLoading(false);

    const planIntent = localStorage.getItem("narehat-plan-intent");
    if (planIntent === "premium_monthly" || planIntent === "premium_yearly") {
      localStorage.removeItem("narehat-plan-intent");
      try {
        const res = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planIntent }),
        });
        const data = await res.json();
        if (data.invoice_url) {
          router.push(data.invoice_url);
          return;
        }
      } catch {}
    }

    router.replace("/dashboard");
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else handleFinish();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevStep} className="btn-press p-2 -ml-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <span className="text-xs font-semibold text-muted">Langkah {currentStep}/{totalSteps}</span>
          <button onClick={() => router.replace("/dashboard")} className="btn-press p-2 -mr-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold">
            Lewati
          </button>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < currentStep ? "bg-primary" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pb-8 overflow-y-auto no-scrollbar">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h2>
          <p className="text-sm text-muted">{step.sub}</p>
        </div>

        {step.type === "radio" && step.options && (
          <div className="space-y-3">
            {step.options.map((opt) => (
              <label key={opt.value} className="btn-press flex items-center gap-4 p-4 bg-white border-2 border-border-subtle rounded-2xl cursor-pointer hover:border-primary/30 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-light/30">
                <input
                  type="radio"
                  name={step.name}
                  className="hidden peer"
                  value={opt.value}
                  checked={step.name === "skin-type" ? answers.skin_type === opt.value : step.name === "acne-severity" ? answers.acne_severity === opt.value : answers.goal === opt.value}
                  onChange={() => {
                    const key = step.name === "skin-type" ? "skin_type" : step.name === "acne-severity" ? "acne_severity" : "goal";
                    handleRadioChange(key, opt.value);
                  }}
                />
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl">{opt.emoji}</div>
                <div className="flex-1">
                  <span className="font-bold text-slate-800 block">{opt.label}</span>
                  <span className="text-xs text-muted">{opt.desc}</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              </label>
            ))}
          </div>
        )}

        {step.type === "checkbox" && step.options && (
          <div className="space-y-3">
            {step.options.map((opt) => (
              <label key={opt.value} className="btn-press flex items-center gap-4 p-4 bg-white border-2 border-border-subtle rounded-2xl cursor-pointer hover:border-primary/30 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-light/30">
                <input
                  type="checkbox"
                  className="hidden peer"
                  value={opt.value}
                  checked={answers.habits.includes(opt.value)}
                  onChange={() => handleCheckboxToggle(opt.value)}
                />
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl">{opt.emoji}</div>
                <div className="flex-1">
                  <span className="font-bold text-slate-800 block">{opt.label}</span>
                  <span className="text-xs text-muted">{opt.desc}</span>
                </div>
                <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              </label>
            ))}
          </div>
        )}

        {step.type === "text" && step.fields && (
          <div className="space-y-3">
            {step.fields.map((f) => (
              <div key={f.name} className="p-4 bg-white border border-border-subtle rounded-2xl">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">{f.label}</label>
                <input type="text" placeholder={f.placeholder} className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            ))}
            <button className="btn-press w-full py-3 mt-3 border-2 border-dashed border-border-light rounded-2xl text-sm font-semibold text-muted hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span> Tambah produk lain
            </button>
          </div>
        )}

        {step.id === 2 && (
          <div className="mt-6 p-4 border-2 border-dashed border-border-light rounded-2xl text-center">
            <span className="material-symbols-outlined text-3xl text-muted-light mb-2">add_a_photo</span>
            <p className="text-sm font-semibold text-slate-700">Upload foto kulit (opsional)</p>
            <p className="text-xs text-muted mt-1">Ini jadi baseline pertama untuk tracking progressmu</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-2 bg-white border-t border-border-subtle">
        <button
          onClick={nextStep}
          disabled={loading}
          className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : currentStep === totalSteps ? "Selesai" : "Lanjutkan"}
        </button>
      </div>
    </div>
  );
}
