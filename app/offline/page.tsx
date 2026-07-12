import Navbar from "@/components/landing/Navbar";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center">
          <Logo size={64} showText={false} />
        </div>
      </div>
      <h1 className="text-xl font-extrabold text-slate-900 mb-2">Kamu Sedang Offline</h1>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
        Narehat butuh koneksi internet untuk menganalisis kulitmu. Coba periksa WiFi atau data seluler kamu.
      </p>
      <Link
        href="/"
        className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
      >
        <span className="material-symbols-outlined text-lg">refresh</span>
        Coba Lagi
      </Link>
    </div>
  );
}
