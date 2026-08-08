"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/contexts/ToastContext";

const skinOptions = [
  { value: "oily", emoji: "🌿", label: "Berminyak", desc: "Wajah sering mengkilap, pori-pori besar" },
  { value: "dry", emoji: "💧", label: "Kering", desc: "Kulit terasa kencang, mudah mengelupas" },
  { value: "combination", emoji: "🌀", label: "Kombinasi", desc: "Berminyak di T-zone, kering di pipi" },
  { value: "normal", emoji: "✨", label: "Normal", desc: "Seimbang" },
  { value: "sensitive", emoji: "🌸", label: "Sensitif", desc: "Mudah merah, gatal, atau iritasi" },
];

const severityOptions = [
  { value: "mild", emoji: "🙂", label: "Ringan", desc: "Beberapa jerawat kecil, jarang muncul" },
  { value: "moderate", emoji: "😕", label: "Sedang", desc: "Jerawat terlihat jelas" },
  { value: "severe", emoji: "😟", label: "Parah", desc: "Banyak jerawat aktif, meradang" },
];

const goalOptions = [
  { value: "clear_acne", emoji: "🎯", label: "Jerawat hilang", desc: "Mengurangi jerawat aktif" },
  { value: "fade_scars", emoji: "✨", label: "Bekas memudar", desc: "Mengurangi PIH" },
  { value: "brighter_skin", emoji: "🌟", label: "Kulit lebih cerah", desc: "Skin radiance" },
  { value: "anti_aging", emoji: "⏳", label: "Anti-aging", desc: "Mencegah tanda penuaan" },
  { value: "barrier", emoji: "🛡️", label: "Skin barrier", desc: "Memperbaiki lapisan kulit" },
  { value: "all", emoji: "🚀", label: "Semua di atas", desc: "Semua kebutuhan di atas" },
];

interface Option {
  value: string;
  emoji: string;
  label: string;
  desc: string;
}

function OptionCard({ opt, selected, onSelect }: { opt: Option; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`btn-press flex items-center gap-4 p-4 w-full bg-white border-2 rounded-2xl text-left cursor-pointer hover:border-primary/30 transition-all ${
        selected ? "border-primary bg-primary-light/30" : "border-border-subtle"
      }`}
    >
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl">{opt.emoji}</div>
      <div className="flex-1">
        <span className="font-bold text-slate-800 block">{opt.label}</span>
        <span className="text-xs text-muted">{opt.desc}</span>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-slate-300"}`}>
        <svg className={`w-3 h-3 text-white ${selected ? "opacity-100" : "opacity-0"}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      </div>
    </button>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [skinType, setSkinType] = useState(user.skin_type);
  const [severity, setSeverity] = useState(user.acne_severity);
  const [goal, setGoal] = useState(user.goal);
  const [saving, setSaving] = useState(false);

  const dirty = name !== user.name || skinType !== user.skin_type || severity !== user.acne_severity || goal !== user.goal;

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Nama tidak boleh kosong", "error");
      return;
    }
    setSaving(true);
    await updateUser({ name: name.trim(), skin_type: skinType, acne_severity: severity, goal });
    setSaving(false);
    showToast("Profil berhasil diperbarui");
  };

  return (
    <main className="max-w-md md:max-w-4xl mx-auto pb-8">
      <header className="px-6 pt-6 pb-2 flex items-center gap-3">
        <Link href="/settings" className="p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit Profil</h1>
          <p className="text-sm text-muted">Sesuaikan data diri dan kondisi kulitmu</p>
        </div>
      </header>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
            <img src="/avatar-default.svg" alt="Avatar" className="w-12 h-12" />
          </div>
          <h2 className="font-bold text-slate-900 break-all text-center">{user.name}</h2>
          <p className="text-xs text-muted break-all text-center">{user.email}</p>
        </div>
      </section>

      <section className="px-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className="w-full px-4 py-3.5 bg-white border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Tipe Kulit</label>
          <div className="space-y-3">
            {skinOptions.map((opt) => (
              <OptionCard key={opt.value} opt={opt} selected={skinType === opt.value} onSelect={() => setSkinType(opt.value)} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Kondisi Jerawat Saat Ini</label>
          <div className="space-y-3">
            {severityOptions.map((opt) => (
              <OptionCard key={opt.value} opt={opt} selected={severity === opt.value} onSelect={() => setSeverity(opt.value)} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Goal Kamu</label>
          <div className="space-y-3">
            {goalOptions.map((opt) => (
              <OptionCard key={opt.value} opt={opt} selected={goal === opt.value} onSelect={() => setGoal(opt.value)} />
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`btn-press w-full py-4 rounded-2xl font-bold text-sm transition-all ${
            dirty
              ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </section>
    </main>
  );
}
