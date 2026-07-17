# Setup Guide — Narehat SaaS v0.2

**Untuk programmer yang akan menangani project ini atau setup ulang dari nol.**

---

## Prasyarat

- Node.js 18+
- Akun [Supabase](https://supabase.com) (free tier cukup)
- Akun [Cloudflare](https://dash.cloudflare.com) (free tier cukup)
- Akun [Xendit](https://xendit.co) (untuk payment)
- Akun [OpenAI](https://platform.openai.com) (untuk AI deteksi jerawat)
- Akun [SumoPod](https://ai.sumopod.com) (untuk AI Consult RAG)

---

## 1. Clone & Install

```bash
git clone https://github.com/wisnuwrdh/narehat.git
cd narehat
npm install
```

---

## 2. Environment Variables

Copy `.env.local` dan isi:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUMOPOD_API_KEY=sk-...
XENDIT_API_KEY=xnd_...
XENDIT_WEBHOOK_SECRET=wh_...
NEXT_PUBLIC_APP_URL=https://narehat.com
OPENAI_API_KEY=sk-...
```

Semua key ini juga harus di-set di **Cloudflare Pages Dashboard → Settings → Environment Variables**.

---

## 3. Supabase Setup

### 3.1 Migration

Buka **Supabase Dashboard → SQL Editor → New Query**, jalankan file ini SATU PER SATU:

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `supabase/migrations/0003_storage_and_seed.sql` | Seed 8 produk rekomendasi (storage bucket sudah dihapus — foto kini di R2) |
| 2 | `supabase/migrations/0004_fix_plan_rls.sql` | Fix RLS policy: user tidak bisa ubah plan sendiri |
| 3 | `supabase/migrations/0005_add_theme_column.sql` | Tambah kolom `theme` ke `users` table untuk sync tema antar device |

### 3.2 Auth Settings

**Supabase Dashboard → Authentication → Settings:**

| Setting | Nilai |
|---------|-------|
| Site URL | `https://narehat.com` |
| Redirect URLs | `https://narehat.com/**` |
| Confirm email | **Disabled** (untuk testing) |
| Minimum password length | 8 |

---

## 4. Xendit Setup

### 4.1 Webhook Registration

**Xendit Dashboard → Settings → Callbacks:**

1. URL: `https://narehat.com/api/payment`
2. Event: `invoice.paid`
3. Copy webhook secret → set ke `XENDIT_WEBHOOK_SECRET`

### 4.2 API Key

**Xendit Dashboard → Settings → API Keys:** copy secret key → set ke `XENDIT_API_KEY`

---

## 5. OpenAI Setup

1. Buka https://platform.openai.com/api-keys
2. Buat API key baru
3. Isi saldo minimal $5 (cukup untuk ribuan foto)
4. Set ke `OPENAI_API_KEY`

---

## 6. SumoPod Setup

1. Buka https://ai.sumopod.com
2. Dapatkan API key
3. Set ke `SUMOPOD_API_KEY`

---

## 7. Journal Data (RAG)

AI Consult tidak akan berfungsi tanpa data jurnal dermatologi.

### Format file

Simpan file `.txt` di `data/journals/`, format: judul di baris pertama, konten di baris berikutnya.

Contoh `data/journals/contoh-jurnal.txt`:
```
Dietary Factors and Acne Vulgaris
High glycemic index diets and frequent dairy consumption are associated with increased acne prevalence. Studies show that low-glycemic-load diets can reduce acne lesion counts by 23-50% over 12 weeks.
```

### Menjalankan ingest

```bash
# Pastikan SUPABASE_SERVICE_ROLE_KEY sudah di .env.local
npm run ingest
```

Script akan:
- Baca semua file `.txt` di `data/journals/`
- Generate vector embeddings menggunakan Xenova Transformers (local)
- Insert ke `public.documents` table di Supabase

### Target jurnal

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

## 8. Deploy ke Cloudflare Pages

```bash
# Build untuk Cloudflare
npm run cf:build

# Deploy
npm run cf:deploy
```

Atau connect repo GitHub ke Cloudflare Pages, set build command `npx @opennextjs/cloudflare build` dan output directory `.open-next`.

---

## 9. Testing Checklist

| # | Flow | Langkah | Expected Result |
|---|------|---------|-----------------|
| 1 | Register | Buka `/register` → isi form → klik Daftar | Redirect ke `/onboarding` |
| 2 | Onboarding | Isi 5 step → klik Selesai | Buka `/settings`, cek skin type sudah sesuai pilihan |
| 3 | Tracker | Buka `/tracker` → isi tidur/air/stress/foto → Simpan | Tampil pesan "Data berhasil disimpan" |
| 4 | Dashboard | Buka `/dashboard` | Skin score muncul, insight dari data 7 hari, foto dari /api/photos |
| 5 | Progress | Buka `/progress` → pilih "7/30/90 hari" | Chart muncul dengan data tracker |
| 6 | AI Consult | Buka `/ai-consult` → tanya "Kenapa jerawat muncul?" | Dapat jawaban + sumber jurnal + disclaimer (max 3x untuk free) |
| 7 | AI Detect | Buka `/progress` → klik "Deteksi AI" di foto | Hasil deteksi: jenis jerawat, lokasi, severity, estimasi pemicu |
| 8 | Payment | Settings → Upgrade Premium/Pro → Buka Xendit | Invoice Xendit terbuka di tab baru |
| 9 | Theme Sync | Settings → ganti tema | Tema tersimpan ke localStorage + backend |
| 10 | Auth Guard | Buka Incognito → ketik `/dashboard` | Redirect ke `/login` |

---

## 10. Troubleshooting

| Masalah | Cek |
|---------|-----|
| Register gagal "{}" / 500 | Migration 0002 harus sudah jalan (INSERT policy + SECURITY DEFINER) |
| AI Consult error "SumoPod" | `SUMOPOD_API_KEY` belum di-set / invalid |
| AI Detect error "Gagal menganalisis foto" | `OPENAI_API_KEY` belum di-set / saldo habis |
| Dashboard skin score 0 terus | Belum ada data `daily_logs` — isi tracker dulu |
| Payment invoice gagal | `XENDIT_API_KEY` belum di-set / invalid |
| Middleware tidak redirect | Deploy ulang setelah middleware.ts di-commit |
| Timeline foto kosong | Belum ada foto di-upload — upload dari tracker dulu |
| AI jawaban generic, tidak spesifik | Jurnal belum di-ingest (step 7) / embeddings tidak match |
| Progress chart tidak muncul | Data tracker belum ada — isi tracker dulu |

---

*Update guide ini setiap ada perubahan setup atau infrastruktur.*
