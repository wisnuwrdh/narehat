import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-5">
        <div className="container-narrow max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Syarat & Ketentuan</h1>
          <p className="text-sm text-muted mb-10">Terakhir diperbarui: Juli 2026</p>

          <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Penerimaan Ketentuan</h2>
              <p>Dengan mengakses atau menggunakan Narehat (&quot;Layanan&quot;), Anda setuju untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju, mohon tidak menggunakan Layanan kami.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. Pendaftaran Akun</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Anda harus berusia minimal 18 tahun, atau mendapat izin orang tua/wali untuk menggunakan Layanan.</li>
                <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.</li>
                <li>Informasi yang Anda berikan saat pendaftaran harus akurat dan terkini.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. Deskripsi Layanan</h2>
              <p>Narehat adalah platform jurnal dan analisis jerawat berbasis AI yang menyediakan:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Tracker kebiasaan harian dan progress foto.</li>
                <li>Analisis AI untuk deteksi jenis jerawat dari foto.</li>
                <li>Konsultasi AI berbasis jurnal dermatologi peer-reviewed.</li>
                <li>Rekomendasi produk dan rutinitas skincare.</li>
                <li>Laporan mingguan perkembangan kulit.</li>
              </ul>
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-amber-800 mb-3">4. Disclaimer Medis: Harap Dibaca</h2>
              <p className="text-amber-800"><strong>Informasi yang diberikan oleh Narehat bersifat edukatif dan informatif. Narehat BUKAN pengganti diagnosis, pengobatan, atau saran dari tenaga kesehatan profesional (dokter kulit, dokter umum, atau tenaga medis lainnya).</strong></p>
              <ul className="list-disc pl-5 space-y-1 mt-3 text-amber-800">
                <li>Hasil analisis AI bukan diagnosis medis.</li>
                <li>Rekomendasi produk dan rutinitas bersifat umum, belum tentu cocok untuk semua orang.</li>
                <li>Jika Anda mengalami kondisi kulit serius, segera konsultasikan ke dokter kulit.</li>
                <li>Jangan menunda atau mengabaikan saran medis profesional berdasarkan informasi dari Narehat.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Langganan & Pembayaran</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Narehat menawarkan paket <strong>Free</strong> (gratis), <strong>Premium</strong> (Rp19.000/bulan), dan <strong>Pro</strong> (Rp49.000/bulan).</li>
                <li>Pembayaran diproses melalui Xendit. Narehat tidak menyimpan data kartu kredit atau metode pembayaran Anda.</li>
                <li>Anda dapat membatalkan subscription kapan saja melalui halaman Pengaturan.</li>
                <li>Pembatalan berlaku di akhir periode berlangganan. Tidak ada refund parsial untuk sisa periode yang belum digunakan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Konten Pengguna</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Foto kulit yang Anda unggah tetap menjadi milik Anda.</li>
                <li>Dengan mengunggah foto, Anda memberikan Narehat lisensi terbatas untuk memproses foto tersebut menggunakan AI guna memberikan layanan analisis.</li>
                <li>Foto Anda <strong>tidak akan digunakan untuk melatih model AI</strong> tanpa persetujuan eksplisit dari Anda.</li>
                <li>Anda bertanggung jawab penuh atas konten yang Anda unggah.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Perilaku yang Dilarang</h2>
              <p>Anda setuju untuk tidak:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Menggunakan Layanan untuk tujuan ilegal.</li>
                <li>Mengunggah konten yang melanggar hak orang lain.</li>
                <li>Memanipulasi, meretas, atau mengganggu operasional Layanan.</li>
                <li>Menggunakan AI Consult untuk meminta diagnosis medis atau resep obat.</li>
                <li>Membagikan akun Anda dengan pihak lain.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Hak Kekayaan Intelektual</h2>
              <p>Narehat dan seluruh konten asli di dalamnya (logo, desain, teks, algoritma AI) adalah milik Narehat dan dilindungi oleh hukum kekayaan intelektual yang berlaku.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">9. Batasan Tanggung Jawab</h2>
              <p>Sejauh diizinkan oleh hukum yang berlaku:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Narehat disediakan &quot;sebagaimana adanya&quot; tanpa jaminan apa pun.</li>
                <li>Kami tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan Layanan.</li>
                <li>Kami tidak menjamin bahwa Layanan akan selalu tersedia tanpa gangguan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">10. Pengakhiran</h2>
              <p>Kami berhak menangguhkan atau mengakhiri akun Anda jika terjadi pelanggaran terhadap Syarat & Ketentuan ini. Anda dapat mengakhiri akun kapan saja melalui halaman Pengaturan.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">11. Hukum yang Berlaku</h2>
              <p>Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan melalui pengadilan yang berwenang di Indonesia.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">12. Perubahan Ketentuan</h2>
              <p>Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi dalam aplikasi. Penggunaan Layanan setelah perubahan berarti Anda menyetujui ketentuan yang diperbarui.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">13. Kontak</h2>
              <p>Untuk pertanyaan terkait Syarat & Ketentuan: <strong>support@narehat.id</strong></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
