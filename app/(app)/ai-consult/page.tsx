export default function AIConsultPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Konsultasi AI</h1>
      <div className="max-w-2xl">
        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-border-subtle mb-4">
          <p className="text-muted">Tanya apa saja tentang jerawatmu — AI kami akan menjawab berdasarkan jurnal dermatologi.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            placeholder="Tanyakan sesuatu..."
          />
          <button className="btn-press px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
            Kirim
          </button>
        </div>
        <p className="text-xs text-muted-light mt-2 text-center">Fitur Premium</p>
      </div>
    </div>
  );
}
