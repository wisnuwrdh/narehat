import Link from "next/link";

export default function CTASection() {
  return (
    <section className="container-narrow py-20">
      <div className="bg-primary rounded-3xl p-12 text-center text-white shadow-2xl shadow-primary/20">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          Siap Memahami Kulitmu Lebih Baik?
        </h2>
        <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
          Mulai lacak kebiasaan harianmu hari ini dan temukan apa yang sebenarnya memicu jerawatmu.
        </p>
        <Link
          href="/register"
          className="btn-press inline-flex px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-white/90 transition-colors shadow-lg"
        >
          Mulai Gratis Sekarang
        </Link>
        <p className="text-xs text-white/50 mt-3">
          Tanpa kartu kredit. Gratis selamanya.
        </p>
      </div>
    </section>
  );
}
