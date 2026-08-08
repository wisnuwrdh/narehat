# Strategi Pricing — Narehat

**Produk:** Jurnal Jerawat Cerdas — platform korelasi daily habit × kondisi kulit dengan AI berbasis jurnal dermatologi peer-reviewed.

**Filosofi harga:** Narehat tidak menjual fitur AI. Narehat menjual **kepastian** — "berhenti menebak, mulai tahu" — untuk orang yang lelah dengan ketidakjelasan penyebab jerawat dan kebingungan memilih produk skincare.

---

## 1. Konteks & Tujuan

| Aspek | Kondisi |
|-------|---------|
| Model bisnis | Consumer self-serve (PWA, mobile-first), belum ada data pasar |
| Target pasar | Gen Z Indonesia 18-25 tahun, mid-range Android |
| Metode bayar | QRIS via SumoPod (sekali bayar, tanpa auto-renewal) — sudah tepat untuk Gen Z (63% pilih QRIS) |
| Tujuan saat ini | **Growth + revenue seimbang** — harga dipertahankan, struktur dibenahi, siap diukur |
| Tahap | Belum ada data konversi/churn → keputusan berbasis referensi & psikologi, bukan angka internal |

---

## 2. Landasan Psikologi (referensi)

### 2.1 Certainty Effect — Kahneman & Tversky (1979, *Prospect Theory*)
Orang membayar "premium kepastian": memilih Rp30.000 pasti daripada 80% peluang Rp40.000. Otak memperlakukan penghilangan ketidakpastian sebagai peristiwa psikologis berbeda — layak dibayar dengan uang sungguhan (dasar premi asuransi yang jauh melebihi nilai aktuaria).

**Implikasi Narehat:** "Tahu penyebab jerawatku" adalah bentuk kepastian. Semakin jelas janji kepastian, semakin besar willingness-to-pay. Halaman scan adalah momen penghilangan ketidakpastian — momen ini yang dijual.

### 2.2 Decision Fatigue
Kualitas keputusan menurun seiring jumlah pilihan; ketidakpastian menguras kognitif dan memicu kecemasan. Persona inti (cape memilih produk, bingung penyebab jerawat) mengalami ini.

**Implikasi Narehat:** Menjual *pelepasan beban*. Copy harus menonjolkan "tidak perlu mikir lagi", bukan menambah daftar fitur yang justru memperberat.

### 2.3 Sell Outcomes, Not Features + Objection Hierarchy (Growth Terminal)
User membeli hasil, bukan daftar fitur. Hirarki hambatan upgrade: **Trust → Value → Friction → Price**. Sebagian besar bisnis fokus pada harga; padahal trust dulu yang harus dituntaskan oleh free tier yang membuktikan nilai.

### 2.4 Benchmark Freemium → Paid, Kategori Health & Fitness (Adapty, 2026)
- Konversi health/fitness: median **4.2%**, P90 **12.1%** → target realistis
- Aplikasi AI = kategori tumbuh tercepat; formula monetisasi terbaik **"75% langganan + 25% berbasis pemakaian"**
- Trial apps health: **17–32 hari → 48.8% konversi**; **17% konversi karena trial hampir habis** (loss aversion)
- **"Buat konten premium terlihat lebih baik, bukan cuma lebih banyak"** → kualitas model AI sebagai pembeda yang terlihat
- ChatGPT/Midjourney/Claude: semua memakai **limit per tier** untuk fitur AI → limit finite generos = norma industri
- **Value reminder**: nilai langganan harus terus di-re-anchor, kalau tidak berubah menjadi sekadar tagihan

### 2.5 QRIS Gen Z Indonesia (KG Media 2025, GoodStats 2026)
63% Gen Z memilih QRIS; 38% menggunakannya harian. Metode pembayaran saat ini valid untuk pasar.

---

## 3. Posisi Produk: "Ekonomi Kepastian"

| Emosi user | Yang Narehat jual |
|------------|-------------------|
| Bingung penyebab jerawat | **Kejelasan**: tahu penyebab, tahu langkahnya |
| Cape memilih produk | **Kejelasan**: rekomendasi berbasis data, bukan opini influencer |
| Tidak bisa mengukur kemajuan | **Kepastian**: progress foto + analisis tren |
| Cemas kondisi memburuk | **Ketenangan**: AI memantau dan memberi sinyal lebih awal |

**Aturan framing (dari riset):**
1. Fitur → hasil. Bukan "30x scan/bulan" tapi "**selalu tahu kondisi kulitmu**".
2. Premium harus *terlihat* lebih baik (hasil lebih detail), bukan cuma lebih banyak.
3. Paywall muncul **setelah momen nilai pertama** (halaman hasil scan), bukan di awal.
4. Progress tracker + streak = loss aversion bawaan: "jangan kehilangan progress-mu".
5. Tanpa dark pattern — loyalitas dari nilai asli, sejalan dengan "JANJI PRIVASI".

---

## 4. Struktur Tier & Angka (Keputusan)

Semua limit **finite dan generos** (bukan "unlimited"): membatasi worst-case COGS, klaim jujur & aman secara hukum konsumen Indonesia, dan menciptakan leverage upgrade Premium → Pro.

| Fitur | Free | Premium (Rp29rb/bln · Rp199rb/thn) | Pro (Rp49rb/bln · Rp399rb/thn) |
|-------|------|-------------------------------------|--------------------------------|
| **AI Scan** (vision) | 2x/bln | **15x/bln** | **30x/bln** |
| **Model scan** | gpt-4o-mini (dasar) | **gpt-4o — detail per-lesi, confidence, tren** | gpt-4o + **akses model baru lebih awal** |
| **AI Consult** (teks) | 10x/bln | 100x/bln | 300x/bln |
| **Purging Checker** | 1x/bln | 10x/bln | 30x/bln |
| **Fitur non-AI pembeda** | Tracker, progress, rekomendasi | Insight & grafik korelasi | Routine builder, report mingguan + export PDF |

**Logika angka:**
- Premium 15 scan/bln ≈ 2-4x/minggu (menutupi ~90th percentile user aktif); Pro 30 scan/bln ≈ 1x/hari → cukup besar untuk tidak pernah terasa, tapi membatasi worst-case
- 2 scan gratis + 1 purging = **aha-moment terbuka** (kompetitor kasih scan gratis; paywall penuh = konversi mati)
- Pro +69% harga dibenarkan oleh *delegasi* (routine builder, report) + status akses model baru

### Konsistensi kuota (bug yang harus dibenahi)
- `app/api/ai/quota/route.ts`: purging report limit 0/terkunci, tapi `app/api/ai/purging/route.ts` izinkan 1x gratis → **seragamkan jadi 1x/bln**
- `detect`: quota report 0/terkunci → **ubah jadi 2x/bln**

---

## 5. Framing Copy per Tier

| Tier | Judul | Tagline | Alasan beli (hasil) |
|------|-------|---------|---------------------|
| **Free** | "Mulai dari sini" | "Coba, rasakan lega pertama" | Buktikan nilai (Trust) |
| **Premium** | "Kepastian penuh" | "Selalu tahu kondisi kulitmu" | Analisis lebih detail & mendalam di setiap scan |
| **Pro** | "Semua diurus" | "Narehat yang urus, kamu tinggal lihat hasilnya" | Routine otomatis + report mingguan + AI terbaru |

**Prinsip:**
- Jangan klaim "AI lebih akurat 95%" (sulit dibuktikan). Klaim **"lebih detail & mendalam"** — rincian per-lesi, severity per area, tren antar foto.
- Free wajib tetap bagus (model dasar, hasil tetap solid) — kalau free jelek, user lari, bukan upgrade.

---

## 6. Momen Paywall & Value Reminder

1. **Paywall pertama** → halaman hasil scan pertama (setelah 2 scan gratis habis): tampilkan perbandingan "detail Premium" yang bisa dilihat namun dikunci.
2. **Limit tercapai** → CTA upsell: "Limit scan bulananmu habis. Premium: 15x/bln + analisis lebih detail."
3. **Value reminder bulanan** → ringkasan progres bulanan (scan, trend, konsultasi) yang me-re-anchor nilai: "Bulan ini kulitmu membaik di pipi kiri."
4. **Report mingguan (Pro)** → re-anchor otomatis; juga jadi alasan ekspor/berbagi.
5. **Reminder QRIS** → email + banner in-app H-3 sebelum masa berlaku habis; cegah silent churn karena manual renew.

---

## 7. Benchmark Metrik (target pasca-rilis)

| Metrik | Target | Catatan |
|--------|--------|---------|
| Free → paid conversion | **4–8%** | median health/fitness 4.2%, P90 12.1% |
| Scan per user | Pantau | Validasi soft cap; naikkan kalau >80% user menyentuh cap |
| Consult per user | Pantau | Validasi angka 10/100/300 |
| Churn bulanan (manual renew) | Pantau | Efek reminder QRIS H-3 |
| ARPU | Pantau | Basis keputusan harga berikutnya |

**Eksperimen setelah data cukup:**
- A/B framing "unlimited" vs "hingga 100x/bulan"
- Van Westendorp untuk rentang harga Premium/Pro
- Trial 7 hari versi penuh Premium (tanpa kartu — QRIS bayar saat lanjut) sebagai alat uji konversi

---

## 8. Risiko & Iterasi

| Risiko | Mitigasi |
|--------|----------|
| Harga salah arah tanpa data | Jangan ubah harga dulu; ukur dulu (bagian 7) |
| "Unlimited" kalah punchy vs kompetitor | Copy hasil ("selalu tahu") lebih kuat dari angka; A/B nanti |
| QRIS manual renew → churn tinggi | Reminder H-3 + value reminder bulanan; evaluasi recurring payment bila memungkinkan |
| COGS vision naik (gpt-4o) | Soft cap harian + limit finite; monitor scan per user |
| Klaim kepastian berlebihan | Selalu sertakan disclaimer informatif; jangan diagnosis medis |

---

## 9. Keputusan yang Ditunda (butuh data)

1. Naikkan harga Premium/Pro bila konversi >8% dan churn <5% (tanda underpriced).
2. Pindah ke "unlimited" bila pemakaian nyata jauh di bawah cap.
3. Trial berbayar vs gratis — diuji setelah funnel stabil.
