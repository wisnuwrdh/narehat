export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Progress</h1>
      <p className="text-muted mb-4">Grafik tren dan perbandingan foto akan muncul di sini.</p>
      <div className="bg-slate-50 rounded-2xl p-12 text-center border border-border-subtle">
        <p className="text-muted-light">Upload foto pertama kamu untuk mulai tracking progress</p>
      </div>
    </div>
  );
}
