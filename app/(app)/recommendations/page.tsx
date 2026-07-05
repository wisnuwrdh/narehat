export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Rekomendasi</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-border-subtle">
            <div className="w-full h-32 bg-border-subtle rounded-xl mb-3" />
            <h3 className="font-semibold text-slate-900">Produk Skincare #{i}</h3>
            <p className="text-sm text-muted mt-1">Rekomendasi akan muncul berdasarkan kondisi kulitmu</p>
          </div>
        ))}
      </div>
    </div>
  );
}
