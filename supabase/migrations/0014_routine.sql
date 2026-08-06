-- ============================================================
-- Narehat — Rutinitas AI: penyimpanan hasil & waktu pemakaian
-- time_of_day: am/pm/spot pada produk user
-- routine_reports: riwayat hasil Analyze & Build
-- ============================================================

ALTER TABLE public.skincare_products ADD COLUMN IF NOT EXISTS time_of_day TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS public.routine_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('analyze', 'build')),
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routine_reports_user ON public.routine_reports(user_id, created_at DESC);

ALTER TABLE public.routine_reports DISABLE ROW LEVEL SECURITY;
