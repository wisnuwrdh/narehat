-- 0017: Pisah link beli per platform (Shopee & Tokopedia)
-- Kolom affiliate_link lama dipertahankan sebagai fallback.

ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS shopee_link TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tokopedia_link TEXT DEFAULT '';

-- Salin link lama ke kedua kolom sebagai fallback awal
UPDATE public.recommendations
  SET shopee_link = COALESCE(NULLIF(affiliate_link, ''), shopee_link),
      tokopedia_link = COALESCE(NULLIF(affiliate_link, ''), tokopedia_link)
  WHERE affiliate_link IS NOT NULL AND affiliate_link <> '';