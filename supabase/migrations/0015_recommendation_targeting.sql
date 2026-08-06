-- 0015: Rekomendasi produk personal (rule-based tagging)
-- Kolom baru: skin_types & concerns (array kosong = cocok untuk semua / universal)

ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS skin_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS concerns TEXT[] DEFAULT '{}';

-- Backfill tagging untuk 8 produk katalog yang sudah ada
UPDATE public.recommendations SET
  skin_types = ARRAY['dry','sensitive','combination'],
  concerns  = ARRAY['clear_acne']
WHERE name = 'Cetaphil Gentle Skin Cleanser';

UPDATE public.recommendations SET
  skin_types = ARRAY['oily','combination'],
  concerns  = ARRAY['clear_acne']
WHERE name = 'COSRX Low pH Good Morning Gel Cleanser';

UPDATE public.recommendations SET
  skin_types = ARRAY['oily','combination'],
  concerns  = ARRAY['clear_acne','fade_scars']
WHERE name = 'The Ordinary Niacinamide 10% + Zinc 1%';

UPDATE public.recommendations SET
  skin_types = ARRAY['combination','sensitive'],
  concerns  = ARRAY['clear_acne','fade_scars']
WHERE name = 'Azelaic Acid Suspension 10%';

UPDATE public.recommendations SET
  skin_types = ARRAY['dry','combination'],
  concerns  = ARRAY['brighter_skin']
WHERE name = 'Hada Labo Gokujyun Premium Lotion';

UPDATE public.recommendations SET
  skin_types = ARRAY['dry','sensitive'],
  concerns  = ARRAY['brighter_skin']
WHERE name = 'Illiyoon Ceramide Ato Soothing Gel';

UPDATE public.recommendations SET
  skin_types = ARRAY['sensitive','dry'],
  concerns  = ARRAY['brighter_skin']
WHERE name = 'Skin Aqua UV Moisture Milk';

UPDATE public.recommendations SET
  skin_types = ARRAY['oily','combination'],
  concerns  = ARRAY['brighter_skin']
WHERE name = 'Biore UV Aqua Rich Watery Essence SPF 50';
