import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-5">
        <div className="container-narrow max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mb-6">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Kebijakan Privasi</h1>
          <p className="text-sm text-muted mb-10">Terakhir diperbarui: Juli 2026</p>

          <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Identitas Pengendali Data</h2>
              <p>Narehat (&quot;kami&quot;) mengoperasikan platform jurnal jerawat cerdas yang dapat diakses melalui <strong>narehat.vercel.app</strong>. Untuk pertanyaan terkait privasi, hubungi kami di <strong>support@narehat.id</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. Data yang Kami Kumpulkan</h2>
              <p>Kami mengumpulkan data berikut untuk memberikan layanan yang dipersonalisasi:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Data akun:</strong> alamat email dan nama.</li>
                <li><strong>Data profil:</strong> tipe kulit, tingkat keparahan jerawat, dan goal perawatan.</li>
                <li><strong>Data tracker harian:</strong> jam tidur, konsumsi air, durasi olahraga, tingkat stres, dan konsistensi skincare.</li>
                <li><strong>Data foto:</strong> foto kulit yang Anda unggah untuk analisis AI dan progress tracking.</li>
                <li><strong>Data konsultasi AI:</strong> pertanyaan yang Anda ajukan ke fitur AI Consult.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. Tujuan Pemrosesan Data</h2>
              <p>Data Anda kami proses untuk:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Memberikan insight personal tentang pemicu jerawat Anda.</li>
                <li>Menganalisis foto kulit menggunakan AI untuk deteksi jenis jerawat dan purging vs breakout.</li>
                <li>Membangun dan merekomendasikan rutinitas skincare yang sesuai.</li>
                <li>Mengirim notifikasi, pengingat tracker, dan insight baru.</li>
                <li>Memproses pembayaran subscription melalui Xendit.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Dasar Hukum Pemrosesan</h2>
              <p>Sesuai dengan Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP), kami memproses data Anda berdasarkan:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Persetujuan eksplisit</strong>: Anda memberikan izin saat mendaftar dan menggunakan fitur AI.</li>
                <li><strong>Pelaksanaan perjanjian</strong>: data diperlukan untuk memberikan layanan yang Anda minta.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Pihak Ketiga (Sub-Prosesor)</h2>
              <p>Kami menggunakan layanan pihak ketiga berikut untuk mengoperasikan Narehat:</p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 font-semibold">Layanan</th>
                      <th className="text-left py-2 pr-4 font-semibold">Data yang Dibagikan</th>
                      <th className="text-left py-2 font-semibold">Lokasi Server</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 pr-4">OpenAI (GPT-4o-mini)</td>
                      <td className="py-2 pr-4">Foto kulit (deteksi AI & purging checker)</td>
                      <td className="py-2">Amerika Serikat</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 pr-4">SumoPod AI (DeepSeek)</td>
                      <td className="py-2 pr-4">Teks konsultasi & data rutinitas</td>
                      <td className="py-2">Singapura</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 pr-4">Supabase</td>
                      <td className="py-2 pr-4">Seluruh data akun, tracker, foto</td>
                      <td className="py-2">Asia Pasifik</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 pr-4">Xendit</td>
                      <td className="py-2 pr-4">Data pembayaran subscription</td>
                      <td className="py-2">Indonesia</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Vercel</td>
                      <td className="py-2 pr-4">Log akses aplikasi</td>
                      <td className="py-2">Amerika Serikat</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Hak Anda (Sesuai UU PDP Pasal 5-13)</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Hak akses:</strong> melihat data pribadi yang kami simpan.</li>
                <li><strong>Hak koreksi:</strong> memperbaiki data yang tidak akurat.</li>
                <li><strong>Hak penghapusan:</strong> menghapus akun dan seluruh data terkait.</li>
                <li><strong>Hak pembatasan:</strong> membatasi pemrosesan data tertentu.</li>
                <li><strong>Hak portabilitas:</strong> menerima salinan data dalam format terstruktur.</li>
                <li><strong>Hak menarik persetujuan:</strong> mencabut izin pemrosesan data kapan saja.</li>
              </ul>
              <p className="mt-2">Untuk menggunakan hak-hak ini, hubungi kami di <strong>support@narehat.id</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Retensi Data</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Data disimpan selama akun Anda aktif.</li>
                <li>Jika akun dihapus, seluruh data dihapus dalam waktu maksimal 30 hari.</li>
                <li>Foto yang dikirim ke OpenAI untuk analisis AI <strong>tidak disimpan</strong> oleh OpenAI setelah pemrosesan selesai.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Keamanan Data</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Enkripsi end-to-end untuk penyimpanan dan transfer foto.</li>
                <li>Row Level Security (RLS): setiap user hanya dapat mengakses datanya sendiri.</li>
                <li>Enkripsi in-transit menggunakan TLS 1.3.</li>
                <li>Kunci API (OpenAI, SumoPod) tidak pernah terekspos ke klien.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">9. Transfer Data Lintas Batas</h2>
              <p>Data Anda mungkin ditransfer dan diproses di luar Indonesia (Amerika Serikat, Singapura). Kami memastikan bahwa semua sub-prosesor memiliki standar keamanan yang setara atau lebih tinggi dari yang diwajibkan oleh UU PDP Indonesia.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">10. Cookie</h2>
              <p>Narehat hanya menggunakan <strong>essential cookies</strong> yang diperlukan untuk autentikasi dan fungsi dasar aplikasi. Kami tidak menggunakan tracking, advertising, atau third-party cookies.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">11. Perubahan Kebijakan</h2>
              <p>Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi dalam aplikasi.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">12. Kontak</h2>
              <p>Untuk pertanyaan, keluhan, atau permintaan terkait data pribadi:</p>
              <p className="mt-1"><strong>Email:</strong> support@narehat.id</p>
              <p>Anda juga berhak mengajukan pengaduan ke lembaga pengawas perlindungan data pribadi yang berwenang di Indonesia.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
