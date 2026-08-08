# Business Model Canvas — Narehat

**Produk:** Jurnal Jerawat Cerdas — platform korelasi daily habit × kondisi kulit dengan AI berbasis jurnal dermatologi peer-reviewed.
**Versi Produk:** 1.0.0 (Cloudflare Pages + OpenNext + NextAuth)

---

## 1. Customer Segments

| Segmen | Deskripsi | Kebutuhan |
|--------|-----------|-----------|
| **Primer: Dewasa Muda** | 18-25 tahun, pria & wanita, 3+ produk skincare sudah dicoba, frustrasi jerawat persisten | Pemicu jerawat personal, rekomendasi berbasis data |
| **Sekunder: Skincare Enthusiast** | 25-30 tahun, aktif di TikTok/Instagram, ingin optimasi rutinitas | Analisis korelasi habit vs. kondisi kulit, anti-aging |
| **Tersier (B2B future): Brand Skincare Lokal** | Brand Indonesia yang ingin data tren kulit anonim | Insight pasar, targeting produk |
| **Potensi Perluasan (25-35)** | Goal anti-aging & skin barrier menarik segmen dewasa yang mulai khawatir tanda penuaan | Rutinitas pencegahan, barrier repair |

---

## 2. Value Propositions

| Value | Pain Point yang Dipecahkan |
|-------|---------------------------|
| **Journaling cerdas** — tracker 30 detik mencatat tidur, air, olahraga, stres, skincare AM/PM (section Opsional: Olahraga/Skincare/Pemicu/Catatan) | Tidak tahu pemicu jerawat personal |
| **Analisis korelasi** — "3 hari kamu tidur <6 jam → jerawat baru di pipi" | Informasi skincare terlalu general / kontradiktif |
| **AI berbasis jurnal ilmiah** (RAG + pgvector + 91 jurnal dermatologi peer-reviewed ber-PMID/DOI) | Rekomendasi dari influencer tidak personal |
| **Progress foto + skin score harian (0-100)** + perbandingan side-by-side | Tidak bisa mengukur apakah kulit membaik |
| **Rekomendasi produk** yang cocok skin type + link belanja | Buang uang untuk produk yang tidak cocok |
| **AI Deteksi & Purging Checker** — foto → jenis jerawat/severity/estimasi pemicu | Tidak tahu apakah "purging" atau "breakout" |
| **AI Routine Analyzer + Builder** — deteksi konflik ingredient, urutan salah, budget filter | Rutinitas skincare yang tidak optimal |
| **Weekly Skin Report** — laporan 7/30/90 hari, export HTML print PDF | Ingin bukti progres dalam satu laporan |
| **Terjangkau** — Free mulai Rp0, Premium Rp29rb/bulan (setara 1 boba tea) | Konsultasi dermatologis mahal (Rp150-350rb/visit) |

**Unique Selling Point:** Satu-satunya platform Indonesia yang mengkorelasikan daily habit → skin condition dengan grounding jurnal dermatologi peer-reviewed, bukan opini influencer.

---

## 3. Channels

| Channel | Tahap | Detail |
|---------|-------|--------|
| **TikTok** | Awareness & Acquisition | Konten edukasi jerawat, behind-the-scenes building, audience existing |
| **Instagram** | Awareness & Community | Testimonial visual, before/after progress, tips daily tracking |
| **Web App (PWA)** | Delivery & Usage | `narehat.com` — self-service, semua fitur dalam 1 platform, installable di HP |
| **SEO / Blog** (rencana) | Discovery | Artikel "penyebab jerawat hormonal", "retinol vs niacinamide" |
| **Word of Mouth** | Referral | "Aha moment" — user share insight personal mereka ke teman |

**PWA advantage:** Tidak perlu install dari App Store — 1 klik dari bio TikTok langsung pakai. Offline page tersedia saat tidak ada koneksi.

---

## 4. Customer Relationships

| Tipe | Implementasi |
|------|--------------|
| **Self-service** | Onboarding 4-step (tipe kulit → kondisi → produk → goal), dashboard insight otomatis, AI chat anytime |
| **Automated** | Progress chart, skin score harian, streak tracker (gamifikasi ringan), AI quota otomatis |
| **Community** (rencana) | Forum antar pengguna dengan skin type similar |
| **Co-creation** | Feedback loop — user input tracker → sistem memberikan insight personal |
| **Admin support** | Admin panel (kelola produk & user, ubah plan manual) untuk dukungan & refund |

**Retention loop:** Semakin sering tracker diisi → semakin akurat insight → semakin besar "aha moment" → user kembali lagi.

---

## 5. Revenue Streams

| Stream | Model | Catatan |
|--------|-------|---------|
| **Free** | Rp0 — tracker, progress foto, rekomendasi, AI consult 10x/bulan, AI deteksi 2x/bulan | Top of funnel |
| **Premium Bulanan** | Subscription Rp29.000/bulan (~$1.85) | AI consult 100x, deteksi 15x, purging 10x, deep insight, foto unlimited |
| **Premium Tahunan** | Subscription Rp199.000/tahun (~$12.70) | Rp16.583/bulan setara (~43% saving vs bulanan) |
| **Pro Bulanan** | Subscription Rp49.000/bulan (~$3.10) | Semua Premium + deteksi 30x, routine analyzer/builder, weekly report PDF |
| **Pro Tahunan** | Subscription Rp399.000/tahun (~$25.40) | Rp33.250/bulan setara (~32% saving vs bulanan) |
| **Affiliate Shopee/Tokopedia** | Commission per sale | ~3-5% per transaksi, semua tier |
| **B2B Data Insight** (future) | Anonymized tren kulit ke brand skincare lokal | TBD — perlu skala >1.000 MAU |

> **Status Payment:** Integrasi SumoPod (QRIS + webhook HMAC/token) siap produksi di kode, namun **masih aktif di sandbox**. Go-live menunggu: set env production (`SUMOPOD_PAYMENT_API_URL` production, API key, webhook secret/token) di Cloudflare Pages + registrasi webhook final.

### Unit Economics (asumsi early-stage)

| Metric | Value |
|--------|-------|
| CAC (TikTok organic + paid boost) | Rp3.000 - 5.000 |
| Free→Paid conversion (asumsi) | 2-4% |
| LTV (12 bulan premium × 70% retention) | ~Rp243.600 |
| LTV : CAC ratio | **20-35x** (> 3x target, sehat) |
| Gross margin (subscription) | ~85-90% |

---

## 6. Key Resources

| Resource | Detail |
|----------|--------|
| **Infrastruktur AI RAG** | SumoPod embeddings (text-embedding-3-small, 384 dim) + Supabase pgvector + SumoPod LLM (deepseek-v4-flash) |
| **Database jurnal dermatologi** | 91 artikel peer-reviewed ber-PMID/DOI di 8 domain (Basics, Treatment, Ingredients, Lifestyle, Skin Barrier, Scar, Brightening, Routine) |
| **Supabase + R2** | Auth (NextAuth), Database (PostgreSQL), Storage foto (Cloudflare R2, proxy serve via `/api/photos/serve`) |
| **Codebase** | Next.js 15 App Router + TypeScript — landing page, web app, API routes, admin panel dalam 1 repo |
| **Admin Panel** | Kelola produk (soft/hard delete + R2), kelola user (search/filter/detail modal/ubah plan) |
| **Brand & Audience** | Existing TikTok audience untuk distribusi awal |
| **Domain expertise** | Pengetahuan jerawat + dermatologi untuk prompt engineering & kurasi jurnal |

---

## 7. Key Activities

| Aktivitas | Frekuensi | Prioritas |
|-----------|-----------|-----------|
| **Content creation TikTok/IG** | 3-5x/minggu | CRITICAL — primary acquisition channel |
| **Kurasi + ingest jurnal dermatologi baru** | Bulanan | HIGH — kualitas AI bergantung pada ini |
| **Product iteration berdasarkan usage data** | Continuous | HIGH — improve "aha moment" rate |
| **Admin ops (kelola produk, kelola user, dukungan)** | Daily | HIGH — setelah launch |
| **Community moderation** | Daily (setelah forum launch) | FUTURE |
| **Affiliate partnership deals** | Quarterly | MEDIUM |

---

## 8. Key Partners

| Partner | Peran | Nilai |
|---------|-------|-------|
| **Cloudflare** | Hosting Pages + Workers (OpenNext), R2 storage, Turnstile CAPTCHA | Zero DevOps, edge deployment, storage foto |
| **Supabase** | Backend infra (Auth, PostgreSQL, pgvector) | Built-in auth, storage, vector search |
| **SumoPod AI** | LLM provider untuk RAG consultation + embeddings | Model deepseek, OpenAI-compatible API |
| **SumoPod** | Payment gateway (QRIS) | Payment link QRIS + webhook token/Svix verified (sandbox → go-live pending) |
| **Resend** | Email sending (forgot password, verifikasi) + Email Routing | Transaksional + branding email |
| **Shopee / Tokopedia Affiliate** | Monetisasi rekomendasi produk | Passive income, zero inventory |
| **Brand skincare lokal** (future) | B2B data partnership | Revenue stream baru |
| **Dermatologist advisors** (future) | Validasi konten medis & jurnal | Kredibilitas, akurasi klinis |

---

## 9. Cost Structure

| Biaya | Estimasi Bulanan (early-stage) | Tipe |
|-------|-------------------------------|------|
| **Cloudflare Pages + R2** | $0 (free tier — bandwidth & storage dasar) | Fixed → Variable saat scale |
| **Supabase** | $0 (Free tier — 500MB DB, 2GB bandwidth) | Fixed → Variable saat scale |
| **SumoPod AI** | ~$10-30 (tergantung volume konsultasi AI) | Variable |
| **SumoPod payment** | ~0.7% + Rp300 per transaksi | Variable |
| **Domain** | ~$10/tahun (narehat.com) | Fixed |
| **Content creation** | ~Rp0-500rb (self-produced atau UGC) | Variable |
| **SumoPod embeddings** | ~$0-5 (per 1K token, tergantung volume ingest) | Variable — kecil |

**Total early-stage: ~$10-30/bulan + fee transaksi.**

Cost structure: **value-driven** (bukan cost-driven). Kualitas AI, insight personal, dan akurasi jurnal yang membedakan — bukan harga termurah.

---

## 10. Pengujian Ekonomi (LTV vs CAC)

| Metric | Target | Realita (asumsi) | Status |
|--------|--------|------------------|--------|
| LTV : CAC | **> 3x** | 20-35x | ✅ Sehat |
| Gross margin | > 70% | ~85-90% | ✅ Sehat |
| Break-even unit | Bulan ke-2 dari subscription | — | 🟡 Perlu data |
| CAC payback | < 3 bulan | ~1-2 bulan | ✅ |

**Peringatan:** LTV:CAC tinggi ini bergantung asumsi retention 70% dan CAC organik Rp3-5rb. Keduanya harus divalidasi dengan data riil setelah soft launch.

---

## 11. Risiko & Critical Assumptions

| Assumption | Risk Level | Mitigasi |
|------------|------------|----------|
| User akan isi tracker harian >3 bulan | HIGH — habit tracking fatigue | Streak gamification, push notification, "aha moment" early |
| Pricing 3-tier (29k/49k) cukup rendah untuk conversion | MEDIUM — perceived value | Free tier kuat, tunjukkan insight sebelum paywall |
| AI RAG akurat dengan 91 jurnal ter-ingest | MEDIUM — coverage gap di sub-topik | Perluas jurnal & evaluasi berkala; artikel wajib PMID/DOI terverifikasi |
| TikTok organic sebagai primary channel | MEDIUM — algorithm dependent | Diversifikasi ke SEO + referral setelah scale |
| Kompetitor tidak akan copy model | LOW — defensibility rendah | Moat = data proprietary + brand + first-mover di Indonesia |
| Payment go-live (sandbox → produksi) lancar | MEDIUM — konfigurasi webhook/env | Checklist go-live terdokumentasi (env production + registrasi webhook final) |

---

## 12. Rekomendasi Strategis

1. **Freemium conversion:** Free tier dirancang cukup kuat ("oh ini toh pemicunya") agar user mau upgrade ke Premium/Pro saat hit AI quota.
2. **Defensibility:** Bangun dataset habit-skin proprietary (anonim) — semakin banyak data, semakin akurat insight = moat yang sulit dicopy.
3. **Monetisasi awal:** Fokus 100% ke subscription dulu. Affiliate & B2B hanya setelah 1.000+ MAU.
4. **Retention first:** Pastikan user mendapat "aha moment" dalam 7 hari pertama. Ini lebih penting daripada akuisisi di fase early.
5. **CAC rendah:** Manfaatkan konten TikTok organik. Jangan bakar uang di paid ads sebelum product-market fit jelas.
6. **Perluasan segmen:** Goal anti-aging & barrier membuka pasar 25-35 tahun — jadikan fokus konten untuk segmen tersebut.
7. **Scalability path:** Dari consumer subscription → B2B data insight → telehealth marketplace (dermatologist booking).

---

*Dokumen ini diperbarui Agustus 2026 — sinkron dengan produk v1.0 (3-tier pricing, Cloudflare hosting, admin panel, goal anti-aging & barrier, payment sandbox pending go-live).*
