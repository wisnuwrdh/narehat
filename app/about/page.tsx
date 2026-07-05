import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="container-narrow py-20">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              Tentang Kami
            </span>
            <h2 className="section-title font-extrabold text-slate-900 mb-4">
              Misi Kami
            </h2>
            <p className="hero-subtitle text-muted max-w-2xl mx-auto leading-relaxed">
              Narehat lahir dari frustrasi yang dialami jutaan orang —
              terus berganti produk tanpa pernah tahu pemicu jerawatnya sendiri.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            <div className="bg-white border border-border-subtle rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Masalah</h3>
              <p className="text-sm text-muted leading-relaxed">
                Informasi skincare di internet terlalu umum dan sering kali
                kontradiktif. Orang menghabiskan jutaan rupiah untuk produk
                yang dipromosikan influencer, tanpa tahu apakah produk itu
                cocok untuk jenis dan kondisi kulit mereka.
              </p>
            </div>
            <div className="bg-white border border-border-subtle rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Solusi</h3>
              <p className="text-sm text-muted leading-relaxed">
                Kami menghubungkan data kebiasaan harianmu — tidur, makanan,
                stres, skincare — dengan kondisi jerawatmu. Didukung AI
                berbasis jurnal dermatologi peer-reviewed, bukan tebak-tebakan.
              </p>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto mb-20">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-4">
              Proses Kami
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Lacak</h4>
                <p className="text-xs text-muted">
                  Catat kebiasaan harian dan upload foto kulitmu secara rutin.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Analisis</h4>
                <p className="text-xs text-muted">
                  AI kami menganalisis korelasi antara kebiasaan dan kondisi kulitmu.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Bertindak</h4>
                <p className="text-xs text-muted">
                  Dapatkan insight personal dan rekomendasi yang benar-benar relevan.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="btn-press inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Mulai Perjalananmu
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
