import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Settings</h1>
      <div className="max-w-lg space-y-4">
        <div className="bg-slate-50 rounded-2xl p-4 border border-border-subtle">
          <p className="font-medium text-slate-900">Nama</p>
          <p className="text-sm text-muted">--</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-border-subtle">
          <p className="font-medium text-slate-900">Email</p>
          <p className="text-sm text-muted">--</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-border-subtle">
          <p className="font-medium text-slate-900">Plan</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-light text-primary text-xs font-bold rounded-full">Gratis</span>
        </div>
        <Link
          href="/dashboard"
          className="block text-center px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
