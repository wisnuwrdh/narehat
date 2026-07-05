import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-border-subtle">
      <div className="container-narrow py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Link href="/" className="text-xl font-extrabold text-primary">
              Narehat
            </Link>
            <p className="text-sm text-muted mt-1">
              Jurnal jerawat cerdas berbasis AI
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              Tentang
            </Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">
              Harga
            </Link>
            <Link href="/register" className="hover:text-slate-900 transition-colors">
              Daftar
            </Link>
          </div>
        </div>
        <div className="text-center text-xs text-muted-light mt-8 pt-6 border-t border-border-subtle">
          &copy; {new Date().getFullYear()} Narehat. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
