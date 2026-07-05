"use client";

const notifications = [
  { icon: "notifications", color: "indigo", title: "Reminder Harian", sub: "Isi tracker setiap hari", checked: true },
  { icon: "lightbulb", color: "amber", title: "Insight Baru", sub: "Notifikasi saat ada insight", checked: true },
  { icon: "campaign", color: "rose", title: "Promo & Update", sub: "Info produk dan fitur baru", checked: false },
];

const themes = [
  { name: "Default", sub: "Soft navy", gradient: "from-[#3525cd] to-[#6366f1]", active: true },
  { name: "Feminine", sub: "Dusty rose", gradient: "from-[#be185d] to-[#f472b6]", active: false },
  { name: "Dark", sub: "Sleek", gradient: "from-[#1e293b] to-[#3b82f6]", active: false },
  { name: "Nature", sub: "Sage green", gradient: "from-[#059669] to-[#84cc16]", active: false },
];

const privacyItems = [
  { icon: "download", title: "Export Data", sub: "Download semua data kamu" },
  { icon: "delete", title: "Hapus Akun", sub: "Hapus semua data permanen" },
];

export default function SettingsPage() {
  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-muted">Kelola profil dan preferensimu</p>
      </header>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl flex items-center justify-center text-2xl">👤</div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900">Wisnu Prasetyo</h2>
              <p className="text-xs text-muted">wisnu@email.com</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-bold rounded-md">Kombinasi</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md">Sedang</span>
              </div>
            </div>
            <button className="btn-press p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-primary-light/60 to-indigo-50/30 border border-primary/10 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">diamond</span>
                <span className="text-xs font-bold text-primary">Premium Aktif</span>
              </div>
              <p className="text-sm font-bold text-slate-800">Plan Bulanan</p>
              <p className="text-xs text-muted mt-0.5">Berakhir 3 Agustus 2026</p>
            </div>
            <button className="btn-press px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors">Kelola</button>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1">Tema UI</h3>
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-muted mb-3">Pilih tampilan yang paling nyaman untukmu</p>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <label key={t.name} className={`btn-press relative p-4 border-2 rounded-2xl cursor-pointer transition-all ${t.active ? "border-primary bg-primary-light/20" : "border-border-subtle hover:border-slate-300"}`}>
                <input type="radio" name="theme" className="hidden" defaultChecked={t.active} />
                <div className={`w-full h-8 bg-gradient-to-r ${t.gradient} rounded-lg mb-2`} />
                <span className="text-xs font-bold text-slate-800 block">{t.name}</span>
                <span className="text-[10px] text-muted">{t.sub}</span>
                {t.active && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1">Notifikasi</h3>
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm space-y-4">
          {notifications.map((n, i) => (
            <div key={n.title}>
              {i > 0 && <div className="h-px bg-border-subtle -mx-5 mb-4" />}
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
                  <input type="checkbox" defaultChecked={n.checked} className="sr-only peer" />
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
          {privacyItems.map((p, i) => (
            <div key={p.title}>
              {i > 0 && <div className="h-px bg-border-subtle mx-4" />}
              <button className="btn-press w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
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

      <section className="px-6 mb-8">
        <div className="bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden">
          {[
            { icon: "help_outline", title: "Pusat Bantuan" },
            { icon: "policy", title: "Kebijakan Privasi" },
            { icon: "description", title: "Syarat & Ketentuan" },
          ].map((item, i) => (
            <div key={item.title}>
              {i > 0 && <div className="h-px bg-border-subtle mx-4" />}
              <button className="btn-press w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500 text-sm">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-700 block">{item.title}</span>
                </div>
                <span className="material-symbols-outlined text-muted-light text-lg">chevron_right</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-8">
        <button className="btn-press w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </button>
        <p className="text-center text-[10px] text-muted mt-4">Narehat v0.1 • &copy; 2026</p>
      </section>
    </main>
  );
}
