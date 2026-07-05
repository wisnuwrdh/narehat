const faqs = [
  {
    q: "Apa bedanya Narehat dengan aplikasi skincare lain?",
    a: "Narehat tidak hanya merekomendasikan produk — kami menganalisis data kebiasaan harianmu (tidur, makan, stres, skincare) dan menghubungkannya dengan kondisi jerawatmu menggunakan AI berbasis jurnal dermatologi peer-reviewed.",
  },
  {
    q: "Apakah data foto saya aman?",
    a: "Ya. Foto kulit Anda dienkripsi dan tidak akan dijual atau digunakan untuk training AI tanpa izin eksplisit. Kami mematuhi UU Perlindungan Data Pribadi Indonesia.",
  },
  {
    q: "Apakah saya bisa pakai gratis selamanya?",
    a: "Bisa! Fitur tracker, progress foto, dan insight dasar gratis selamanya. Premium memberi akses ke AI deteksi jerawat, konsultasi AI, dan insight lebih mendalam.",
  },
  {
    q: "Apakah AI bisa menggantikan dokter kulit?",
    a: "Tidak. AI kami adalah alat bantu berbasis jurnal dermatologi, bukan pengganti diagnosis medis profesional. Untuk kondisi serius, tetap konsultasikan ke dokter kulit.",
  },
  {
    q: "Bagaimana cara berlangganan Premium?",
    a: "Setelah daftar akun gratis, Anda bisa upgrade ke Premium langsung dari dashboard. Pembayaran diproses melalui Xendit — aman dan mudah.",
  },
];

export default function FAQSection() {
  return (
    <section className="container-narrow py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title font-extrabold text-slate-900 mb-4">
            Pertanyaan Umum
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white rounded-2xl border border-border-subtle">
              <summary className="px-6 py-4 cursor-pointer font-medium text-slate-900 select-none list-none flex items-center justify-between">
                {faq.q}
                <svg className="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-muted leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
