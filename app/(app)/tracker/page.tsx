"use client";

import { useState } from "react";
import {
  Bedtime,
  Droplets,
  Brain,
  Footprints,
  Sparkles,
  Camera,
  Edit3,
  Plus,
  Minus,
  Check,
  Save,
} from "lucide-react";
import AppHeader from "@/components/app/AppHeader";

export default function TrackerPage() {
  const [sleep, setSleep] = useState(6.2);
  const [water, setWater] = useState(1.5);
  const [stress, setStress] = useState(3);
  const [exercise, setExercise] = useState(30);
  const [morningRoutine, setMorningRoutine] = useState(true);
  const [nightRoutine, setNightRoutine] = useState(true);
  const [notes, setNotes] = useState("");

  const stressEmojis = ["😌", "😐", "😤", "😫", "🤯"];
  const stressLabels = ["Santai", "Normal", "Sedang", "Tinggi", "Ekstrem"];

  const dates = [
    { day: "Sen", date: "30", active: false },
    { day: "Sel", date: "1", active: false },
    { day: "Rab", date: "2", active: false },
    { day: "Kam", date: "3", active: true },
    { day: "Jum", date: "4", active: false },
    { day: "Sab", date: "5", active: false },
  ];

  return (
    <div className="pb-36">
      <AppHeader
        title="Tracker Harian"
        subtitle="Catat kebiasaanmu hari ini"
        rightContent={
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border-light">
            <span className="text-lg text-primary">📅</span>
            <span className="text-sm font-semibold text-slate-700">Hari ini</span>
          </div>
        }
      />

      {/* Date Selector */}
      <section className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {dates.map((d, i) => (
            <button
              key={i}
              className={`btn-press min-w-[60px] py-2 px-3 rounded-xl text-center ${
                d.active
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white border border-border-subtle opacity-50"
              }`}
            >
              <span className={`text-[10px] block ${d.active ? "text-white/70" : "text-muted"}`}>{d.day}</span>
              <span className={`text-sm font-bold ${d.active ? "" : "text-slate-700"}`}>{d.date}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Sleep */}
      <TrackerCard
        icon={Bedtime}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-500"
        title="Kualitas Tidur"
        subtitle="Berapa jam kamu tidur semalam?"
      >
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => setSleep(Math.max(0, sleep - 0.5))}
            className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100"
          >
            <Minus className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-extrabold text-slate-900">{sleep}</span>
            <span className="text-sm text-muted ml-1">jam</span>
          </div>
          <button
            onClick={() => setSleep(Math.min(12, sleep + 0.5))}
            className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100"
          >
            <Plus className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          value={sleep}
          onChange={(e) => setSleep(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-light mt-1">
          <span>0 jam</span>
          <span className="text-primary font-semibold">Target: 8 jam</span>
          <span>12 jam</span>
        </div>
      </TrackerCard>

      {/* Water */}
      <TrackerCard
        icon={Droplets}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        title="Minum Air"
        subtitle="Seberapa banyak air yang kamu minum?"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setWater(Math.max(0, water - 0.25))}
            className="btn-press w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 hover:bg-blue-100"
          >
            <Minus className="w-5 h-5 text-blue-500" />
          </button>
          <div className="text-center min-w-[100px]">
            <span className="text-3xl font-extrabold text-slate-900">{water.toFixed(1)}</span>
            <span className="text-sm text-muted ml-1">L</span>
          </div>
          <button
            onClick={() => setWater(Math.min(5, water + 0.25))}
            className="btn-press w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 hover:bg-blue-100"
          >
            <Plus className="w-5 h-5 text-blue-500" />
          </button>
        </div>
        {/* Visual cups */}
        <div className="flex justify-center gap-2">
          {[0.5, 1.0, 1.5, 2.0, 2.5].map((level, i) => (
            <div
              key={i}
              className={`w-8 h-10 rounded-b-lg rounded-t-sm relative overflow-hidden ${
                water >= level ? "bg-blue-400" : "bg-slate-100 border-2 border-dashed border-slate-200"
              }`}
            >
              {water >= level && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-500"
                  style={{ height: water >= level + 0.5 ? "100%" : `${(water % 0.5) / 0.5 * 100}%` }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted mt-2">Target: 2.5L (5 gelas)</p>
      </TrackerCard>

      {/* Stress */}
      <TrackerCard
        icon={Brain}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        title="Tingkat Stress"
        subtitle="Seberapa stress kamu hari ini?"
      >
        <div className="flex justify-between items-center mb-3 px-2">
          {stressEmojis.map((emoji, i) => (
            <span key={i} className="text-2xl">{emoji}</span>
          ))}
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={stress}
          onChange={(e) => setStress(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-light mt-1 px-1">
          <span>Santai</span>
          <span>Sedang</span>
          <span>Ekstrem</span>
        </div>
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
            {stressLabels[stress - 1]} ({stress}/5)
          </span>
        </div>
      </TrackerCard>

      {/* Exercise */}
      <TrackerCard
        icon={Footprints}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        title="Olahraga"
        subtitle="Berapa menit kamu berolahraga?"
      >
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => setExercise(Math.max(0, exercise - 5))}
            className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100"
          >
            <Minus className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-extrabold text-slate-900">{exercise}</span>
            <span className="text-sm text-muted ml-1">menit</span>
          </div>
          <button
            onClick={() => setExercise(Math.min(120, exercise + 5))}
            className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100"
          >
            <Plus className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="120"
          step="5"
          value={exercise}
          onChange={(e) => setExercise(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-light mt-1">
          <span>0 mnt</span>
          <span className="text-emerald-600 font-semibold">Target: 30 mnt ✅</span>
          <span>120 mnt</span>
        </div>
      </TrackerCard>

      {/* Skincare Routine */}
      <TrackerCard
        icon={Sparkles}
        iconBg="bg-violet-50"
        iconColor="text-violet-500"
        title="Rutinitas Skincare"
        subtitle="Centang yang sudah kamu lakukan"
      >
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={morningRoutine}
              onChange={(e) => setMorningRoutine(e.target.checked)}
              className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-slate-700 block">Pagi</span>
              <span className="text-xs text-muted">Cleanser → Toner → Moisturizer → Sunscreen</span>
            </div>
            {morningRoutine && <Check className="w-5 h-5 text-emerald-500" />}
          </label>
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={nightRoutine}
              onChange={(e) => setNightRoutine(e.target.checked)}
              className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-slate-700 block">Malam</span>
              <span className="text-xs text-muted">Double cleanse → Toner → Serum → Moisturizer</span>
            </div>
            {nightRoutine && <Check className="w-5 h-5 text-emerald-500" />}
          </label>
        </div>
      </TrackerCard>

      {/* Photo Upload */}
      <TrackerCard
        icon={Camera}
        iconBg="bg-rose-50"
        iconColor="text-rose-500"
        title="Foto Kulit"
        subtitle="Upload foto untuk tracking progress"
      >
        <button className="btn-press w-full py-8 border-2 border-dashed border-border-light rounded-2xl flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-primary-light/10 transition-all">
          <Camera className="w-8 h-8 text-muted-light" />
          <span className="text-sm font-semibold text-slate-600">Tap untuk upload foto</span>
          <span className="text-xs text-muted">Front face, good lighting, no filter</span>
        </button>
      </TrackerCard>

      {/* Notes */}
      <TrackerCard
        icon={Edit3}
        iconBg="bg-slate-50"
        iconColor="text-slate-500"
        title="Catatan"
        subtitle="Ada yang mau dicatat?"
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: Hari ini makan pedas, jerawat baru di pipi kiri..."
          className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
        />
      </TrackerCard>

      {/* Save Button */}
      <div className="px-6 pb-8">
        <button className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Simpan Catatan Hari Ini
        </button>
      </div>
    </div>
  );
}

// Reusable Tracker Card Component
function TrackerCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 mb-6">
      <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-muted">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
