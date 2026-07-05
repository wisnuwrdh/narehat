import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-border-subtle">
        <Link href="/" className="text-2xl font-extrabold text-primary block text-center mb-8">
          Narehat
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Masuk</h1>
        <p className="text-sm text-muted text-center mb-8">Lanjutkan perjalananmu</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
            <input type="email" className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" placeholder="nama@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-press w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
            Masuk
          </button>
        </form>
        <p className="text-sm text-muted text-center mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
