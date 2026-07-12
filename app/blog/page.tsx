import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function BlogPage() {
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
              Blog
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Segera Hadir</h1>
            <p className="text-sm text-muted max-w-md mx-auto leading-relaxed mb-8">
              Konten edukasi seputar jerawat, skincare, ingredients, dan kesehatan kulit berbasis jurnal dermatologi sedang disiapkan. Stay tuned.
            </p>
            <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-primary text-3xl">edit_note</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
