# Narehat — Jurnal Jerawat Cerdas

**Versi:** 0.4 (All Features Built + Gaps Fixed — pending deployment & user validation)
**Terakhir diperbarui:** Juli 2026 (mid-month update)

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
| Tracker Harian | Tidur, minum air, olahraga, tingkat stres, skincare AM/PM — 30 detik isi | ✅ Done |
| Progress Foto | Upload foto, timeline view, side-by-side comparison | ✅ Done |
| Rekomendasi Produk | Produk cocok skin type + link belanja Shopee/Tokopedia | ✅ Done |
| AI Consult: 3x (lifetime) | Tanya spesifik, jawaban backed by jurnal dermatologi peer-reviewed (RAG) | ✅ Done |
| Purging Checker: 1x (lifetime) | "Ini purging atau breakout?" — instant AI analysis | ✅ Done |
| Notifikasi & Pengingat | Reminder tracker, insight baru, promo — gratis untuk semua user | ✅ Done |

### ⭐ Premium — Rp19.000/bulan

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Semua fitur Free | — | ✅ |
| AI Consult UNLIMITED | Chat dengan AI RAG jurnal dermatologi 24/7 | ✅ Done |
| AI Deteksi Jerawat dari Foto | Upload foto → jenis jerawat, severity, area, estimasi pemicu (GPT-4o-mini) | ✅ Done |
| Insight Korelasi & Grafik Tren | Korelasi habit vs skin condition, trend 30/90 hari, analisis Pearson | ✅ Done |
| Foto & Tracking Unlimited | Upload dan akses history tanpa batas | ✅ Done |

### 👑 Pro — Rp49.000/bulan

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Semua fitur Premium | — | — |
| AI Analisis Rutinitas Skincare | Upload produk yang dipakai → AI deteksi konflik ingredients, over-exfoliation, kesalahan urutan (SumoPod LLM) | ✅ Done |
| Personalized Routine Builder | AI generate rutinitas pagi+malam, produk spesifik, budget filter, link belanja | ✅ Done |
| Purging Checker UNLIMITED | Cek setiap kali mulai produk baru | ✅ Done |
| Weekly Skin Report + Export PDF | Auto-generate laporan mingguan: skin score, foto banding, trigger, rekomendasi → export PDF | ✅ Done |
| Password Reset | Reset password via email | ✅ Done |
| Cancel Plan | Pembatalan subscription kapan saja | ✅ Done |

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
/tracker          → Input harian (tidur, air, stress, foto; detail toggle untuk exercise, skincare, notes; AI deteksi + purging checker)
/progress         → Grafik tren + timeline foto + perbandingan side-by-side + export laporan PDF
/ai-consult       → Chat AI berbasis RAG jurnal dermatologi (3x free, unlimited Premium)
/notifications    → In-app notification center (reminder, insight, promo)
/routine          → AI analisis rutinitas + builder rutinitas personal [PRO]
/recommendations  → Rekomendasi produk + filter + link belanja
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

### Brand Identity
- **Primary color:** Navy `#3525cd` — bersih, profesional, consistent across all pages
- **Animasi:** Micro-animation sederhana (transisi angka, progress ring, chart animation)

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

### AI Deteksi Jerawat (Premium — GPT-4o-mini Vision)
```
Upload foto → GPT-4o-mini Vision API → analisis:
  - Jenis jerawat (papule, pustule, nodule, cystic, comedonal)
  - Severity (mild / moderate / informative, no medical claim)
  - Area wajah
  - Estimasi faktor pemicu
  - Disimpan ke skin_photos.ai_analysis (JSONB)
```

### AI Purging Checker (Pro — GPT-4o-mini Vision)
```
Upload foto + nama produk baru → GPT-4o-mini Vision → klasifikasi:
  - Purging (reaksi normal, bertahan 4-6 minggu) vs Breakout (reaksi negatif)
  - Confidence score + rekomendasi tindakan
```

### AI Routine Analyzer (Pro — SumoPod LLM)
```
Input daftar produk → SumoPod deepseek-v4-flash → analisis:
  - Konflik ingredients, over-exfoliation, urutan pemakaian salah
  - Missing steps, iritan, duplikasi produk
```

### AI Routine Builder (Pro — SumoPod LLM)
```
Quiz: skin type, goal, budget, preferensi waktu → AI generate:
  - Rutinitas AM + PM card lengkap dengan rekomendasi produk
```

### Weekly Skin Report (Pro — Print/PDF)
```
GET /api/report → aggregate 7 hari tracker + foto + insight + AI results
→ HTML report di tab baru → window.print() → simpan sebagai PDF
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
  │   │   ├── notifications/page.tsx → /notifications
  │   │   ├── routine/page.tsx       → /routine [PRO]
  │   │   ├── recommendations/page.tsx → /recommendations
  │   │   ├── settings/page.tsx      → /settings
  │   │   └── layout.tsx             # Auth guard + bottom nav + UserProvider
  │   └── api/
  │       ├── auth/                  # ⚠️ Auth callback
  │       ├── tracker/               # CRUD daily_logs
  │       ├── photos/                # ⚠️ Upload Supabase Storage
  │       ├── user/                  # Profile read/update
  │       ├── ai/
  │       │   ├── detect/            # ⚠️ AI deteksi jerawat (GPT-4o-mini)
  │       │   ├── consult/           # ⚠️ RAG chat (pgvector + SumoPod LLM)
  │       │   ├── purging/           # ⚠️ Purging vs breakout checker (GPT-4o-mini)
  │       │   ├── routine-analyze/   # ⚠️ AI analisis rutinitas (SumoPod LLM)
  │       │   ├── routine-build/     # ⚠️ AI builder rutinitas (SumoPod LLM)
  │       │   └── quota/             # GET remaining AI quota (ai_usage table)
  │       ├── report/                # Weekly skin report (aggregate + PDF)
  │       ├── recommendations/       # Produk rekomendasi
  │       ├── notifications/          # CRUD notifikasi user
  │       └── payment/               # ⚠️ Webhook Xendit + create invoice
  │
  ├── components/landing/            # Landing page sections
  ├── components/ui/                 # Base components
  ├── components/onboarding/         # Step wizard
  ├── contexts/                      # React Context providers (UserContext)
  │
  ├── lib/
  │   ├── supabase/                  # client.ts, server.ts
  │   ├── ai/
  │   │   ├── embeddings.ts          # Xenova embeddings + pgvector query
  │   │   ├── rag.ts                 # RAG pipeline + SumoPod call
  │   │   ├── vision.ts              # AI foto deteksi (GPT-4o-mini)
  │   │   ├── purging.ts             # Purging vs breakout classifier (GPT-4o-mini)
  │   │   └── routine.ts             # Routine analyzer + builder (SumoPod LLM)
  │   ├── insights/correlation.ts    # Korelasi habit ↔ skin score
  │   ├── payment/xendit.ts          # ⚠️ Xendit invoice + webhook verify
  │   └── security/                  # Rate limiter, file validation
  │
  ├── supabase/migrations/           # 9 migration files (0000-0008)
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
| **Free** | Rp0 | Kenali kulitmu, mulai dari sini. Tracker harian, progress foto, 3x AI consult, 1x purging checker. |
| **Premium** ⭐ | Rp19.000/bulan | AI jadi asisten kulitmu. Deteksi jerawat dari foto, konsultasi AI unlimited, insight korelasi. |
| **Pro** 👑 | Rp49.000/bulan | AI urus semuanya. Analisis rutinitas, bangun rutinitas baru, purging checker unlimited, laporan mingguan PDF. |

### Revenue Stream Tambahan
- **Link belanja** produk skincare di halaman rekomendasi (pasif, semua tier)
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
- AI quota enforcement server-side (ai_usage table — immutable, append-only — prevents free tier bypass via localStorage/record deletion)

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
| AI Vision Detection | ✅ Done | GPT-4o-mini: acne detection, purging checker |
| AI Routine Analyzer | ✅ Done | SumoPod LLM: conflict detection, routine builder |
| Weekly Skin Report | ✅ Done | Aggregate → HTML → print PDF |
| Auth & Security | ✅ Done | Supabase Auth, middleware, RLS, rate limiter, quota enforcement |
| Payment Integration | ✅ Done | Xendit invoice + webhook |
| Perf Optimization | ✅ Done | Batched API calls (127→1), UserContext caching |
| Soft Launch | 🔜 | 50-100 user pertama dari audiens TikTok |
| Iterasi | 🔜 | Feedback → perbaikan → monetisasi |

---

## 11. YANG MASIH PERLU DISELESAIKAN

### Manual — Pengguna
- [ ] Set env vars (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, SUMOPOD_API_KEY, OPENAI_API_KEY, XENDIT_API_KEY, XENDIT_WEBHOOK_SECRET)
- [x] Jalankan migration SQL di Supabase (0000–0009)
- [ ] Supabase Auth Settings (site URL, redirect, email confirm = on untuk password reset)
- [ ] Register Xendit webhook URL (`/api/payment` + event `invoice.paid`)
- [ ] Kumpulkan & ingest 70-90 jurnal dermatologi (`npm run ingest`)
- [ ] Deploy ke Vercel + testing end-to-end

### Development — Tim
- [x] Notifikasi & pengingat (in-app notification center) — gratis semua user
- [x] Pricing page: 3-tier (Free/Premium/Pro) — sesuai fakta implementasi
- [x] AI Deteksi foto: GPT-4o-mini vision detection
- [x] Purging Checker: AI analyzer purging vs breakout
- [x] AI Routine Analyzer: ingredient conflict detection (SumoPod LLM)
- [x] Routine Builder: AI generate personalized AM/PM routine
- [x] Weekly Skin Report: auto-generate + export PDF (Pro-only gated)
- [x] AI Usage Quota: server-side immutable counter (ai_usage table)
- [x] Perf Optimization: batched API calls, UserContext caching
- [x] Insight Korelasi: Pearson correlation habit vs skin score (Premium-gated)
- [x] Password Reset: Supabase Auth reset flow
- [x] Cancel Plan: API + UI untuk pembatalan subscription
- [x] DB Enum fix: tambah pro_monthly, pro_yearly (migration 0009)
- [x] Copywriting: hapus em dash, ganti "affiliate" jadi "link belanja"

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
