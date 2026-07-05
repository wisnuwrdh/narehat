# Product Requirements Document (PRD)
## Narehat — Jurnal Jerawat Cerdas
**Versi:** 0.1 (Draft)
**Status:** In Progress
**Terakhir diperbarui:** Juli 2026

---

## 1. RINGKASAN PRODUK

### Visi
Menjadi platform kesehatan kulit #1 di Indonesia yang membantu user memahami pemicu personal jerawat mereka — bukan sekadar merekomendasikan produk, tapi mengubah data kebiasaan harian menjadi insight yang actionable.

### Tagline (Sementara)
> "Pahami pemicu jerawatmu, lacak progresmu, dan temukan rutinitas yang benar-benar cocok."

### Problem Statement
Orang yang struggle dengan jerawat tidak tahu pemicu personalnya. Mereka terus mengganti produk skincare tanpa pernah membaca pola dari kebiasaan harian mereka sendiri — sehingga jerawat terus balik meski sudah keluar banyak uang.

### Solusi
Web app (PWA) yang menghubungkan tracker kebiasaan harian, produk skincare, progress foto, dan AI berbasis jurnal dermatologi valid — sehingga user bisa melihat korelasi antara kebiasaan dan kondisi jerawat mereka secara personal.

---

## 2. TARGET USER

### Segmen Utama
- Pria & wanita usia 18–25 tahun, Indonesia (audiens seimbang)
- Semua jenis kulit (berminyak, kering, kombinasi, normal, sensitif)
- Sudah pernah mencoba minimal 3–5 produk skincare
- Aktif di TikTok/Instagram
- Frustrasi karena jerawat tidak kunjung sembuh meski sudah rajin skincare

### Early Adopter
User usia 18–27 yang sudah capek trial-error produk dan merasa "jerawatnya gak kebaca polanya." Mereka familiar dengan tools digital dan mau bayar subscription kecil sebagai alternatif dari terus membeli produk yang tidak cocok.

### Pain Points Utama
1. Tidak tahu pemicu personal jerawat mereka
2. Buang uang beli produk yang ternyata tidak cocok
3. Informasi di internet terlalu overwhelming dan tidak personal
4. Sulit konsisten menjalankan rutinitas
5. Tidak bisa mengukur apakah kulitnya membaik atau memburuk

### "Aha Moment"
Pertama kali app memberikan insight seperti:
> *"3 hari terakhir kamu tidur kurang dari 6 jam — bertepatan dengan munculnya jerawat baru di area pipi."*

---

## 3. FITUR PRODUK

### 3.1 Fitur Gratis

| Fitur | Deskripsi |
|---|---|
| Tracker kebiasaan harian | Input tidur, makan, stres, olahraga, minum air, dll |
| Tracker produk skincare | Catat produk yang sedang dipakai & reaksi kulit |
| Progress foto | Upload foto kondisi kulit, tersimpan per tanggal |
| Insight dasar | Korelasi sederhana antara kebiasaan & kondisi kulit |
| Rekomendasi produk | Saran produk + affiliate link ke Shopee/Tokopedia |

### 3.2 Fitur Premium

| Fitur | Deskripsi |
|---|---|
| Deteksi jerawat AI | Analisis foto kulit menggunakan AI (per upload) |
| Konsultasi AI (RAG) | Chat dengan AI berbasis jurnal dermatologi valid |
| Insight mendalam | Grafik tren + analisis pola lebih detail |
| Tema UI custom | Pilihan warna & tone-of-voice teks (feminine / dark / nature / default) |

### 3.3 Fitur yang Ditunda (Future Release)
- Ingredient checker (scan produk)
- Komunitas / forum user
- Konsultasi dengan dokter kulit manusia
- Versi multi-bahasa (ekspansi luar Indonesia)
- **Karakter/maskot coach per tema (Ara, Nara, Rex, Sage)** — ditunda sampai ada validasi user asli bahwa konsep ini menambah value emosional, bukan sekadar dekorasi. Lihat catatan di section 6.

---

## 4. USER FLOW

### 4.1 Flow Utama
```
Landing Page
    ↓
Register / Login
    ↓
Onboarding (sekali, saat pertama kali masuk)
    ↓
Dashboard (home utama)
    ↓
[Tracker / Progress / AI Consult / Rekomendasi / Settings]
```

### 4.2 Onboarding Flow
Onboarding adalah proses "kenalan" satu kali saat user pertama kali mendaftar. Tujuannya agar dashboard langsung terasa personal dari hari pertama.

**Step 1 — Tipe Kulit**
> "Tipe kulit kamu apa?"
> Pilihan: Berminyak / Kering / Kombinasi / Normal / Sensitif

**Step 2 — Kondisi Jerawat Sekarang**
> "Seberapa parah jerawat kamu saat ini?"
> Pilihan: Ringan / Sedang / Parah
> + Upload foto opsional (dijadikan baseline pertama)

**Step 3 — Kebiasaan Sehari-hari**
> "Pilih kebiasaan yang sering kamu lakukan"
> ☐ Sering begadang
> ☐ Jarang minum air
> ☐ Sering pegang muka
> ☐ Makan makanan berminyak/manis
> ☐ Jarang ganti sarung bantal
> ☐ Stress tinggi
> ☐ Jarang olahraga

**Step 4 — Produk yang Dipakai**
> "Skincare apa yang sekarang kamu pakai?"
> Input manual atau search nama produk

**Step 5 — Goal**
> "Apa yang paling kamu inginkan?"
> Pilihan: Jerawat hilang / Bekas jerawat memudar / Kulit lebih cerah / Semua

---

## 5. STRUKTUR HALAMAN (ROUTES)

### Public Pages
```
/                    → Landing page
/pricing             → Harga & perbandingan plan
/about               → Tentang produk
```

### Auth Pages
```
/login               → Masuk
/register            → Daftar akun baru
/onboarding          → Setup awal (hanya muncul sekali)
```

### App Pages (Setelah Login)
```
/dashboard           → Overview kondisi kulit + insight hari ini
/tracker             → Input harian (kebiasaan, produk, foto)
/progress            → Grafik tren + perbandingan foto side-by-side
/ai-consult          → Chat AI berbasis RAG jurnal dermatologi [PREMIUM]
/recommendations     → Rekomendasi produk + affiliate link
/settings            → Profil, tema, subscription, notifikasi
```

---

## 6. DESAIN & UI

### Platform
Web App + PWA (bisa di-install di HP seperti native app)

### Design Direction
- **Style:** Minimalis modern dengan kepribadian — bukan template-y
- **Background:** Pure white (#FFFFFF) — bukan cream/off-white
- **Animasi (MVP):** Micro-animation sederhana (transisi angka, progress ring, subtle motion di background/loading state) — cukup untuk kasih "rasa hidup" tanpa beban desain karakter penuh

### Sistem Tema (Premium, MVP)
Untuk MVP, tema premium dibedakan lewat **warna & tone-of-voice teks saja**, tanpa karakter/maskot visual.

| Tema | Accent Color | Tone of Voice |
|---|---|---|
| Default (Minimalis) | Soft navy / slate | Informatif, bersih |
| Feminine | Dusty rose / mauve | Supportif, encouraging |
| Dark / Sleek | Charcoal + electric blue | To the point, data-driven |
| Nature | Sage green + earth | Holistic, calming |

### Catatan — Konsep Karakter/Maskot Coach (Ditunda)
Konsep awal: animasi abstrak Lottie (bukan kartun, bukan realistis, terinspirasi Headspace — fluid shapes, smooth, calming) dengan 4 karakter berbeda per tema:

| Tema | Nama | Bentuk Visual | Gerakan Khas |
|---|---|---|---|
| Default | Ara | Sphere / droplet halus | Breathing pelan |
| Feminine | Nara | Kelopak / kuncup majemuk | Mekar-menutup lembut |
| Dark / Sleek | Rex | Geometris tajam (kristal abstrak) | Cepat, snappy, pulse cahaya |
| Nature | Sage | Organik seperti daun / ranting | Mengalir lambat |

**Keputusan (Juli 2026):** konsep ini ditunda ke *future release*, bukan dibatalkan. Alasan:
- Karakter/maskot bukan bagian dari milestone MVP (lihat section 10 — MVP fokus ke tracker, onboarding, dashboard, RAG dasar)
- Butuh validasi dulu apakah maskot benar-benar menambah pengalaman emosional user, atau sekadar dekorasi yang menambah kompleksitas desain & development tanpa terbukti dibutuhkan
- Uji coba render pertama (bentuk blob abstrak untuk Ara) menunjukkan eksekusi visual abstrak tanpa wajah ini butuh effort desain serius supaya tidak terasa random — bukan sesuatu yang bisa cepat divalidasi lewat AI image generation biasa
- Rencana validasi: setelah soft launch, uji 1 karakter (Ara) dulu ke sebagian user nyata sebelum memutuskan lanjut ke 4 karakter atau drop konsep ini sepenuhnya

---

## 7. AI & TEKNOLOGI

### Arsitektur AI (RAG)
Untuk menghemat biaya token dan meningkatkan akurasi:

1. Kumpulkan jurnal dermatologi valid (PubMed, AAD, Journal of Investigative Dermatology)
2. Proses menjadi vector embeddings → simpan di Supabase pgvector
3. Saat user bertanya:
   - **Cari dulu di knowledge base jurnal** → AI summarize (murah)
   - **Jika tidak ditemukan** → panggil full AI (jarang terjadi)

**Keunggulan marketing:**
> *"Rekomendasi kami berbasis jurnal dermatologi peer-reviewed, bukan tebak-tebakan."*

### Deteksi Jerawat AI (Premium)
- Hanya dipanggil untuk user premium
- Analisis foto kulit yang diupload user
- Output: identifikasi jenis jerawat + saran awal

### Tech Stack
| Layer | Teknologi |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Vector DB | Supabase pgvector (untuk RAG) |
| Animasi | Lottie |
| Hosting | Vercel |
| Payment | Xendit |
| Auth | Supabase Auth |

---

## 7.1 STRUKTUR FOLDER (PROJECT STRUCTURE)

Struktur folder Next.js berikut mengikuti routes di section 5 dan memisahkan kode berdasarkan tingkat risiko — kode yang menyentuh auth, database policy, dan payment dipisah jelas dari UI/komponen agar lebih mudah direview dengan hati-hati (relevan terutama saat development dibantu AI/vibe coding).

```
narehat/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public pages
│   │   ├── page.tsx               → /
│   │   ├── pricing/page.tsx       → /pricing
│   │   └── about/page.tsx         → /about
│   │
│   ├── (auth)/                   # Auth pages
│   │   ├── login/page.tsx         → /login
│   │   ├── register/page.tsx      → /register
│   │   └── onboarding/page.tsx    → /onboarding
│   │
│   ├── (app)/                    # Protected pages (setelah login)
│   │   ├── dashboard/page.tsx     → /dashboard
│   │   ├── tracker/page.tsx       → /tracker
│   │   ├── progress/page.tsx      → /progress
│   │   ├── ai-consult/page.tsx    → /ai-consult [PREMIUM]
│   │   ├── recommendations/page.tsx → /recommendations
│   │   ├── settings/page.tsx      → /settings
│   │   └── layout.tsx             # Auth guard + shared app shell
│   │
│   └── api/                      # API Routes (backend)
│       ├── auth/                  # ⚠️ High-risk — extra review
│       ├── tracker/                # CRUD daily logs
│       ├── photos/                 # ⚠️ Upload, akses Storage — cek RLS & ownership
│       ├── ai/
│       │   ├── detect/             # ⚠️ Deteksi jerawat (premium, panggil vision model)
│       │   └── consult/            # ⚠️ RAG chat (panggil pgvector + LLM)
│       ├── recommendations/        # Produk + affiliate link
│       └── payment/                # ⚠️ Webhook Xendit — validasi signature wajib
│
├── components/                   # Komponen UI (aman untuk vibe coding bebas)
│   ├── ui/                        # Base components (button, card, dll)
│   ├── onboarding/                # Step wizard components
│   ├── tracker/                   # Form input harian
│   ├── dashboard/                 # Insight card, greeting, dll
│   ├── progress/                  # Chart, photo comparison
│   ├── motion/                    # Micro-animation (progress ring, transisi, dll)
│   └── theme/                     # Theme switcher & tokens (warna + tone-of-voice teks)
│
├── lib/                          # Logic inti — review lebih ketat
│   ├── supabase/
│   │   ├── client.ts               # Client-side (anon key SAJA)
│   │   ├── server.ts               # Server-side (service role — never expose ke client)
│   │   └── middleware.ts           # Session refresh
│   ├── ai/
│   │   ├── embeddings.ts           # Generate & query pgvector
│   │   ├── rag.ts                  # Retrieval logic (jurnal dermatologi)
│   │   └── vision.ts               # Deteksi jerawat dari foto
│   ├── insights/
│   │   └── correlation.ts          # Logic korelasi kebiasaan ↔ kondisi kulit
│   └── payment/
│       └── xendit.ts               # ⚠️ Payment logic — signature verification, dll
│
├── types/                        # TypeScript types (schema database, dll)
│
├── supabase/                     # ⚠️ Paling kritis untuk keamanan data
│   ├── migrations/                # Schema + RLS policy (versioned, wajib direview manual)
│   └── seed.sql                   # Data awal (jurnal dermatologi, dll)
│
├── public/                       # Assets statis (ikon, gambar; Lottie menyusul jika maskot dilanjutkan)
│
└── middleware.ts                 # Auth guard di level Next.js
```

**Catatan penting:**
- Folder bertanda ⚠️ adalah area yang menyentuh data sensitif, auth, atau uang — sebaiknya tidak sepenuhnya diserahkan ke AI generation tanpa review manual baris-per-baris, terutama bagian yang berkaitan dengan RLS policy dan validasi kepemilikan data (`user_id` matching).
- `supabase/migrations/` sebaiknya jadi satu-satunya sumber kebenaran untuk skema database & RLS — hindari mengubah policy langsung dari dashboard Supabase tanpa dicatat di migration, supaya ada jejak audit.
- Folder `components/` relatif aman untuk iterasi cepat karena tidak menyentuh data pengguna secara langsung.

---

## 8. MONETISASI

### Model Bisnis
**Freemium** — masuk gratis, upgrade untuk fitur AI & personalisasi

### Pricing
| Plan | Harga | Fitur |
|---|---|---|
| Free | Rp0 | Tracker, progress foto, rekomendasi dasar |
| Premium Bulanan | Rp19.000/bulan | Semua fitur + AI deteksi + konsultasi RAG + tema custom |
| Premium Tahunan | Rp149.000/tahun | Sama dengan bulanan (hemat ~35%) |

### Revenue Stream Tambahan
- **Affiliate link** produk skincare lokal di halaman rekomendasi (pasif, dari fitur gratis)
- **Future:** Data insight anonim untuk brand skincare lokal (B2B)

### Trigger Upgrade
User mulai bayar setelah mendapat "aha moment" pertama — biasanya di minggu ke 2–3. Trigger: ingin akses deteksi AI atau insight lebih mendalam.

### Payment Gateway
**Xendit** (fokus pasar Indonesia)

---

## 9. KEAMANAN & LEGAL

### Data Sensitif
- Foto kulit user dienkripsi at-rest
- Data kesehatan tidak dijual ke pihak ketiga
- Foto user tidak digunakan untuk training AI tanpa consent eksplisit

### Regulasi
- Mematuhi UU Perlindungan Data Pribadi (PDP) Indonesia
- Privacy Policy & Terms of Service wajib ada sebelum launch

---

## 10. GO-TO-MARKET

### Strategi Distribusi
**Channel utama: TikTok (@pedetanpajera...)**
- Audiens skincare jerawat yang sudah ada = target user pertama
- Konten behind-the-scenes proses membangun produk
- Edukasi jerawat → funneling ke waitlist/app

### Milestone
| Fase | Target |
|---|---|
| Perencanaan (sekarang) | PRD selesai, nama produk final, design system |
| Design | Moodboard, wireframe, UI final |
| Development | MVP: tracker + onboarding + dashboard + RAG dasar |
| Soft Launch | 100 user pertama dari audiens TikTok |
| Iterasi | Feedback → perbaikan → tambah fitur premium |

### Target Soft Launch
3–4 bulan dari sekarang

---

## 11. YANG MASIH PERLU DIPUTUSKAN

- [x] Nama produk final: **Narehat**
- [x] Konsep nama & visual karakter coach per tema: **Ara, Nara, Rex, Sage** — didokumentasikan di section 6 sebagai referensi, tapi **ditunda ke future release** (bukan bagian MVP), menunggu validasi user asli
- [ ] Desain Lottie character final (menyusul jika/setelah konsep maskot divalidasi post-launch)
- [ ] Scope jurnal dermatologi awal (berapa jurnal, topik apa saja)
- [ ] Target tanggal soft launch yang konkret
- [ ] Struktur affiliate — platform mana yang jadi prioritas (Shopee, Tokopedia, dll)

---

*Dokumen ini akan terus diperbarui seiring perkembangan produk.*
