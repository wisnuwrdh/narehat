"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

const skinLabels: Record<string, string> = {
  oily: "Berminyak",
  dry: "Kering",
  combination: "Kombinasi",
  normal: "Normal",
  sensitive: "Sensitif",
};

const severityLabels: Record<string, string> = {
  mild: "Ringan",
  moderate: "Sedang",
  severe: "Parah",
};

const goalLabels: Record<string, string> = {
  clear_acne: "Jerawat Hilang",
  fade_scars: "Bekas Memudar",
  brighter_skin: "Kulit Cerah",
  all: "Semua",
};

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name);
  const [skinType, setSkinType] = useState(user.skin_type);
  const [severity, setSeverity] = useState(user.acne_severity);
  const [goal, setGoal] = useState(user.goal);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const dirty = name !== user.name || skinType !== user.skin_type || severity !== user.acne_severity || goal !== user.goal;

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Nama tidak boleh kosong");
      return;
    }
    setSaving(true);
    await updateUser({ name: name.trim(), skin_type: skinType, acne_severity: severity, goal });
    setSaving(false);
    showToast("Profil berhasil diperbarui");
  };

  return (
    <main className="max-w-md mx-auto pb-8">
      <header className="px-6 pt-6 pb-2 flex items-center gap-3">
        <Link href="/settings" className="p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit Profil</h1>
          <p className="text-sm text-muted">Sesuaikan data diri dan kondisi kulitmu</p>
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
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
            <img src="/avatar-default.svg" alt="Avatar" className="w-12 h-12" />
          </div>
          <h2 className="font-bold text-slate-900">{user.name}</h2>
          <p className="text-xs text-muted">{user.email}</p>
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
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(skinLabels).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSkinType(k)}
                className={`py-3 text-xs font-semibold rounded-xl border transition-all ${
                  skinType === k
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-slate-600 border-border-light hover:border-primary/30"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Kondisi Jerawat Saat Ini</label>
          <div className="flex gap-2">
            {Object.entries(severityLabels).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSeverity(k)}
                className={`flex-1 py-3 text-xs font-semibold rounded-xl border transition-all ${
                  severity === k
                    ? k === "severe" ? "bg-red-500 text-white border-red-500 shadow-sm" : k === "moderate" ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                    : "bg-white text-slate-600 border-border-light hover:border-primary/30"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Goal Kamu</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(goalLabels).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setGoal(k)}
                className={`py-3 text-xs font-semibold rounded-xl border transition-all ${
                  goal === k
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-slate-600 border-border-light hover:border-primary/30"
                }`}
              >
                {v}
              </button>
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
