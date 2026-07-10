-- ============================================================
-- Narehat — AI Analysis Storage (self-contained)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.skin_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ai_analysis JSONB,
  analysis_type TEXT CHECK (analysis_type IN ('detect', 'purging'))
);

ALTER TABLE public.skin_photos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'skin_photos' AND policyname = 'Users can manage own photos') THEN
    CREATE POLICY "Users can manage own photos" ON public.skin_photos
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_skin_photos_user_date ON public.skin_photos(user_id, date DESC);

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'skin_photos' AND table_schema = 'public') THEN
    BEGIN
      ALTER TABLE public.skin_photos ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.skin_photos ADD COLUMN IF NOT EXISTS analysis_type TEXT CHECK (analysis_type IN ('detect', 'purging'));
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
  END IF;
END $$;
