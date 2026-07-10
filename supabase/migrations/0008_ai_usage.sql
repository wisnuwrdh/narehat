-- ============================================================
-- Narehat — Append-only AI Usage Tracking
-- Prevents free-tier quota bypass via localStorage / record deletion
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('consult', 'detect', 'purging', 'routine_analyze', 'routine_build')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'ai_usage_user_id_fkey' AND table_schema = 'public') THEN
      ALTER TABLE public.ai_usage ADD CONSTRAINT ai_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON public.ai_usage(user_id, feature, created_at DESC);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage;
CREATE POLICY "Users can view own usage" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert usage" ON public.ai_usage;
CREATE POLICY "Service role can insert usage" ON public.ai_usage
  FOR INSERT WITH CHECK (true);

SELECT '✅ ai_usage table OK' AS status;
