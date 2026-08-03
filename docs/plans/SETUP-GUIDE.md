# Setup Guide — Narehat SaaS v0.2

**Untuk programmer yang akan menangani project ini atau setup ulang dari nol.**

---

## Prasyarat

- Node.js 18+
- Akun [Supabase](https://supabase.com) (free tier cukup)
- Akun [Cloudflare](https://dash.cloudflare.com) (free tier cukup)
- Akun [Google Cloud Console](https://console.cloud.google.com) (untuk OAuth)
- Akun [OpenAI](https://platform.openai.com) (untuk AI deteksi jerawat)
- Akun [SumoPod](https://ai.sumopod.com) (untuk payment + AI Consult RAG)
- Akun [Resend](https://resend.com) (untuk email)
- Domain (contoh: `narehat.com`) — nameserver diarahkan ke Cloudflare

---

## 1. Clone & Install

```bash
git clone https://github.com/wisnuwrdh/narehat.git
cd narehat
npm install
```

---

## 2. Environment Variables

Copy `.env.local` dan isi. Semua key ini juga harus di-set di **Cloudflare Pages Dashboard → Settings → Environment Variables**.

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### NextAuth
```
AUTH_SECRET=<generate dengan: openssl rand -hex 32>
AUTH_GOOGLE_ID=<dari Google Cloud Console>
AUTH_GOOGLE_SECRET=<dari Google Cloud Console>
AUTH_URL=https://narehat.com
```

### Turnstile
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<dari Cloudflare Turnstile>
TURNSTILE_SECRET=<dari Cloudflare Turnstile>
```

### Resend
```
RESEND_API_KEY=re_xxx
```

### AI + Payment
```
SUMOPOD_API_KEY=sk-...
SUMOPOD_PAYMENT_API_KEY=xxx
SUMOPOD_PAYMENT_WEBHOOK_TOKEN=whtok_...
NEXT_PUBLIC_SITE_URL=https://narehat.com
NEXT_PUBLIC_APP_URL=https://narehat.com
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ADMIN_EMAIL=mywisnuwardhana@gmail.com
```

---

## 3. Supabase Setup

### 3.1 Migration

Buka **Supabase Dashboard → SQL Editor → New Query**, jalankan file ini SATU PER SATU:

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `supabase/migrations/0003_storage_and_seed.sql` | Seed 8 produk rekomendasi (foto di R2) |
| 2 | `supabase/migrations/0004_fix_plan_rls.sql` | Fix RLS policy: user tidak bisa ubah plan sendiri |
| 3 | `supabase/migrations/0005_add_theme_column.sql` | Tambah kolom `theme` untuk sync tema |

### 3.2 Catatan Auth

Aplikasi menggunakan **NextAuth.js v5** (bukan Supabase Auth). Tidak perlu set redirect URLs atau Site URL di Supabase Auth Settings. Semua auth flow di-handle oleh NextAuth.

---

## 4. Google Cloud Console — OAuth

1. Buka **Google Cloud Console → APIs & Services → Credentials**
2. **Create OAuth client ID** → Web application
3. **Authorized redirect URIs:**
   - `https://narehat.com/api/auth/callback/google`
4. Copy Client ID → `AUTH_GOOGLE_ID`
5. Copy Client Secret → `AUTH_GOOGLE_SECRET`

---

## 5. Turnstile — Widget

1. Buka **Cloudflare Dashboard → Turnstile → Add Widget**
2. **Widget name:** `Narehat Register`
3. **Hostname:** `narehat.com`, `localhost`
4. **Mode:** Managed
5. Copy Site Key & Secret Key → set ke env vars

---

## 6. Cloudflare R2 Binding Setup

Setelah project Cloudflare Pages dibuat:

1. Buka **Cloudflare Dashboard → R2** → buat bucket `narehat-photos`
2. Binding dikonfigurasi di `wrangler.jsonc` — tidak perlu set manual di Dashboard
3. Binding `R2_BUCKET` dibaca oleh `lib/storage/r2.ts` via `getCloudflareContext().env.R2_BUCKET`
4. Foto disajikan via proxy endpoint `/api/photos/serve?key=...`, bukan public URL

---

## 7. Resend — Email

1. Daftar di resend.com
2. **Add domain** → `narehat.com` → region terdekat (Japan/Singapore)
3. Copy DKIM TXT record → tambah di **Cloudflare Dashboard → DNS → Records**
4. Tunggu verified → **Create API Key** → set `RESEND_API_KEY`

---

## 8. SumoPod Payment Setup

### 8.1 API Key
**SumoPod Payment Dashboard → API Keys:** copy API key → set ke `SUMOPOD_PAYMENT_API_KEY`

### 8.2 Webhook Registration
**SumoPod Payment Dashboard → Settings → Webhooks:**
1. URL: `https://narehat.com/api/payment`
2. Copy webhook token → set ke `SUMOPOD_PAYMENT_WEBHOOK_TOKEN`

---

## 9. OpenAI Setup

1. Buka https://platform.openai.com/api-keys
2. Buat API key baru
3. Isi saldo minimal $5
4. Set ke `OPENAI_API_KEY`

---

## 10. SumoPod (AI) Setup

1. Buka https://ai.sumopod.com
2. Dapatkan API key
3. Set ke `SUMOPOD_API_KEY`

---

## 11. Journal Data (RAG)

### Format file
Simpan file `.md` di `data/journals/`, format per artikel:
```
JUDUL: <judul jurnal>
SUMBER: <jurnal, tahun, penulis — PMID: 12345678>
ISI: <ringkasan konten jurnal>
```

### Menjalankan ingest
```bash
npm run ingest
```
Script: baca `.md`/`.txt` di `data/journals/` → chunk ~350 kata → embed via SumoPod `text-embedding-3-small` → insert ke `public.documents` (pgvector).
Butuh env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUMOPOD_API_KEY`.

### Status: ✅ 91 jurnal ter-ingest dari 8 domain

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

---

## 12. Deploy ke Cloudflare Pages

```bash
# Build untuk Cloudflare
npm run cf:build

# Deploy
npm run cf:deploy
```

Atau connect repo GitHub ke Cloudflare Pages, set build command `npx @opennextjs/cloudflare build` dan output directory `.open-next`.

---

## 13. Testing Checklist

| # | Flow | Langkah | Expected Result |
|---|------|---------|-----------------|
| 1 | Register | Buka `/register` → isi form → Turnstile → klik Daftar | Redirect ke `/onboarding`, email verifikasi terkirim |
| 2 | Onboarding | Isi 5 step → klik Selesai | Buka `/settings`, cek skin type sesuai pilihan |
| 3 | Tracker | Buka `/tracker` → isi tidur/air/stress/foto → Simpan | Tampil pesan "Data berhasil disimpan" |
| 4 | Dashboard | Buka `/dashboard` | Skin score muncul, insight dari data 7 hari |
| 5 | Progress | Buka `/progress` → pilih "7/30/90 hari" | Chart muncul dengan data tracker |
| 6 | AI Consult | Buka `/ai-consult` → tanya "Kenapa jerawat muncul?" | Dapat jawaban + sumber jurnal + disclaimer (max 3x untuk free) |
| 7 | AI Detect | Buka `/progress` → klik "Deteksi AI" di foto | Hasil deteksi: jenis jerawat, lokasi, severity, estimasi pemicu |
| 8 | Payment | Settings → Upgrade Premium/Pro → Bayar via QRIS | QRIS payment page terbuka di tab baru |
| 9 | Theme Sync | Settings → ganti tema | Tema tersimpan ke localStorage + backend |
| 10 | Auth Guard | Buka Incognito → ketik `/dashboard` | Redirect ke `/login` |
| 11 | Forgot Password | Buka `/forgot-password` → masukkan email | Email reset terkirim (cek inbox) |
| 12 | Email Verification | Daftar dengan email baru | Email verifikasi masuk, klik link → "Email berhasil diverifikasi" |

---

## 14. Troubleshooting

| Masalah | Cek |
|---------|-----|
| Register gagal "{}" / 500 | Migration 0002 harus sudah jalan (INSERT policy + SECURITY DEFINER) |
| AI Consult error "SumoPod" | `SUMOPOD_API_KEY` belum di-set / invalid |
| AI Detect error "Gagal menganalisis foto" | `OPENAI_API_KEY` belum di-set / saldo habis |
| Dashboard skin score 0 terus | Belum ada data `daily_logs` — isi tracker dulu |
| Payment gagal | `SUMOPOD_PAYMENT_API_KEY` belum di-set / invalid |
| Middleware tidak redirect | Deploy ulang setelah middleware.ts di-commit |
| Timeline foto kosong | Belum ada foto di-upload — upload dari tracker dulu |
| AI jawaban generic, tidak spesifik | Jurnal belum di-ingest / embeddings tidak match |
| Progress chart tidak muncul | Data tracker belum ada — isi tracker dulu |
| CAPTCHA tidak muncul | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` belum di-set / redeploy belum |
| Email tidak terkirim | `RESEND_API_KEY` belum di-set / domain Resend belum verified |
| Login error "OAuth" | `AUTH_GOOGLE_ID/SECRET` salah / redirect URI tidak cocok |

---

*Update guide ini setiap ada perubahan setup atau infrastruktur.*
