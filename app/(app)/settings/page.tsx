"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
const planLabels: Record<string, string> = {
  free: "Gratis",
  premium_monthly: "Premium Bulanan",
  premium_yearly: "Premium Tahunan",
  pro_monthly: "Pro Bulanan",
  pro_yearly: "Pro Tahunan",
};

const goalLabels: Record<string, string> = {
  clear_acne: "Jerawat Hilang",
  fade_scars: "Bekas Memudar",
  brighter_skin: "Kulit Cerah",
  all: "Semua",
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [notifications, setNotifications] = useState([
    user.notif_reminder,
    user.notif_insight,
    user.notif_promo,
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [toast, setToast] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleExport = () => {
    showToast("Fitur export data akan segera hadir");
  };

  const handleDelete = async () => {
    if (deleteInput !== "HAPUS") return;
    try {
      await fetch("/api/user", { method: "DELETE" });
    } catch {}
    showToast("Akun berhasil dihapus. Semua data telah dibersihkan.");
    setTimeout(() => router.push("/"), 2000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const infoItems = [
    { key: "help", icon: "help_outline", title: "Pusat Bantuan", content: "Hubungi kami di support@narehat.id atau melalui chat di aplikasi. Tim kami aktif Senin-Jumat pukul 09:00-18:00 WIB." },
    { key: "privacy", icon: "policy", title: "Kebijakan Privasi", content: "Data kamu dienkripsi end-to-end. Foto kulit tidak akan digunakan untuk training AI tanpa izin. Kami mematuhi UU Perlindungan Data Pribadi Indonesia." },
    { key: "terms", icon: "description", title: "Syarat & Ketentuan", content: "Dengan menggunakan Narehat, kamu setuju bahwa informasi yang diberikan bersifat edukatif dan bukan pengganti diagnosis medis profesional." },
  ];

  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-muted">Kelola profil dan preferensimu</p>
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
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/avatar-default.svg" alt="Avatar" className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900">{user.name}</h2>
              <p className="text-xs text-muted">{user.email}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-bold rounded-md">{skinLabels[user.skin_type] || "Kombinasi"}</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md">{severityLabels[user.acne_severity] || "Sedang"}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">{goalLabels[user.goal] || "Semua"}</span>
              </div>
            </div>
            <Link href="/profile" className="btn-press p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-lg">edit</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-primary-light/60 to-indigo-50/30 border border-primary/10 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-sm">diamond</span>
                  <span className="text-xs font-bold text-primary">
                    {user.plan === "free" ? "Gratis" : user.plan.includes("pro") ? "Pro Aktif" : "Premium Aktif"}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">Plan {planLabels[user.plan] || "Gratis"}</p>
                <p className="text-xs text-muted mt-0.5">
                  {user.plan !== "free" ? (user.plan.includes("pro") ? "Semua fitur Pro tersedia" : "Nikmati semua fitur premium") : "Upgrade untuk fitur lengkap"}
                </p>
              </div>
              <Link
                href="/subscription"
                className={`btn-press px-4 py-2 text-xs font-bold rounded-xl transition-colors ${user.plan !== "free" ? "bg-primary text-white hover:bg-primary/90" : "bg-primary text-white hover:bg-primary/90"}`}
              >
                {user.plan !== "free" ? "Kelola Plan" : "Lihat Plan"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1">Notifikasi</h3>
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          {[
            { icon: "notifications", color: "indigo", title: "Reminder Harian", sub: "Isi tracker setiap hari" },
            { icon: "lightbulb", color: "amber", title: "Insight Baru", sub: "Notifikasi saat ada insight" },
            { icon: "campaign", color: "rose", title: "Promo & Update", sub: "Info produk dan fitur baru" },
          ].map((n, i) => (
            <div key={n.title}>
              {i > 0 && <div className="h-px bg-border-subtle -mx-5 my-4" />}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${n.color === "indigo" ? "bg-indigo-50" : n.color === "amber" ? "bg-amber-50" : "bg-rose-50"}`}>
                    <span className={`material-symbols-outlined text-sm ${n.color === "indigo" ? "text-indigo-500" : n.color === "amber" ? "text-amber-500" : "text-rose-500"}`}>{n.icon}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">{n.title}</span>
                    <span className="text-[10px] text-muted">{n.sub}</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifications[i]} onChange={() => {
                    const idx = i;
                    const keys = ["notif_reminder", "notif_insight", "notif_promo"];
                    const nextVal = !notifications[idx];
                    setNotifications((prev) => { const next = [...prev]; next[idx] = nextVal; return next; });
                    updateUser({ [keys[idx]]: nextVal } as Record<string, unknown>);
                  }} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1">Privasi & Data</h3>
        <div className="bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden">
          {[
            { icon: "download", title: "Export Data", sub: "Download semua data kamu", action: handleExport },
            { icon: "delete", title: "Hapus Akun", sub: "Hapus semua data permanen", action: () => setShowDeleteConfirm(true) },
          ].map((p, i) => (
            <div key={p.title}>
              {i > 0 && <div className="h-px bg-border-subtle mx-4" />}
              <button onClick={p.action} className="btn-press w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500 text-sm">{p.icon}</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-700 block">{p.title}</span>
                  <span className="text-[10px] text-muted">{p.sub}</span>
                </div>
                <span className="material-symbols-outlined text-muted-light text-lg">chevron_right</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {showDeleteConfirm && (
        <section className="px-6 mb-6">
          <div className="bg-white border-2 border-red-200 rounded-3xl p-5 shadow-lg animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-red-500">warning</span>
              <h3 className="font-bold text-red-600 text-sm">Konfirmasi Hapus Akun</h3>
            </div>
            <p className="text-xs text-muted mb-3">Semua data akan dihapus permanen dan tidak bisa dikembalikan. Ketik <strong>HAPUS</strong> untuk melanjutkan.</p>
            <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="Ketik HAPUS..." className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all mb-3" />
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleteInput !== "HAPUS"} className={`btn-press flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${deleteInput === "HAPUS" ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-100 text-red-300 cursor-not-allowed"}`}>
                Hapus Akun
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }} className="btn-press flex-1 py-2.5 bg-white border border-border-light text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 mb-8">
        <div className="bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden">
          {infoItems.map((item, i) => (
            <div key={item.key}>
              {i > 0 && <div className="h-px bg-border-subtle mx-4" />}
              <div>
                <button onClick={() => setExpandedItem(expandedItem === item.key ? null : item.key)} className="btn-press w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500 text-sm">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-700 block">{item.title}</span>
                  </div>
                  <span className={`material-symbols-outlined text-muted-light text-lg transition-transform ${expandedItem === item.key ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                {expandedItem === item.key && (
                  <div className="px-4 pb-4 animate-scale-in">
                    <p className="text-xs text-muted leading-relaxed">{item.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-8">
        <button onClick={handleLogout} className="btn-press w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </button>
        <p className="text-center text-[10px] text-muted mt-4">Narehat v0.2 &bull; &copy; {new Date().getFullYear()}</p>
      </section>
    </main>
  );
}
