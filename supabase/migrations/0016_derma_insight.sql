-- 0016: Insight dermatologi untuk rekomendasi produk
-- derma_insight: ringkasan singkat (precompute dari jurnal dermatologi)
-- derma_sources: judul jurnal + sumber (PMID/DOI) yang dirujuk

ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS derma_insight TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS derma_sources TEXT[] DEFAULT '{}';
