# CHECKLIST TEKNIS — NarehatSaas v0.1

**Tujuan:** Setup infrastruktur + deployment agar Narehat berfungsi penuh.
**Status:** OpenCode selesai — ini giliran kamu.

---

## A. Supabase — Migration (3 file)

Jalankan SEMUA file ini di **Supabase Dashboard → SQL Editor → New Query**:

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `supabase/migrations/0003_storage_and_seed.sql` | Seed 8 produk rekomendasi (storage bucket R2 — tidak perlu Supabase Storage) |
| 2 | `supabase/migrations/0004_fix_plan_rls.sql` | Fix RLS policy: user tidak bisa ubah plan sendiri (WITH CHECK) |
| 3 | `supabase/migrations/0005_add_theme_column.sql` | Tambah kolom `theme` ke `users` table |

**Cara:**
1. Buka https://supabase.com/dashboard/project/<your-project>/sql/new
2. Copy seluruh isi dari file migration di repo → paste ke editor
3. Klik "Run" (Ctrl+Enter)
4. Ulangi untuk ketiga file

---

## B. Cloudflare Pages — Environment Variables

Buka **Cloudflare Pages Dashboard → Settings → Environment Variables → Add New**:

| Key | Value | Untuk Apa |
|-----|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | (mungkin sudah ada) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | (mungkin sudah ada) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (dari Supabase Dashboard → Settings → API → service_role) | Payment webhook — update plan user tanpa RLS |
| `SUMOPOD_API_KEY` | `sk-...` (dari SumoPod Dashboard) | AI Consult — panggil SumoPod LLM |
| `XENDIT_API_KEY` | `xnd_...` (dari Xendit Dashboard) | Buat invoice di Xendit |
| `XENDIT_WEBHOOK_SECRET` | `wh_...` (dari Xendit Callback config) | Verifikasi callback dari Xendit |
| `NEXT_PUBLIC_APP_URL` | `https://narehat.com` | Redirect URL setelah pembayaran sukses/gagal |
| `NEXT_PUBLIC_SITE_URL` | `https://narehat.com` | URL publik situs (untuk metadata SEO) |
| `R2_ACCESS_KEY_ID` | (dari Cloudflare R2 token) | Kredensial akses R2 |
| `R2_SECRET_ACCESS_KEY` | (dari Cloudflare R2 token) | Kredensial akses R2 |
| `R2_ENDPOINT` | `https://<account_id>.r2.cloudflarestorage.com` | Endpoint S3 R2 |
| `R2_BUCKET_NAME` | `narehat-photos` | Nama bucket foto |
| `R2_PUBLIC_URL` | `https://photos.narehat.com` | URL publik foto (custom domain R2) |

**Setelah semua diisi → klik "Save" lalu "Redeploy" di tab Deployments.**

---

## C. Xendit — Webhook Registration

1. Buka **Xendit Dashboard → Settings → Callbacks**
2. Tambahkan webhook URL: `https://narehat.com/api/payment`
3. Event yang dipilih: `invoice.paid`
4. Copy webhook secret yang dihasilkan → set ke `XENDIT_WEBHOOK_SECRET` di Cloudflare Pages env

---

## D. Supabase — Auth Settings

**Supabase Dashboard → Authentication → Settings:**

| Setting | Nilai | Kenapa |
|---------|-------|--------|
| Site URL | `https://narehat.com` | Redirect URL setelah auth |
| Redirect URLs | `https://narehat.com/**` | Allowed redirect patterns |
| Confirm email | **Disabled** (untuk MVP/testing) | User langsung login setelah register |
| Minimum password length | 8 | Sesuai validasi di register page |

---

## E. Jurnal Dermatologi — Data RAG

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

## F. Testing Checklist

| # | Flow | Langkah | Expected Result |
|---|------|---------|-----------------|
| 1 | Register | Buka `/register` → isi form → klik Daftar | Redirect ke `/onboarding` (atau pesan "Cek email" kalau email confirmation on) |
| 2 | Onboarding | Isi 5 step → klik Selesai | Buka `/settings`, cek skin type sudah sesuai pilihan |
| 3 | Tracker | Buka `/tracker` → isi tidur/air/stress/skincare → Simpan | Tampil pesan "Data berhasil disimpan" |
| 4 | Dashboard | Buka `/dashboard` | Skin score muncul (bukan 0), ringkasan hari ini dari tracker |
| 5 | Progress | Buka `/progress` → pilih "7 hari" / "30 hari" | Chart muncul kalau data tracker sudah ada |
| 6 | AI Consult | Buka `/ai-consult` → tanya "Kenapa jerawat muncul?" | Dapat jawaban + sumber jurnal + disclaimer |
| 7 | Payment | Settings → Kelola → Upgrade Bulanan → Buka Xendit | Invoice Xendit terbuka di tab baru |
| 8 | Middleware | Buka Incognito → ketik `/dashboard` | Redirect ke `/login` |

---

## G. Urutan Eksekusi

```
1.  B.  Set env vars di Cloudflare Pages (supabase URL + keys)
2.  A.  Jalankan 3 migration SQL di Supabase
3.  D.  Supabase Auth settings
4.  C.  Register Xendit webhook
5.  E.  Jalankan ingest jurnal
6.  F.  Testing end-to-end
```

---

## H. Troubleshooting

| Masalah | Cek |
|---------|-----|
| Register gagal "{}" / 500 | Jalankan migration 0002 dulu (INSERT policy + SECURITY DEFINER) |
| AI Consult error "SumoPod" | `SUMOPOD_API_KEY` belum di-set di Cloudflare / invalid key |
| Dashboard skin score 0 terus | Belum ada data `daily_logs` — isi tracker dulu |
| Payment invoice gagal | `XENDIT_API_KEY` belum di-set / invalid |
| Middleware tidak redirect | Deploy ulang setelah middleware.ts di-commit |
| Timeline foto kosong | Belum ada foto di-upload — upload dari tracker dulu |
| AI jawaban generic, tidak spesifik | Jurnal belum di-ingest (step E) / embeddings tidak match |

---

*Update checklist ini setiap ada perubahan infrastruktur.*
