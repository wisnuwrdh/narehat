import Link from "next/link";

const plans = [
  {
    name: "Gratis",
    price: "Rp0",
    period: "selamanya",
    features: [
      "Tracker kebiasaan harian",
      "Tracker produk skincare",
      "Progress foto",
      "Insight dasar",
      "Rekomendasi produk",
    ],
    cta: "Mulai Gratis",
    href: "/register",
    featured: false,
  },
  {
    name: "Premium Bulanan",
    price: "Rp19.000",
    period: "/bulan",
    features: [
      "Semua fitur Gratis",
      "Deteksi jerawat AI",
      "Konsultasi AI (RAG)",
      "Insight mendalam",
      "Tema UI custom",
    ],
    cta: "Coba Premium",
    href: "/register?plan=premium_monthly",
    featured: true,
  },
  {
    name: "Premium Tahunan",
    price: "Rp149.000",
    period: "/tahun",
    features: [
      "Semua fitur Premium",
      "Hemat ~35%",
      "Prioritas support",
      "Akses fitur eksperimental",
    ],
    cta: "Langganan Tahunan",
    href: "/register?plan=premium_yearly",
    featured: false,
  },
];

export default function PricingSection() {
  return (
    <section className="container-narrow py-20">
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
          Harga
        </span>
        <h2 className="section-title font-extrabold text-slate-900 mb-4">
          Pilih Plan yang Tepat
        </h2>
        <p className="hero-subtitle text-muted max-w-2xl mx-auto">
          Mulai gratis, upgrade kapan saja untuk akses fitur AI dan insight mendalam.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-8 border ${
              plan.featured
                ? "border-primary bg-white shadow-xl shadow-primary/10"
                : "border-border-subtle bg-white shadow-sm"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full">
                Populer
              </span>
            )}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="text-4xl font-extrabold text-slate-900">
                {plan.price}
                <span className="text-base font-normal text-muted">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`btn-press block text-center px-6 py-3 rounded-2xl font-bold text-sm transition-colors ${
                plan.featured
                  ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                  : "bg-slate-50 text-slate-900 hover:bg-slate-100 border border-border-subtle"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
