"use client";

export default function TrackerPage() {
  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tracker Harian</h1>
          <p className="text-sm text-muted">Catat kebiasaanmu hari ini</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border-light">
          <span className="material-symbols-outlined text-lg text-primary">calendar_today</span>
          <span className="text-sm font-semibold text-slate-700">Hari ini</span>
        </div>
      </header>

      <section className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { day: "Sen", date: "30", active: false, past: true },
            { day: "Sel", date: "1", active: false, past: true },
            { day: "Rab", date: "2", active: false, past: true },
            { day: "Kam", date: "3", active: true, past: false },
            { day: "Jum", date: "4", active: false, past: false },
            { day: "Sab", date: "5", active: false, past: false },
          ].map((d) => (
            <button
              key={d.date}
              className={`btn-press min-w-[60px] py-2 px-3 rounded-xl text-center ${d.active ? "bg-primary text-white shadow-lg shadow-primary/20" : d.past ? "bg-white border border-border-subtle opacity-50" : "bg-white border border-border-subtle"}`}
            >
              <span className={`text-[10px] block ${d.active ? "text-white/70" : "text-muted"}`}>{d.day}</span>
              <span className={`text-sm font-bold ${d.active ? "" : "text-slate-700"}`}>{d.date}</span>
            </button>
          ))}
        </div>
      </section>

      {[
        { icon: "bedtime", color: "indigo", title: "Kualitas Tidur", sub: "Berapa jam kamu tidur semalam?", unit: "jam", min: 0, max: 12, step: "0.5", value: "6.2", target: "Target: 8 jam", bg: "bg-indigo-50", text: "text-indigo-500" },
        { icon: "directions_run", color: "emerald", title: "Olahraga", sub: "Berapa menit kamu berolahraga?", unit: "menit", min: 0, max: 120, step: "5", value: "30", target: "Target: 30 mnt \u2705", bg: "bg-emerald-50", text: "text-emerald-500", targetColor: "text-emerald-600" },
      ].map((s) => (
        <section key={s.title} className="px-6 mb-6">
          <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <span className={`material-symbols-outlined ${s.text}`}>{s.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{s.title}</h3>
                <p className="text-xs text-muted">{s.sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <button className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100">
                <span className="material-symbols-outlined text-slate-600">remove</span>
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-extrabold text-slate-900">{s.value}</span>
                <span className="text-sm text-muted ml-1">{s.unit}</span>
              </div>
              <button className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100">
                <span className="material-symbols-outlined text-slate-600">add</span>
              </button>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} defaultValue={s.value} className="w-full" />
            <div className="flex justify-between text-[10px] text-muted-light mt-1">
              <span>0 {s.unit}</span>
              <span className={`font-semibold ${s.targetColor || "text-primary"}`}>{s.target}</span>
              <span>{s.max} {s.unit}</span>
            </div>
          </div>
        </section>
      ))}

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500">water_drop</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Minum Air</h3>
              <p className="text-xs text-muted">Seberapa banyak air yang kamu minum?</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button className="btn-press w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 hover:bg-blue-100">
              <span className="material-symbols-outlined text-blue-500">remove</span>
            </button>
            <div className="text-center min-w-[100px]">
              <span className="text-3xl font-extrabold text-slate-900">1.5</span>
              <span className="text-sm text-muted ml-1">L</span>
            </div>
            <button className="btn-press w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 hover:bg-blue-100">
              <span className="material-symbols-outlined text-blue-500">add</span>
            </button>
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-10 bg-blue-400 rounded-b-lg rounded-t-sm relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-blue-500" style={{ height: i <= 2 ? "75%" : "50%" }} />
              </div>
            ))}
            {[4, 5].map((i) => (
              <div key={i} className="w-8 h-10 bg-slate-100 rounded-b-lg rounded-t-sm border-2 border-dashed border-slate-200" />
            ))}
          </div>
          <p className="text-center text-xs text-muted mt-2">Target: 2.5L (5 gelas)</p>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Tingkat Stress</h3>
              <p className="text-xs text-muted">Seberapa stress kamu hari ini?</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-2xl">😌</span><span className="text-2xl">😐</span><span className="text-2xl">😤</span><span className="text-2xl">😫</span><span className="text-2xl">🤯</span>
          </div>
          <input type="range" min="1" max="5" step="1" defaultValue="3" className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-light mt-1 px-1">
            <span>Santai</span><span>Sedang</span><span>Ekstrem</span>
          </div>
          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">Sedang (3/5)</span>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-500">spa</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Rutinitas Skincare</h3>
              <p className="text-xs text-muted">Centang yang sudah kamu lakukan</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Pagi", sub: "Cleanser \u2192 Toner \u2192 Moisturizer \u2192 Sunscreen", checked: true },
              { label: "Malam", sub: "Double cleanse \u2192 Toner \u2192 Serum \u2192 Moisturizer", checked: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary" />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-700 block">{item.label}</span>
                  <span className="text-xs text-muted">{item.sub}</span>
                </div>
                <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-rose-500">photo_camera</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Foto Kulit</h3>
              <p className="text-xs text-muted">Upload foto untuk tracking progress</p>
            </div>
          </div>
          <button className="btn-press w-full py-8 border-2 border-dashed border-border-light rounded-2xl flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-primary-light/10 transition-all">
            <span className="material-symbols-outlined text-3xl text-muted-light">add_a_photo</span>
            <span className="text-sm font-semibold text-slate-600">Tap untuk upload foto</span>
            <span className="text-xs text-muted">Front face, good lighting, no filter</span>
          </button>
        </div>
      </section>

      <section className="px-6 mb-8">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500">edit_note</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Catatan</h3>
              <p className="text-xs text-muted">Ada yang mau dicatat?</p>
            </div>
          </div>
          <textarea placeholder="Contoh: Hari ini makan pedas, jerawat baru di pipi kiri..." className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24" />
        </div>
      </section>

      <div className="px-6 pb-8">
        <button className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">save</span>
          Simpan Catatan Hari Ini
        </button>
      </div>
    </main>
  );
}
