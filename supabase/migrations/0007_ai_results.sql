-- ============================================================
-- Narehat — AI Analysis Storage
-- ============================================================

ALTER TABLE skin_photos
  ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

ALTER TABLE skin_photos
  ADD COLUMN IF NOT EXISTS analysis_type TEXT CHECK (analysis_type IN ('detect', 'purging'));
