# CHECKLIST TEKNIS — NarehatSaas v0.1

**Tujuan:** Setup infrastruktur + deployment agar Narehat berfungsi penuh.
**Status:** Opencode selesai — ini giliran kamu.

---

## A. Supabase — Migration (4 file)

Jalankan SEMUA file ini di **Supabase Dashboard → SQL Editor → New Query**:

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `supabase/migrations/0003_storage_and_seed.sql` | Seed 8 produk rekomendasi (storage bucket R2 — tidak perlu Supabase Storage) |
| 2 | `supabase/migrations/0004_fix_plan_rls.sql` | Fix RLS policy: user tidak bisa ubah plan sendiri (WITH CHECK) |
| 3 | `supabase/migrations/0005_add_theme_column.sql` | Tambah kolom `theme` ke `users` table |
| 4 | `supabase/migrations/0003_email_verification.sql` | Tambah kolom `email_verified`, `verify_token`, `verify_token_expiry` |

**Cara:**
1. Buka https://supabase.com/dashboard/project/<your-project>/sql/new
2. Copy seluruh isi dari file migration di repo → paste ke editor
3. Klik "Run" (Ctrl+Enter)
4. Ulangi untuk keempat file

---

## B. Cloudflare Pages — Environment Variables

Buka **Cloudflare Pages Dashboard → Settings → Environment Variables → Add New**:

### Supabase
| Key | Value | Untuk Apa |
|-----|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | (mungkin sudah ada) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | (mungkin sudah ada) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (dari Supabase Dashboard → Settings → API → service_role) | Payment webhook — update plan user tanpa RLS |

### NextAuth
| Key | Value | Untuk Apa |
|-----|-------|-----------|
| `AUTH_SECRET` | `openssl rand -hex 32` | Enkripsi JWT session |
| `AUTH_GOOGLE_ID` | (dari Google Cloud Console → OAuth) | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | (dari Google Cloud Console → OAuth) | Google OAuth Client Secret |
| `AUTH_URL` | `https://narehat.com` | URL site (wajib) |

### Turnstile (CAPTCHA)
| Key | Value | Untuk Apa |
|-----|-------|-----------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (dari Cloudflare Turnstile widget) | CAPTCHA di halaman register |
| `TURNSTILE_SECRET` | (dari Cloudflare Turnstile widget) | Server-side verify CAPTCHA |

### Email (Resend)
| Key | Value | Untuk Apa |
|-----|-------|-----------|
| `RESEND_API_KEY` | `re_xxx` (dari Resend Dashboard) | Kirim email forgot password & verifikasi |

### AI + Payment
| Key | Value |
|-----|-------|
| `SUMOPOD_API_KEY` | `sk-...` (dari SumoPod Dashboard) |
| `SUMOPOD_PAYMENT_API_KEY` | `xxx` (dari SumoPod Payment Dashboard) |
| `SUMOPOD_PAYMENT_WEBHOOK_TOKEN` | `whtok_...` (dari SumoPod Payment Settings) |
| `NEXT_PUBLIC_SITE_URL` | `https://narehat.com` |
| `OPENAI_API_KEY` | `sk-...` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `mywisnuwardhana@gmail.com` |

**R2 credentials (sudah tidak perlu — binding via wrangler.jsonc):**
> R2 bucket binding `R2_BUCKET` sudah dikonfigurasi di `wrangler.jsonc`. Tidak perlu env vars `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET_NAME`.

**Setelah semua diisi → klik "Save" lalu "Redeploy" di tab Deployments.**

---

## C. Google Cloud Console — OAuth Setup

1. Buka https://console.cloud.google.com → APIs & Services → Credentials
2. Buat OAuth client ID (Web application)
3. **Authorized redirect URIs:**
   - `https://narehat.com/api/auth/callback/google`
4. Set `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET` di Cloudflare Pages env vars

---

## D. Turnstile — Widget Setup

1. Buka Cloudflare Dashboard → Turnstile → Add Widget
2. **Widget name:** `Narehat Register`
3. **Hostname:** `narehat.com`, `localhost`
4. **Mode:** Managed
5. Copy Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
6. Copy Secret Key → `TURNSTILE_SECRET`

---

## E. Resend — Email Setup

1. Daftar di resend.com
2. Add domain `narehat.com`
3. Tambah DKIM TXT record di Cloudflare DNS
4. Create API Key → set `RESEND_API_KEY`

---

## F. SumoPod Payment — Webhook Registration

1. Buka **SumoPod Payment Dashboard → Settings → Webhooks**
2. Tambahkan webhook URL: `https://narehat.com/api/payment`
3. Copy webhook token yang dihasilkan → set ke `SUMOPOD_PAYMENT_WEBHOOK_TOKEN` di Cloudflare Pages env

---

## G. Jurnal Dermatologi — Data RAG

PENTING: AI Consult TIDAK AKAN BERFUNGSI tanpa step ini. Jurnal harus di-embed dulu ke pgvector.

### Cara

1. Kumpulkan teks jurnal dermatologi (PubMed, AAD, JID, dll) dalam format `.txt`
2. Format file: judul jurnal di baris pertama, konten di baris berikutnya
3. Simpan di folder `data/journals/` (contoh: `data/journals/contoh-jurnal.txt`)
4. Set `SUPABASE_SERVICE_ROLE_KEY` di `.env.local` (file local, tidak di-commit)
5. Jalankan: `npm run ingest`
6. Script akan:
   - Baca semua file `.txt` di folder
   - Generate vector embeddings menggunakan Xenova Transformers
   - Insert ke `public.documents` table di Supabase

### Contoh format file jurnal (`data/journals/acne-diet-2019.txt`):

```
Dietary Factors and Acne Vulgaris
High glycemic index diets and frequent dairy consumption are associated with increased acne prevalence. Studies show that low-glycemic-load diets can reduce acne lesion counts by 23-50% over 12 weeks. Insulin-like growth factor 1 (IGF-1) mediates this relationship by stimulating sebocyte proliferation and lipogenesis.
```

### Target: ~70-90 jurnal dari 7 domain

| Domain | Target |
|--------|--------|
| Acne Basics | 8-10 |
| Acne Treatment | 10-15 |
| Ingredients | 15-20 |
| Lifestyle | 10-15 |
| Skin Barrier | 8-10 |
| Acne Scar (PIH, PIE) | 8-10 |
| Brightening | 8-10 |

---

## H. Testing Checklist

| # | Flow | Langkah | Expected Result |
|---|------|---------|-----------------|
| 1 | Register | Buka `/register` → isi form → Turnstile → klik Daftar | Redirect ke `/onboarding`, email verifikasi terkirim |
| 2 | Onboarding | Isi 5 step → klik Selesai | Buka `/settings`, cek skin type sudah sesuai pilihan |
| 3 | Tracker | Buka `/tracker` → isi tidur/air/stress/skincare → Simpan | Tampil pesan "Data berhasil disimpan" |
| 4 | Dashboard | Buka `/dashboard` | Skin score muncul (bukan 0), ringkasan hari ini dari tracker |
| 5 | Progress | Buka `/progress` → pilih "7 hari" / "30 hari" | Chart muncul kalau data tracker sudah ada |
| 6 | AI Consult | Buka `/ai-consult` → tanya "Kenapa jerawat muncul?" | Dapat jawaban + sumber jurnal + disclaimer |
| 7 | Payment | Settings → Kelola → Upgrade Bulanan → Bayar QRIS | Payment page QRIS terbuka di tab baru |
| 8 | Middleware | Buka Incognito → ketik `/dashboard` | Redirect ke `/login` |
| 9 | Email Reset | Buka `/forgot-password` → masukkan email | Email reset terkirim (cek inbox) |
| 10 | Email Verif | Daftar dengan email → cek inbox | Email verifikasi masuk, klik link → login page banner hijau |

---

## I. Urutan Eksekusi

```
1.  D.  Buat Turnstile widget di Cloudflare Dashboard
2.  C.  Setup Google OAuth di console.cloud.google.com
3.  B.  Set semua env vars di Cloudflare Pages
4.  A.  Jalankan 4 migration SQL di Supabase
5.  E.  Setup Resend.com (domain + API key)
6.  F.  Register SumoPod Payment webhook
7.  G.  Jalankan ingest jurnal
8.  H.  Testing end-to-end
```

---

## J. Troubleshooting

| Masalah | Cek |
|---------|-----|
| Register gagal "{}" / 500 | Jalankan migration 0002 dulu (INSERT policy + SECURITY DEFINER) |
| AI Consult error "SumoPod" | `SUMOPOD_API_KEY` belum di-set / invalid key |
| Dashboard skin score 0 terus | Belum ada data `daily_logs` — isi tracker dulu |
| Payment gagal | `SUMOPOD_PAYMENT_API_KEY` belum di-set / invalid |
| Middleware tidak redirect | Deploy ulang setelah middleware.ts di-commit |
| Timeline foto kosong | Belum ada foto di-upload — upload dari tracker dulu |
| AI jawaban generic, tidak spesifik | Jurnal belum di-ingest (step E) / embeddings tidak match |
| CAPTCHA tidak muncul | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` belum di-set / invalid |
| Email tidak terkirim | `RESEND_API_KEY` belum di-set / Resend domain belum verified |

---

*Update checklist ini setiap ada perubahan infrastruktur.*
