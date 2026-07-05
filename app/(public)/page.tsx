import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="container-narrow py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
              Jurnal Jerawat Cerdas
            </span>
            <h1 className="section-title font-extrabold text-slate-900 mb-6 leading-tight">
              Pahami Pemicu Jerawatmu,
              <br />
              <span className="text-primary">Bukan Tebak-tebakan</span>
            </h1>
            <p className="hero-subtitle text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Lacak kebiasaan harianmu, upload foto kulit, dan dapatkan insight personal
              berbasis AI yang membantumu menemukan rutinitas yang benar-benar cocok.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-press w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20"
              >
                Mulai Gratis
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 border border-border-subtle text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </section>

        <section className="container-narrow py-20 bg-slate-50 rounded-[3rem]">
          <div className="text-center mb-16">
            <h2 className="section-title font-extrabold text-slate-900 mb-4">
              Cara Kerja Narehat
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "Lacak", desc: "Catat kebiasaan harian, produk skincare, dan upload foto kulitmu." },
              { step: "Analisis", desc: "AI menganalisis korelasi antara data harianmu dan kondisi jerawat." },
              { step: "Pahami", desc: "Dapatkan insight personal dan rekomendasi berbasis jurnal dermatologi." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.step}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
