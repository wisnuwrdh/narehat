"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Camera,
} from "lucide-react";

const steps = [
  { id: 1, title: "Tipe Kulit", subtitle: "Pilih tipe kulit kamu" },
  { id: 2, title: "Kondisi Jerawat", subtitle: "Seberapa parah jerawatmu saat ini?" },
  { id: 3, title: "Kebiasaan Harian", subtitle: "Pilih yang sering kamu lakukan" },
  { id: 4, title: "Produk Skincare", subtitle: "Apa yang sekarang kamu pakai?" },
  { id: 5, title: "Goal", subtitle: "Apa yang paling kamu inginkan?" },
];

const skinTypes = ["Berminyak", "Kering", "Kombinasi", "Normal", "Sensitif"];
const acneSeverities = ["Ringan", "Sedang", "Parah"];
const habits = [
  "Sering begadang",
  "Jarang minum air",
  "Sering pegang muka",
  "Makan makanan berminyak/manis",
  "Jarang ganti sarung bantal",
  "Stress tinggi",
  "Jarang olahraga",
];
const goals = [
  "Jerawat hilang",
  "Bekas jerawat memudar",
  "Kulit lebih cerah",
  "Semua di atas",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [skinType, setSkinType] = useState("");
  const [acneSeverity, setAcneSeverity] = useState("");
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [products, setProducts] = useState("");
  const [goal, setGoal] = useState("");

  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-press p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-muted">
            {currentStep + 1}/{steps.length}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{steps[currentStep].title}</h1>
          <p className="text-sm text-muted mt-1">{steps[currentStep].subtitle}</p>
        </div>

        {/* Step 1: Skin Type */}
        {currentStep === 0 && (
          <div className="space-y-3">
            {skinTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSkinType(type)}
                className={`btn-press w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  skinType === type
                    ? "border-primary bg-primary-light/20"
                    : "border-border-subtle hover:border-primary/30 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    skinType === type ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="flex-1 text-left font-semibold text-slate-700">{type}</span>
                {skinType === type && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Acne Severity */}
        {currentStep === 1 && (
          <div className="space-y-3">
            {acneSeverities.map((severity) => (
              <button
                key={severity}
                onClick={() => setAcneSeverity(severity)}
                className={`btn-press w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  acneSeverity === severity
                    ? "border-primary bg-primary-light/20"
                    : "border-border-subtle hover:border-primary/30 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    acneSeverity === severity ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <span className="text-lg">
                    {severity === "Ringan" ? "🟡" : severity === "Sedang" ? "🟠" : "🔴"}
                  </span>
                </div>
                <span className="flex-1 text-left font-semibold text-slate-700">{severity}</span>
                {acneSeverity === severity && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-border-light">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-muted" />
                <span className="text-xs font-semibold text-muted">Upload foto (opsional)</span>
              </div>
              <button className="btn-press w-full py-6 border-2 border-dashed border-border-light rounded-xl flex flex-col items-center gap-1 hover:border-primary/30 hover:bg-primary-light/10 transition-all">
                <Camera className="w-6 h-6 text-muted-light" />
                <span className="text-xs text-muted">Tap untuk upload foto baseline</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Habits */}
        {currentStep === 2 && (
          <div className="space-y-3">
            {habits.map((habit) => (
              <label
                key={habit}
                className={`btn-press flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedHabits.includes(habit)
                    ? "border-primary bg-primary-light/20"
                    : "border-border-subtle hover:border-primary/30 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedHabits.includes(habit)}
                  onChange={() => toggleHabit(habit)}
                  className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary"
                />
                <span className="flex-1 text-sm font-semibold text-slate-700">{habit}</span>
              </label>
            ))}
          </div>
        )}

        {/* Step 4: Products */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <textarea
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="Contoh: Cetaphil Cleanser, The Ordinary Niacinamide, Wardah Sunscreen..."
              className="w-full px-4 py-4 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-32"
            />
            <p className="text-xs text-muted px-1">
              Tulis produk skincare yang sedang kamu pakai saat ini, pisahkan dengan koma.
            </p>
          </div>
        )}

        {/* Step 5: Goal */}
        {currentStep === 4 && (
          <div className="space-y-3">
            {goals.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`btn-press w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  goal === g
                    ? "border-primary bg-primary-light/20"
                    : "border-border-subtle hover:border-primary/30 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    goal === g ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="flex-1 text-left font-semibold text-slate-700">{g}</span>
                {goal === g && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="px-6 py-6">
        <button
          onClick={handleNext}
          className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <Sparkles className="w-5 h-5" />
              Mulai Perjalanan
            </>
          ) : (
            <>
              Lanjutkan
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
