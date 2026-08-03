# Narehat — Jurnal Jerawat Cerdas

**Versi:** 0.9.2 (Cloudflare Pages + OpenNext + NextAuth)
**Terakhir diperbarui:** Agustus 2026

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
| Tracker Harian | Tidur, minum air, olahraga, tingkat stress, skincare AM/PM — 30 detik isi | ✅ Done |
| Progress Foto | Upload foto, timeline view, side-by-side comparison (modal thumbnail picker) | ✅ Done |
| Rekomendasi Produk | Produk cocok skin type + link belanja Shopee/Tokopedia | ✅ Done |
| AI Consult — 10x/bulan | Tanya spesifik, jawaban backed by jurnal dermatologi peer-reviewed (RAG) | ✅ Done |
| AI Deteksi Jerawat — 2x/bulan | Upload foto → jenis jerawat, severity, area, estimasi pemicu (gpt-4o-mini) | ✅ Done |
| Purging Checker — 1x/bulan | "Ini purging atau breakout?" — instant AI analysis (gpt-5-mini) | ✅ Done |

### ⭐ Premium — Rp29.000/bulan (Rp199.000/tahun)

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Semua fitur Free | — | ✅ |
| AI Consult — 100x/bulan | Chat dengan AI RAG jurnal dermatologi 24/7 | ✅ Done |
| AI Deteksi Jerawat — 30x/bulan | Upload foto → jenis jerawat, severity, area, estimasi pemicu (gpt-5-mini) | ✅ Done |
| Purging Checker — 10x/bulan | "Ini purging atau breakout?" — instant AI analysis (gpt-5-mini) | ✅ Done |
| Deep Insight & Grafik | Korelasi habit vs skin condition, trend 30/90 hari | ✅ Done |
| Progress Foto Unlimited | Upload tiap hari, export timeline | ✅ Done |

### 👑 Pro — Rp49.000/bulan (Rp399.000/tahun)

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Semua fitur Premium | — | — |
| AI Deteksi Jerawat — 100x/bulan | Analisis paling mendalam dengan GPT-5 penuh | ✅ Done |
| AI Analisis Rutinitas Skincare | Upload produk yang dipakai → AI deteksi konflik ingredients, over-exfoliation, kesalahan urutan (SumoPod LLM) | ✅ Done |
| Personalized Routine Builder | AI generate rutinitas pagi+malam, produk spesifik, budget filter, link belanja | ✅ Done |
| Weekly Skin Report | Auto-generate laporan 7/30/90 hari: skin score, foto banding, trigger, rekomendasi → export HTML print PDF (gate ke Pro di UI + API) | ✅ Done |
| Akses fitur baru lebih awal | Beta tester fitur upcoming | 🔜 |

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
/about     → Tentang Narehat — misi, masalah, solusi, proses
/privacy   → Kebijakan Privasi — UU PDP 2022 compliant
/terms     → Syarat & Ketentuan — ToS + medical disclaimer
/contact   → Kontak — email, jam operasional
/blog      → Blog — coming soon (edukasi jerawat & skincare)
/offline   → Halaman offline saat tidak ada koneksi (PWA)
```

### Auth Pages
```
/login              → Masuk (2-step: Google/Email → form Email)
/register           → Daftar akun baru (2-step: Google/Email → form Email, Turnstile CAPTCHA)
/forgot-password    → Lupa password — kirim link reset ke email (via Resend)
/reset-password     → Buat password baru (token dari email)
/auth/callback      → Google OAuth callback (code exchange → onboarding check)
/onboarding         → Setup awal (hanya muncul sekali, cek lewat profile fields)
```

### App Pages (Setelah Login)
```
/dashboard        → Overview kondisi kulit + skin score + insight harian
/tracker          → Input harian (tidur, air, stress, foto; detail toggle untuk exercise, skincare, notes; AI deteksi + purging checker)
/progress         → Grafik tren + timeline foto + perbandingan side-by-side + export laporan PDF [PRO]
/ai-consult       → Chat AI berbasis RAG jurnal dermatologi (10x free, 100x Premium, 300x Pro)
/routine          → AI analisis rutinitas + builder rutinitas personal [PRO]
/recommendations  → Rekomendasi produk + filter + link belanja
/settings         → Profil display, kelola plan, export data (CSV/PDF), hapus akun, logout
/subscription     → Pilih plan — Free/Premium/Pro, monthly/yearly toggle, payment via SumoPod
/profile          → Edit profil — nama, tipe kulit, kondisi jerawat, goal
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

## 6.1 PWA SUPPORT

Narehat dapat di-install sebagai aplikasi di HP seperti native app.

### Browser Support
| Browser | Install Full | Keterangan |
|---|---|---|
| Chrome Android | ✅ | App drawer |
| Edge Android | ✅ | App drawer |
| Brave Android | ✅ | App drawer |
| Samsung Internet | ✅ | App drawer |
| Safari iOS | ⚠️ | "Add to Home Screen" (fullscreen) |
| Firefox Android | ❌ | Hanya shortcut |

### Implementasi
| Elemen | Detail |
|---|---|
| **Manifest** | `public/manifest.json` — `display: standalone`, `theme_color: #3525cd` |
| **Service Worker** | `app/sw.ts` — Serwist library, precache `/offline` |
| **Offline Page** | `app/offline/page.tsx` — custom "Kamu Sedang Offline" |
| **Ikon PWA** | `icon-192x192.png`, `icon-512x512.png`, `favicon.svg` |
| **iOS Meta** | `apple-mobile-web-app-capable`, `apple-touch-icon` |
| **Viewport** | `width=device-width, initial-scale=1, theme-color=#3525cd` |

### Yang Perlu Disiapkan (Aset)
- [ ] `public/icon-192x192.png` — 192×192 PNG
- [ ] `public/icon-512x512.png` — 512×512 PNG
- [ ] `public/apple-touch-icon.png` — 180×180 PNG
- [ ] `public/og-image.png` — 1200×630 PNG (social share)

---

## 7. AI & TEKNOLOGI

### Arsitektur RAG (AI Consult)
```
User Query → SumoPod Embedding (text-embedding-3-small, 384 dim)
    → pgvector Similarity Search (Supabase match_documents)
    → Top 5 chunks (similarity ≥ 0.4)
    → SumoPod LLM (deepseek-v4-flash, temp 0.5, max 2000 token)
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
GET /api/report?range=7|30|90 → aggregate tracker + foto + insight + AI results
→ HTML report di tab baru → window.print() → simpan sebagai PDF
```
Export PDF hanya untuk member Pro: UI menampilkan paywall upgrade, API return `402` untuk plan non-Pro (insight gratis tetap jalan).

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 App Router + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| Auth | NextAuth.js v5 (Google OAuth + email/password via Credentials) |
| Database | Supabase (PostgreSQL) — RLS dihapus, authorization via API routes + session |
| Vector DB | Supabase pgvector |
| Embeddings | SumoPod AI (text-embedding-3-small, 384 dim) |
| LLM Provider | SumoPod AI (deepseek-v4-flash) |
| Vision | OpenAI GPT-4o-mini |
| Payment | SumoPod (QRIS-based, webhook HMAC + token verification) |
| CAPTCHA | Cloudflare Turnstile |
| Email | Resend (API) |
| Animasi | Framer Motion |
| Hosting | Cloudflare Pages + Workers (via OpenNext adapter) |
| Adapter | `@opennextjs/cloudflare` — Next.js → CF Workers |
| Static Assets | `env.ASSETS` binding via Cloudflare Pages |
| Storage Foto | Cloudflare R2 (Workers binding, proxy serve via `/api/photos/serve`) |
| Build Tool | Custom `scripts/build-pages.mjs` |
| Domain | `narehat.com` (Cloudflare DNS + Pages custom domain) |
| Platform | Android Termux (build lokal) → Cloudflare x86 Linux (deploy) |

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
│   │   ├── register/page.tsx      → /register (Turnstile CAPTCHA)
│   │   ├── forgot-password/page.tsx → /forgot-password (kirim email)
│   │   ├── reset-password/page.tsx  → /reset-password
│   │   ├── onboarding/page.tsx    → /onboarding
│   │   └── callback/route.ts      → /auth/callback (Google OAuth)
│   ├── (app)/
│   │   ├── dashboard/page.tsx      → /dashboard
│   │   ├── tracker/page.tsx        → /tracker
│   │   ├── progress/page.tsx       → /progress
│   │   ├── ai-consult/page.tsx     → /ai-consult
│   │   ├── routine/page.tsx        → /routine [PRO]
│   │   ├── recommendations/page.tsx → /recommendations
│   │   ├── settings/page.tsx       → /settings
│   │   ├── subscription/page.tsx   → /subscription
│   │   ├── profile/page.tsx        → /profile
│   │   └── layout.tsx              # Auth guard + bottom nav (mobile) / left sidebar (md+) + UserProvider
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/      # NextAuth handler
│       │   ├── forgot-password/    # Generate token + kirim email reset
│       │   └── callback/           # Google OAuth callback
│       ├── turnstile/              # Server-side Turnstile verify
│       ├── tracker/               # CRUD daily_logs
│       ├── photos/                # CRUD + proxy serve via /api/photos/serve
│       ├── user/                  # Profile read/update
│       ├── ai/
│       │   ├── detect/            # AI deteksi jerawat (GPT-4o-mini)
│       │   ├── consult/           # RAG chat (pgvector + SumoPod LLM)
│       │   ├── purging/           # Purging vs breakout checker (GPT-4o-mini)
│       │   ├── routine-analyze/   # AI analisis rutinitas (SumoPod LLM)
│       │   ├── routine-build/     # AI builder rutinitas (SumoPod LLM)
│       │   └── quota/             # GET remaining AI quota (ai_usage table)
│       ├── report/                # Skin report (range 7/30/90, aggregate + HTML print)
│       ├── export/                # Export semua data user (JSON data provider)
│       ├── recommendations/       # Produk rekomendasi
│       └── payment/               # SumoPod payment + webhook
│
├── components/landing/            # Landing page sections
├── components/ui/                 # Base components (Turnstile, Logo, dll)
├── components/onboarding/         # Step wizard
├── contexts/                      # React Context providers (UserContext, ToastContext)
│
├── lib/
│   ├── supabase/                  # client.ts, server.ts
│   ├── storage/
│   │   └── r2.ts                  # Upload/delete via R2 Workers binding, return proxy URL
│   ├── image/
│   │   └── client-compress.ts     # Client-side WebP compression (1200px max, quality 0.85)
│   ├── email/
│   │   ├── send.ts                # Kirim email via Resend API
│   │   └── templates.ts           # HTML template reset password & verifikasi
│   ├── turnstile/
│   │   └── verify.ts              # Server-side Turnstile siteverify
│   ├── utils/
│   │   ├── binary.ts              # arrayBufferToBase64 (Workers-safe)
│   │   └── utils.ts               # cn() classname helper
│   ├── ai/
│   │   ├── embeddings.ts          # SumoPod embeddings + pgvector query
│   │   ├── rag.ts                 # RAG pipeline + SumoPod call
│   │   ├── vision.ts              # AI foto deteksi (GPT-4o-mini)
│   │   ├── purging.ts             # Purging vs breakout classifier (GPT-4o-mini)
│   │   └── routine.ts             # Routine analyzer + builder (SumoPod LLM)
│   ├── insights/correlation.ts    # Korelasi habit ↔ skin score
│   ├── export/formatters.ts       # CSV & PDF formatter (label Indonesia)
│   ├── payment/sumopod.ts         # SumoPod payment + webhook verify
│   └── security/                  # Rate limiter, file validation
│
├── auth.ts                        # NextAuth config (Google + Credentials, JWT)
├── middleware.ts                  # Auth guard (NextAuth authorized callback)
├── supabase/migrations/           # 10 migration files (0000-0009)
├── types/                         # TypeScript types
├── docs/plans/                    # Threat model, gap analysis, BMC, checklist
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
**Sumber:** PubMed, AAD, JEADV, British Journal of Dermatology, JCAD, Cochrane, Cureus
**Status:** ✅ 91 jurnal ter-ingest dari 8 domain

| Domain | Target | Aktual |
|--------|--------|--------|
| Acne Basics | 8-10 | 9 |
| Acne Treatment | 10-15 | 11 |
| Skincare Ingredients | 15-20 | 17 |
| Lifestyle & Diet | 10-15 | 15 |
| Skin Barrier | 8-10 | 9 |
| Acne Scar (PIH, PIE) | 8-10 | 10 |
| Brightening / Hyperpigmentation | 8-10 | 10 |
| Skincare Routine | 8-10 | 10 |

Setiap artikel memiliki identitas valid (PMID/DOI) yang diverifikasi ke PubMed; artikel halusinasi ditolak/diperbaiki.

### Ingest Pipeline
```
File .md di data/journals/ (format JUDUL/SUMBER/ISI) → chunk ~350 kata
→ SumoPod embed (text-embedding-3-small) → insert pgvector
```
Jalankan dengan: `npm run ingest`

---

## 8. MONETISASI

### Model Bisnis
**Freemium 3-tier** — masuk gratis, upgrade untuk AI & personalisasi

### Pricing

| Plan | Harga | Value Proposition |
|------|-------|-------------------|
| **Free** | Rp0 | Rasakan lega pertama. Tracker ringan, progress foto, AI Deteksi 2x/bulan, AI consult 10x/bulan. Cukup untuk "oh ini toh pemicunya." |
| **Premium** ⭐ | Rp29.000/bulan (Rp199.000/tahun) | Kepastian penuh. AI Deteksi 30x/bulan (gpt-5-mini), konsultasi AI 100x/bulan, purging checker 10x/bulan, deep insight. |
| **Pro** 👑 | Rp49.000/bulan (Rp399.000/tahun) | Semua diurus. AI Deteksi 100x/bulan (GPT-5 penuh), konsultasi AI 300x/bulan, analisis rutinitas, laporan mingguan PDF, akses model baru lebih awal. |

### Revenue Stream Tambahan
- **Link belanja** produk skincare di halaman rekomendasi (pasif, semua tier)
- **Future:** Data insight anonim untuk brand skincare lokal (B2B)

### Payment Gateway
**SumoPod** — QRIS-based payment, webhook signature + token verification, plan auto-update

---

## 9. KEAMANAN

### Sudah Diimplementasikan
- NextAuth session-based authorization (di API routes via `auth()` helper)
- Middleware auth guard (redirect unauthenticated ke /login; onboarding check via profile fields di login page & callback)
- Payload validation + file type check (magic bytes, extension, MIME, size, filename)
- Rate limiter AI endpoints (5 req/menit)
- SumoPod webhook HMAC-SHA256 + token verification
- Service role key never exposed to client
- Prompt injection defense di system prompt AI
- AI quota enforcement server-side (ai_usage table — immutable, append-only — prevents free tier bypass via localStorage/record deletion)

### Regulasi
- Mematuhi UU Perlindungan Data Pribadi (PDP) Indonesia
- Privacy Policy & Terms of Service wajib ada sebelum launch publik

---

## 9.1 KEAMANAN AKUN

### Hapus Akun (Full Cleanup)
Saat user menghapus akun via Settings, semua data dihapus permanen:
1. File foto dari Cloudflare R2 (narehat-photos bucket)
2. Metadata foto (skin_photos table)
3. Daily logs, insights, skincare products, notifications, ai_usage
4. User profile + auth account (via service role)
5. Urutan: R2 files → DB rows → auth user

### Export Data
User bisa mendownload semua data mereka dari halaman Settings:
- **CSV**: spreadsheet, label Indonesia, kolom id/user_id disembunyikan
- **PDF**: laporan terformat dengan tabel per kategori
- Semua data: profil, daily logs, foto, produk, insight, notifikasi, AI usage

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
| Core App Development | ✅ Done | Tracker, dashboard, progress (grafik + korelasi + insight), settings, recommendations |
| AI Pipeline | ✅ Done | RAG consult + journal ingest |
| AI Vision Detection | ✅ Done | GPT-4o-mini: acne detection, purging checker |
| AI Routine Analyzer | ✅ Done | SumoPod LLM: conflict detection, routine builder |
| Weekly Skin Report | ✅ Done | Aggregate → HTML → print PDF |
| Auth & Security | ✅ Done | NextAuth.js v5, middleware, Turnstile CAPTCHA, rate limiter, quota enforcement |
| Payment Integration | ✅ Done | SumoPod QRIS + webhook |
| Perf Optimization | ✅ Done | Batched API calls (127→1), UserContext caching |
| Cloudflare Migration | ✅ Done | Pages + Workers via OpenNext, R2 storage, custom build script, custom domain |
| Email System | ✅ Done | Resend: forgot password + email verification + Email Routing (hello@/support@/noreply@) |
| Soft Launch | 🔜 | 50-100 user pertama dari audiens TikTok |
| Iterasi | 🔜 | Feedback → perbaikan → monetisasi |

---

## 11. YANG MASIH PERLU DISELESAIKAN

### Checklist — Deploy & Migrasi ke Cloudflare

**Fase 0 — Backup (sebelum apa-apa)**
- [x] `pg_dump` database Supabase
- [x] Download semua foto dari bucket `skin_photos` (Supabase Storage)
- [x] Catat semua env vars dari Vercel dashboard

**Fase 1 — Setup Cloudflare**
- [x] Buat akun Cloudflare + R2 bucket `narehat-photos`
- [x] Generate R2 API token (Access Key ID + Secret Access Key)
- [x] Catat R2 endpoint + bucket name

**Fase 2 — Deploy ke Preview URL**
- [x] Connect repo GitHub ke Cloudflare Pages
- [x] Set semua env vars di Cloudflare Pages dashboard
- [x] Build command: `npx @opennextjs/cloudflare build` — output dir: `.open-next`
- [x] Patches: native modules dikosongin untuk Android compat
- [x] **SEMENTARA:** tambahkan preview URL ke Google OAuth redirect URIs
- [x] Smoke test 14 flow di preview URL

**Fase 3 — Cutover Domain (selesai)**
- [x] Beli domain `narehat.com` via Rumah Web, nameserver → Cloudflare
- [x] Custom domain di Pages → `narehat.com`
- [x] Update Google OAuth redirect URI → `https://narehat.com/api/auth/callback/google`
- [x] Set `AUTH_URL=https://narehat.com` di Cloudflare Pages env
- [x] Migrasi auth: Supabase Auth → NextAuth.js v5 (Google + Credentials, JWT)
- [x] Update Google OAuth consent screen (production status)
- [x] Smoke test ulang di domain final

**Fase 4 — Email & Security**
- [x] Setup Email Routing: `hello@`, `support@`, `noreply@` → forward ke Gmail
- [x] Setup Email Sending via Resend (forgot password, email verification)
- [x] Setup Turnstile CAPTCHA di halaman register
- [x] Fix duplicate Google accounts (signIn + jwt callback)

**Fase 5 — Cleanup (setelah stabil 3-7 hari)**
- [x] Hapus project dari Vercel
- [ ] Hapus bucket `skin_photos` di Supabase Storage
- [x] Kumpulkan & ingest 91 jurnal dermatologi (`npm run ingest`)
- [ ] Register SumoPod webhook URL final (kalau belum)

---

- [x] Copywriting: hapus em dash (—) di landing + about + privacy + terms
- [x] Halaman legal: /privacy, /terms, /contact, /blog (dengan back button)
- [x] Ganti "affiliate" jadi "link belanja" di semua copywriting
- [x] Footer fix: link placeholder + hapus double Privacy/Terms button
- [x] PWA support: manifest, service worker (Serwist), offline page, meta tags, icons
- [x] Halaman /subscription: in-app pricing, monthly/yearly toggle, SumoPod payment
- [x] Halaman /profile: edit profil lengkap (nama, tipe kulit, kondisi, goal)
- [x] Avatar SVG profile + favicon logo asli Narehat
- [x] Hapus fitur notifikasi (page, API, badge, toggles, UserContext)
- [x] Dashboard header: hapus bell icon + profile icon (via bottom nav Akun)
- [x] Settings simplifikasi: display-only profile card, link ke /profile + /subscription
- [x] Insight Korelasi: Pearson correlation habit vs skin score (Premium-gated)
- [x] Report: dynamic range 7/30/90 hari
- [x] Export Data CSV/PDF dari Settings (semua data user, label Indonesia)
- [x] Toast system: global floating toast ganti 14 duplikat di 5 halaman
- [x] Hapus Akun: delete file storage + semua tabel termasuk ai_usage & notifikasi
- [x] Progress: modal thumbnail picker ganti prompt() untuk bandingkan foto
- [x] AI Detect dari timeline: gunakan photo_id untuk update row existing (hindari duplikat)
- [x] Password Reset flow (NextAuth) + Forgot Password page (kirim email via Resend)
- [x] Google OAuth login dengan 2-step UI (Google/Email → form Email) + callback route
- [x] Onboarding check via profile fields (login page & callback) — removed from middleware
- [x] DB enum: tambah pro_monthly, pro_yearly
- [x] Pricing restructure: monthly AI limits (10 consult/bulan free), yearly toggle, AI vision paid-only
- [x] Landing page: dashboard mockup di Hero, CTA "Coba Gratis", hapus badge "gratis"
- [x] Responsive layout: left sidebar di md+, app pages max-w-4xl, auth pages max-w-lg
- [x] Cancel Plan API + UI
- [x] Report PDF gate ke Pro

---

## 12. DOKUMEN PENDUKUNG

| Dokumen | Path | Deskripsi |
|---------|------|-----------|
| Threat Model | `docs/plans/threat-model/THREAT-MODEL.md` | 6-section security analysis |
| Gap Analysis | `docs/plans/threat-model/GAP-ANALYSIS.md` | 7 functional gaps + fixes |
| Business Model Canvas | `docs/plans/BUSINESS-MODEL-CANVAS.md` | 9 building blocks + unit economics |
| Checklist Teknis | `docs/plans/CHECKLIST-TEKNIS.md` | Manual setup guide (env, migration, testing) |
| Setup Guide | `docs/plans/SETUP-GUIDE.md` | Setup ulang dari nol |
| Deploy Guide | `docs/DEPLOY.md` | Deployment pipeline & env vars reference |

---

*Dokumen ini diperbarui Agustus 2026 — setelah NextAuth migration, Turnstile, Email (Resend + Routing), domain cutover, cancel plan, gate Report PDF ke Pro, dan ingest 91 jurnal ke RAG.*

