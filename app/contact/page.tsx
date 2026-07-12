import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-5">
        <div className="container-narrow max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mb-6">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali
          </Link>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
              Kontak
            </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Hubungi Kami</h1>
          <p className="text-sm text-muted mb-10 max-w-md mx-auto leading-relaxed">
            Punya pertanyaan, masukan, atau butuh bantuan? Kami siap membantu.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-white border border-border-subtle rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary text-2xl">mail</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Email</h3>
              <p className="text-xs text-muted">support@narehat.id</p>
            </div>

            <div className="bg-white border border-border-subtle rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Jam Operasional</h3>
              <p className="text-xs text-muted">Senin–Jumat<br />09:00–18:00 WIB</p>
            </div>

            <div className="bg-white border border-border-subtle rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary text-2xl">chat</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">AI Consult</h3>
              <p className="text-xs text-muted">Tanya langsung ke AI kami 24/7 lewat aplikasi</p>
            </div>

            <div className="bg-white border border-border-subtle rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary text-2xl">help</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">FAQ</h3>
              <p className="text-xs text-muted">Cek pertanyaan umum di halaman utama</p>
            </div>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
