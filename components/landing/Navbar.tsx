import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle">
      <nav className="container-narrow flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-extrabold text-primary">
          Narehat
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-sm font-medium text-muted hover:text-slate-900 transition-colors">
            Tentang
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted hover:text-slate-900 transition-colors">
            Harga
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-900 hover:text-primary transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="btn-press text-sm font-bold px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            Mulai Gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}
