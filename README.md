# Narehat — Jurnal Jerawat Cerdas

**Versi:** 0.2 (MVP Built — pending deployment & user validation)
**Terakhir diperbarui:** Juli 2026

---

## 1. RINGKASAN PRODUK

### Visi
Menjadi platform kesehatan kulit #1 di Indonesia yang membantu user memahami pemicu personal jerawat mereka — bukan sekadar merekomendasikan produk, tapi mengubah data kebiasaan harian menjadi insight yang actionable.

### Tagline
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

## 3. FITUR PRODUK (3-Tier Pricing)

### 🆓 Free — Rp0

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Skin Type Quiz (Onboarding) | 5-step quiz: tipe kulit, kondisi jerawat, kebiasaan, produk yang dipakai, goal | ✅ Done |
| Tracker Ringan | Tidur, minum air, tingkat stress, foto kulit — 30 detik isi | ✅ Done |
| Progress Foto Mingguan | Upload 1x/minggu, timeline view, side-by-side comparison | ✅ Done |
| Rekomendasi Produk | Produk cocok skin type + affiliate link Shopee/Tokopedia | ✅ Done |
| AI Consult — 3x (lifetime) | Tanya spesifik, jawaban backed by jurnal dermatologi peer-reviewed (RAG) | ✅ Done |
| Purging Checker — 1x (lifetime) | "Ini purging atau breakout?" — instant AI analysis | 🔜 Planned |

### ⭐ Premium — Rp19.000/bulan

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Semua fitur Free (unlimited) | — | ✅ |
| AI Consult UNLIMITED | Chat dengan AI RAG jurnal dermatologi 24/7 | ✅ Done |
| AI Deteksi Jerawat dari Foto | Upload foto → jenis jerawat, severity, area, estimasi pemicu | 🔜 Placeholder → real (GPT-4o-mini) |
| Progress Foto Unlimited | Upload tiap hari, export timeline | ✅ Done |
| Deep Insight & Grafik | Korelasi habit vs skin condition, trend 30/90 hari | ✅ Done |
| Notifikasi & Pengingat | Reminder tracker harian, insight baru, promo | ✅ Done |

### 👑 Pro — Rp49.000/bulan

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Semua fitur Premium | — | — |
| AI Analisis Rutinitas Skincare | Upload produk yang dipakai → AI deteksi konflik ingredients, over-exfoliation, kesalahan urutan | 🔜 Planned |
| Personalized Routine Builder | AI generate rutinitas pagi+malam, produk spesifik, budget filter, affiliate link | 🔜 Planned |
| Purging Checker UNLIMITED | Cek setiap kali mulai produk baru | 🔜 Planned |
| Weekly Skin Report | Auto-generate laporan mingguan: skin score, foto banding, trigger terdeteksi, rekomendasi → export PDF | 🔜 Planned |

---

## 4. USER FLOW

### Flow Utama
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

### Onboarding Flow
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
/           → Landing page (Hero, Problem, How It Works, Stats, Testimonials, Pricing)
/pricing    → Harga & 3-tier plan comparison
/about      → Tentang produk
```

### Auth Pages
```
/login       → Masuk
/register    → Daftar akun baru
/onboarding  → Setup awal (hanya muncul sekali)
```

### App Pages (Setelah Login)
```
/dashboard        → Overview kondisi kulit + skin score + insight harian
/tracker          → Input harian (tidur, air, stress, foto; detail toggle untuk exercise, skincare, notes)
/progress         → Grafik tren + timeline foto + perbandingan side-by-side
/ai-consult       → Chat AI berbasis RAG jurnal dermatologi [PREMIUM/PRO]
/recommendations  → Rekomendasi produk + filter + affiliate link
/settings         → Profil, notifikasi, subscription management
```

---

## 6. DESAIN & UI

### Platform
Web App + PWA (bisa di-install di HP seperti native app)

### Design Direction
- **Style:** Minimalis modern dengan kepribadian — bukan template-y
- **Background:** Pure white (#FFFFFF) — bukan cream/off-white
- **Animasi (MVP):** Micro-animation sederhana (transisi angka, progress ring, subtle motion di background/loading state)

### Sistem Tema (Premium/Pro)

| Tema | Accent Color | Tone of Voice |
|------|-------------|---------------|
| Default (Minimalis) | Soft navy / slate | Informatif, bersih |
| Feminine | Dusty rose / mauve | Supportif, encouraging |
| Dark / Sleek | Charcoal + electric blue | To the point, data-driven |
| Nature | Sage green + earth | Holistic, calming |

---

## 7. AI & TEKNOLOGI

### Arsitektur RAG (AI Consult)
```
User Query → Xenova Embedding (local, all-MiniLM-L6-v2)
    → pgvector Similarity Search (Supabase match_documents)
    → Top 3-5 chunks (similarity ≥ 0.75)
    → SumoPod LLM (deepseek-v4-flash, temp 0.5, max 800 token)
    → Jawaban terstruktur + sitasi jurnal + disclaimer
```

### AI Deteksi Jerawat (Premium — pending implementasi)
```
Upload foto → GPT-4o-mini Vision API → analisis:
  - Jenis jerawat (papule, pustule, nodule, cystic, comedonal)
  - Severity (mild / moderate / informative, no medical claim)
  - Area wajah
  - Estimasi faktor pemicu
```

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 App Router + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL + RLS) |
| Vector DB | Supabase pgvector |
| Embeddings | Xenova Transformers (all-MiniLM-L6-v2, local) |
| LLM Provider | SumoPod AI (deepseek-v4-flash) |
| Vision (planned) | OpenAI GPT-4o-mini |
| Payment | Xendit (invoice-based, HMAC-SHA256 verified webhook) |
| Animasi | Framer Motion |
| Hosting | Vercel |

---

## 7.1 STRUKTUR FOLDER

```
narehat/
├── app/
│   ├── (public)/
│   │   ├── page.tsx               → /
│   │   ├── pricing/page.tsx       → /pricing
│   │   └── about/page.tsx         → /about
│   ├── (auth)/
│   │   ├── login/page.tsx         → /login
│   │   ├── register/page.tsx      → /register
│   │   └── onboarding/page.tsx    → /onboarding
│   ├── (app)/
│   │   ├── dashboard/page.tsx     → /dashboard
│   │   ├── tracker/page.tsx       → /tracker
│   │   ├── progress/page.tsx      → /progress
│   │   ├── ai-consult/page.tsx    → /ai-consult
│   │   ├── recommendations/page.tsx → /recommendations
│   │   ├── settings/page.tsx      → /settings
│   │   └── layout.tsx             # Auth guard + bottom nav
│   └── api/
│       ├── auth/                  # ⚠️ Auth callback
│       ├── tracker/               # CRUD daily_logs
│       ├── photos/                # ⚠️ Upload Supabase Storage
│       ├── user/                  # Profile read/update
│       ├── ai/
│       │   ├── detect/            # ⚠️ AI deteksi jerawat (premium, GPT-4o-mini)
│       │   └── consult/           # ⚠️ RAG chat (pgvector + SumoPod LLM)
│       ├── recommendations/       # Produk rekomendasi
│       └── payment/               # ⚠️ Webhook Xendit + create invoice
│
├── components/landing/            # Landing page sections
├── components/ui/                 # Base components
├── components/onboarding/         # Step wizard
│
├── lib/
│   ├── supabase/                  # client.ts, server.ts
│   ├── ai/
│   │   ├── embeddings.ts          # Xenova embeddings + pgvector query
│   │   ├── rag.ts                 # RAG pipeline + SumoPod call
│   │   └── vision.ts              # AI foto deteksi (GPT-4o-mini)
│   ├── insights/correlation.ts    # Korelasi habit ↔ skin score
│   ├── payment/xendit.ts          # ⚠️ Xendit invoice + webhook verify
│   └── security/                  # Rate limiter, file validation
│
├── supabase/migrations/           # ⚠️ 5 migration files
├── types/                         # TypeScript types
├── docs/plans/                    # Threat model, gap analysis, BMC, checklist
├── middleware.ts                  # Auth guard
└── public/                        # Static assets
```

⚠️ = high-risk area, perlu review manual

---

## 7.2 AI CONSULT (RAG) v1.0 — ✅ DONE

### Ruang Lingkup
- Chat AI berbasis RAG dengan citation jurnal dermatologi
- Insight personal dari data tracker user
- Guardrails medis (dilarang diagnosis, resep obat, ganti saran dokter)
- Prompt injection defense (system prompt immutable, input max 500 karakter)
- Jawaban format 5-section: Jawaban Singkat, Penjelasan, Sumber, Langkah Dicoba, Kapan ke Dokter
- Rate limiter 5 request/menit per user

### Knowledge Base
**Sumber:** PubMed, AAD, Journal of Investigative Dermatology, British Journal of Dermatology
**Target:** ≈70-90 jurnal dari 7 domain

| Domain | Target |
|--------|--------|
| Acne Basics | 8-10 |
| Acne Treatment | 10-15 |
| Ingredients | 15-20 |
| Lifestyle | 10-15 |
| Skin Barrier | 8-10 |
| Acne Scar (PIH, PIE) | 8-10 |
| Brightening / Hyperpigmentation | 8-10 |

### Ingest Pipeline
```
File .txt di data/journals/ → chunk 500 token → Xenova embed → insert pgvector
```
Jalankan dengan: `npm run ingest`

---

## 8. MONETISASI

### Model Bisnis
**Freemium 3-tier** — masuk gratis, upgrade untuk AI & personalisasi

### Pricing

| Plan | Harga | Value Proposition |
|------|-------|-------------------|
| **Free** | Rp0 | Kenali kulitmu, mulai dari sini. Tracker ringan, progress foto, 3x AI consult, 1x purging checker. Cukup untuk "oh ini toh pemicunya." |
| **Premium** ⭐ | Rp19.000/bulan | Pakai AI sepuasnya. Deteksi jerawat dari foto, konsultasi AI unlimited, deep insight, notifikasi. |
| **Pro** 👑 | Rp49.000/bulan | AI urus semuanya. Analisis rutinitas, bangun rutinitas baru, purging checker unlimited, laporan mingguan PDF. |

### Revenue Stream Tambahan
- **Affiliate link** produk skincare di halaman rekomendasi (pasif, semua tier)
- **Future:** Data insight anonim untuk brand skincare lokal (B2B)

### Payment Gateway
**Xendit** — invoice-based, HMAC-SHA256 webhook verification, plan auto-update

---

## 9. KEAMANAN

### Sudah Diimplementasikan
- Supabase RLS di semua tabel (owner-based access)
- Middleware auth guard (redirect unauthenticated ke /login)
- Payload validation + file type check (magic bytes, extension, MIME, size, filename)
- Rate limiter AI endpoints (5 req/menit)
- Xendit webhook HMAC-SHA256 signature verification
- Service role key never exposed to client
- Prompt injection defense di system prompt AI

### Regulasi
- Mematuhi UU Perlindungan Data Pribadi (PDP) Indonesia
- Privacy Policy & Terms of Service wajib ada sebelum launch publik

---

## 10. GO-TO-MARKET

### Strategi Distribusi
**Channel utama: TikTok**
- Audiens skincare jerawat yang sudah ada = target user pertama
- Konten behind-the-scenes proses membangun produk
- Edukasi jerawat → funneling ke waitlist/app

### Milestone

| Fase | Status | Target |
|------|--------|--------|
| Design & Branding | ✅ Done | Logo, design system, landing page |
| Core App Development | ✅ Done | Tracker, dashboard, progress, settings, recommendations |
| AI Pipeline | ✅ Done | RAG consult + journal ingest |
| Auth & Security | ✅ Done | Supabase Auth, middleware, RLS, rate limiter |
| Payment Integration | ✅ Done | Xendit invoice + webhook |
| AI Detection (real) | 🔜 Next | GPT-4o-mini vision detection |
| New Pro Features | 🔜 Planned | Purging checker, routine analyzer, builder, weekly report |
| Soft Launch | 🔜 | 50-100 user pertama dari audiens TikTok |
| Iterasi | 🔜 | Feedback → perbaikan → monetisasi |

---

## 11. YANG MASIH PERLU DISELESAIKAN

### Manual — Pengguna
- [ ] Set env vars di Vercel (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, SUMOPOD_API_KEY, XENDIT_API_KEY, XENDIT_WEBHOOK_SECRET, OPENAI_API_KEY)
- [ ] Jalankan 3 migration SQL di Supabase (0003_storage, 0004_fix_rls, 0005_add_theme)
- [ ] Supabase Auth Settings (site URL, redirect, email confirm = off)
- [ ] Register Xendit webhook URL (`/api/payment` + event `invoice.paid`)
- [ ] Kumpulkan & ingest 70-90 jurnal dermatologi (`npm run ingest`)
- [ ] Deploy ke Vercel + testing end-to-end

### Development — Tim
- [ ] AI Deteksi foto: implement GPT-4o-mini vision (placeholder → real)
- [ ] Tracker UI: ringankan ke 4 default card + detail toggle
- [ ] Pricing page: update ke 3-tier (Free/Premium/Pro)
- [ ] Purging Checker: build AI analyzer (instan, per produk baru)
- [ ] AI Routine Analyzer: build ingredient conflict detection
- [ ] Routine Builder: AI generate personalized AM/PM routine
- [ ] Weekly Skin Report: auto-generate + export PDF

---

## 12. DOKUMEN PENDUKUNG

| Dokumen | Path | Deskripsi |
|---------|------|-----------|
| Threat Model | `docs/plans/threat-model/THREAT-MODEL.md` | 6-section security analysis |
| Gap Analysis | `docs/plans/threat-model/GAP-ANALYSIS.md` | 7 functional gaps + fixes |
| Business Model Canvas | `docs/plans/BUSINESS-MODEL-CANVAS.md` | 9 building blocks + unit economics |
| Checklist Teknis | `docs/plans/CHECKLIST-TEKNIS.md` | Manual setup guide (env, migration, testing) |

---

*Dokumen ini diperbarui Juli 2026 — setelah phase 1-3 development selesai, sebelum soft launch.*
