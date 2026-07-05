export default function TrackerPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Tracker Harian</h1>
      <div className="max-w-lg">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-border-subtle">
            <label className="block text-sm font-medium text-slate-900 mb-1">Jam Tidur</label>
            <input type="number" className="w-full px-4 py-2 rounded-xl border border-border-subtle text-sm" placeholder="0" />
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-border-subtle">
            <label className="block text-sm font-medium text-slate-900 mb-1">Air (ml)</label>
            <input type="number" className="w-full px-4 py-2 rounded-xl border border-border-subtle text-sm" placeholder="0" />
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-border-subtle">
            <label className="block text-sm font-medium text-slate-900 mb-1">Tingkat Stres (1-10)</label>
            <input type="range" min="1" max="10" className="w-full" />
          </div>
        </div>
        <button className="btn-press mt-6 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
          Simpan
        </button>
      </div>
    </div>
  );
}
