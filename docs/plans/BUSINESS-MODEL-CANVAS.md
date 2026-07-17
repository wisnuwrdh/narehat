# Business Model Canvas — Narehat

**Produk:** Jurnal Jerawat Cerdas — platform korelasi daily habit × kondisi kulit dengan AI berbasis jurnal dermatologi peer-reviewed.

---

## 1. Customer Segments

| Segmen | Deskripsi | Kebutuhan |
|--------|-----------|-----------|
| **Primer: Dewasa Muda** | 18-25 tahun, pria & wanita, 3+ produk skincare sudah dicoba, frustasi jerawat persisten | Pemicu jerawat personal, rekomendasi berbasis data |
| **Sekunder: Skincare Enthusiast** | 25-30 tahun, aktif di TikTok/Instagram, ingin optimasi rutinitas | Analisis korelasi habit vs. kondisi kulit |
| **Tersier (B2B future): Brand Skincare Lokal** | Brand Indonesia yang ingin data tren kulit anonim | Insight pasar, targeting produk |

---

## 2. Value Propositions

| Value | Pain Point yang Dipecahkan |
|-------|---------------------------|
| **Journaling cerdas** — tracker 30 detik mencatat tidur, air, olahraga, stres, skincare AM/PM | Tidak tahu pemicu jerawat personal |
| **Analisis korelasi** — "3 hari kamu tidur <6 jam → jerawat baru di pipi" | Informasi skincare terlalu general / kontradiktif |
| **AI berbasis jurnal ilmiah** (RAG + pgvector + peer-reviewed dermatology) | Rekomendasi dari influencer tidak personal |
| **Progress foto + skin score harian** (0-100) | Tidak bisa mengukur apakah kulit membaik |
| **Rekomendasi produk** dengan affiliate link | Buang uang untuk produk yang tidak cocok |
| **Terjangkau** — Rp19rb/bulan (setara 1 boba tea) | Konsultasi dermatologis mahal (Rp150-350rb/visit) |

**Unique Selling Point:** Satu-satunya platform Indonesia yang mengkorelasikan daily habit → skin condition dengan grounding jurnal dermatologi peer-reviewed, bukan opini influencer.

---

## 3. Channels

| Channel | Tahap | Detail |
|---------|-------|--------|
| **TikTok** | Awareness & Acquisition | Konten edukasi jerawat, behind-the-scenes building, audience existing |
| **Instagram** | Awareness & Community | Testimonial visual, before/after progress, tips daily tracking |
| **Web App (PWA)** | Delivery & Usage | `narehat.com` — self-service, semua fitur dalam 1 platform |
| **SEO / Blog** (rencana) | Discovery | Artikel "penyebab jerawat hormonal", "retinol vs niacinamide" |
| **Word of Mouth** | Referral | "Aha moment" — user share insight personal mereka ke teman |

**PWA advantage:** Tidak perlu install dari App Store — 1 klik dari bio TikTok langsung pakai.

---

## 4. Customer Relationships

| Tipe | Implementasi |
|------|--------------|
| **Self-service** | Onboarding 5-step, dashboard insight otomatis, AI chat anytime |
| **Automated** | Progress chart, skin score harian, streak tracker (gamifikasi ringan) |
| **Community** (rencana) | Forum antar pengguna dengan skin type similar |
| **Co-creation** | Feedback loop — user input tracker → sistem memberikan insight personal |

**Retention loop:** Semakin sering tracker diisi → semakin akurat insight → semakin besar "aha moment" → user kembali lagi.

---

## 5. Revenue Streams

| Stream | Model | Proyeksi |
|--------|-------|----------|
| **Premium Bulanan** | Subscription Rp19.000/bulan (~$1.15) | Rp19.000 × conversion rate |
| **Premium Tahunan** | Subscription Rp149.000/tahun (~$9.00) | Rp12.416/bulan setara (35% saving vs bulanan) |
| **Affiliate Shopee/Tokopedia** | Commission per sale | ~3-5% per transaksi |
| **B2B Data Insight** (future) | Anonymized tren kulit ke brand skincare lokal | TBD — perlu skala >1.000 MAU |

### Unit Economics (asumsi early-stage)

| Metric | Value |
|--------|-------|
| CAC (TikTok organic + paid boost) | Rp3.000 - 5.000 |
| LTV (12 bulan premium × 70% retention) | ~Rp104.000 |
| LTV : CAC ratio | **20-35x** |
| Gross margin (subscription) | ~85-90% |

---

## 6. Key Resources

| Resource | Detail |
|----------|--------|
| **Infrastruktur AI RAG** | Xenova embeddings (local) + Supabase pgvector + SumoPod LLM |
| **Database jurnal dermatologi** | 70-90 artikel peer-reviewed di 7 domain (Acne Basics, Treatment, Ingredients, Lifestyle, Skin Barrier, Scar, Brightening) |
| **Supabase** | Auth, Database, Storage, RLS — full backend tanpa DevOps |
| **Codebase** | Next.js 15 App Router — landing page, web app, API routes dalam 1 repo |
| **Brand & Audience** | Existing TikTok audience untuk distribusi awal |
| **Domain expertise** | Pengetahuan jerawat + dermatologi untuk prompt engineering & kurasi jurnal |

---

## 7. Key Activities

| Aktivitas | Frekuensi | Prioritas |
|-----------|-----------|-----------|
| **Content creation TikTok/IG** | 3-5x/minggu | CRITICAL — primary acquisition channel |
| **Kurasi + ingest jurnal dermatologi baru** | Bulanan | HIGH — kualitas AI bergantung pada ini |
| **Product iteration berdasarkan usage data** | Continuous | HIGH — improve "aha moment" rate |
| **Community moderation** | Daily (setelah forum launch) | FUTURE |
| **Affiliate partnership deals** | Quarterly | MEDIUM |

---

## 8. Key Partners

| Partner | Peran | Nilai |
|---------|-------|-------|
| **Supabase** | Backend infra (free tier → Pro saat scale) | Zero DevOps, built-in Auth + Storage + pgvector |
| **SumoPod AI** | LLM provider untuk RAG consultation | Model deepseek, OpenAI-compatible API |
| **Xendit** | Payment gateway Indonesia | Invoice otomatis, webhook HMAC-SHA256 terverifikasi |
| **Vercel** | Hosting Next.js (Hobby → Pro) | Auto-deploy dari git push, edge middleware |
| **Shopee / Tokopedia Affiliate** | Monetisasi rekomendasi produk | Passive income, zero inventory |
| **Brand skincare lokal** (future) | B2B data partnership | Revenue stream baru |
| **Dermatologist advisors** (future) | Validasi konten medis & jurnal | Kredibilitas, akurasi klinis |

---

## 9. Cost Structure

| Biaya | Estimasi Bulanan (early-stage) | Tipe |
|-------|-------------------------------|------|
| **Supabase** | $0 (Free tier — 500MB DB, 2GB bandwidth) | Fixed → Variable saat scale |
| **Vercel** | $0 (Hobby — 100GB bandwidth, 1K serverless hours) | Fixed → Variable saat scale |
| **SumoPod AI** | ~$10-30 (tergantung volume konsultasi AI) | Variable |
| **Xendit** | ~Rp1.500 per transaksi sukses | Variable |
| **Domain** | ~$10/tahun (mis. narehat.id) | Fixed |
| **Content creation** | ~Rp0-500rb (self-produced atau UGC) | Variable |
| **Xenova embeddings** | $0 (komputasi lokal, tanpa biaya API) | Fixed — zero |

**Total early-stage: ~$10-30/bulan + fee transaksi.**

Cost structure: **value-driven** (bukan cost-driven). Kualitas AI, insight personal, dan akurasi jurnal yang membedakan — bukan harga termurah.

---

## 10. Risiko & Critical Assumptions

| Assumption | Risk Level | Mitigasi |
|------------|------------|----------|
| User akan isi tracker harian >3 bulan | HIGH — habit tracking fatigue | Streak gamification, push notification, "aha moment" early |
| Rp19rb cukup rendah untuk conversion | MEDIUM — perceived value | Free trial 7 hari, tunjukkan insight sebelum paywall |
| AI RAG akurat dengan 70-90 jurnal | MEDIUM — coverage gap | Mulai dengan jurnal dikurasi ketat, evaluasi berkala |
| TikTok organic sebagai primary channel | MEDIUM — algorithm dependent | Diversifikasi ke SEO + referral setelah scale |
| Kompetitor tidak akan copy model | LOW — defensibility rendah | Moat = data proprietary + brand + first-mover di Indonesia |

---

## Rekomendasi Strategis

1. **Freemium conversion:** Tambah free trial 7 hari Premium agar user merasakan AI Consult sebelum berkomitmen bayar.
2. **Defensibility:** Bangun dataset habit-skin proprietary (anonim) — semakin banyak data, semakin akurat insight = moat yang sulit dicopy.
3. **Monetisasi awal:** Fokus 100% ke subscription dulu. Affiliate & B2B hanya setelah 1.000+ MAU.
4. **Retention first:** Pastikan user mendapat "aha moment" dalam 7 hari pertama. Ini lebih penting daripada akuisisi di fase early.
5. **CAC rendah:** Manfaatkan konten TikTok organik. Jangan bakar uang di paid ads sebelum product-market fit jelas.
6. **Scalability path:** Dari consumer subscription → B2B data insight → telehealth marketplace (dermatologist booking).
