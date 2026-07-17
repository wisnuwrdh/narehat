-- ============================================================
-- Narehat — Seed Data (Rekomendasi Produk)
-- Jalankan di Supabase SQL Editor setelah migration 0002
-- ============================================================
-- Catatan: Bagian storage bucket skin_photos sudah dihapus karena
-- foto sekarang disimpan di Cloudflare R2, bukan Supabase Storage.
-- ============================================================

INSERT INTO public.recommendations (name, brand, description, price, rating, reviews, affiliate_link, image_url, category)
VALUES
  (
    'Cetaphil Gentle Skin Cleanser',
    'Cetaphil',
    'Pembersih lembut untuk kulit sensitif dan berjerawat. Non-comedogenic.',
    89000,
    4.8,
    2100,
    'https://shopee.co.id/cetaphil-gentle-skin-cleanser',
    '',
    'Cleanser'
  ),
  (
    'The Ordinary Niacinamide 10% + Zinc 1%',
    'The Ordinary',
    'Mengurangi minyak berlebih dan memudarkan bekas jerawat.',
    145000,
    4.7,
    5300,
    'https://tokopedia.co.id/the-ordinary-niacinamide',
    '',
    'Treatment'
  ),
  (
    'Skin Aqua UV Moisture Milk',
    'Skin Aqua',
    'SPF 50 PA++++, ringan, tidak greasy, cocok untuk kulit berminyak.',
    65000,
    4.9,
    8700,
    'https://shopee.co.id/skin-aqua-uv-moisture-milk',
    '',
    'Sunscreen'
  ),
  (
    'Hada Labo Gokujyun Premium Lotion',
    'Hada Labo',
    'Pelembab dengan hyaluronic acid untuk hidrasi maksimal tanpa menyumbat pori.',
    95000,
    4.7,
    3200,
    'https://tokopedia.co.id/hada-labo-gokujyun',
    '',
    'Moisturizer'
  ),
  (
    'COSRX Low pH Good Morning Gel Cleanser',
    'COSRX',
    'Pembersih pagi dengan pH rendah yang menenangkan kulit sensitif.',
    110000,
    4.6,
    4800,
    'https://shopee.co.id/cosrx-low-ph-gel-cleanser',
    '',
    'Cleanser'
  ),
  (
    'Azelaic Acid Suspension 10%',
    'The Ordinary',
    'Mencerahkan bekas jerawat dan mengurangi kemerahan.',
    135000,
    4.5,
    2900,
    'https://tokopedia.co.id/the-ordinary-azelaic-acid',
    '',
    'Treatment'
  ),
  (
    'Biore UV Aqua Rich Watery Essence SPF 50',
    'Biore',
    'Sunscreen waterproof dengan finish ringan dan tidak putih.',
    75000,
    4.8,
    12500,
    'https://shopee.co.id/biore-uv-aqua-rich',
    '',
    'Sunscreen'
  ),
  (
    'Illiyoon Ceramide Ato Soothing Gel',
    'Illiyoon',
    'Gel pelembab dengan ceramide untuk memperbaiki skin barrier.',
    119000,
    4.7,
    5100,
    'https://tokopedia.co.id/illiyoon-ceramide-gel',
    '',
    'Moisturizer'
  )
ON CONFLICT DO NOTHING;
