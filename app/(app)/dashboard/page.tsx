export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Halo!</h1>
      <p className="text-muted mb-8">Ini ringkasan kondisi kulitmu hari ini.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-2xl p-6 border border-border-subtle">
          <p className="text-sm text-muted">Skor Kulit</p>
          <p className="text-3xl font-extrabold text-primary mt-2">--</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 border border-border-subtle">
          <p className="text-sm text-muted">Streak Harian</p>
          <p className="text-3xl font-extrabold text-primary mt-2">0 hari</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 border border-border-subtle">
          <p className="text-sm text-muted">Insight Baru</p>
          <p className="text-3xl font-extrabold text-primary mt-2">0</p>
        </div>
      </div>
    </div>
  );
}
