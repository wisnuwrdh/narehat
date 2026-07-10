-- ============================================================
-- Narehat — Full Schema (gabungan 0001–0007)
-- Fully idempotent — aman di-run berkali-kali
-- ============================================================

-- ==================== EXTENSIONS ====================
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==================== ENUMS ====================
DO $$ BEGIN
  CREATE TYPE skin_type AS ENUM ('oily', 'dry', 'combination', 'normal', 'sensitive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE acne_severity AS ENUM ('mild', 'moderate', 'severe');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE goal AS ENUM ('clear_acne', 'fade_scars', 'brighter_skin', 'all');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free', 'premium_monthly', 'premium_yearly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==================== TABLES ====================

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  skin_type skin_type NOT NULL DEFAULT 'combination',
  acne_severity acne_severity NOT NULL DEFAULT 'mild',
  goal goal NOT NULL DEFAULT 'clear_acne',
  plan plan_type NOT NULL DEFAULT 'free',
  theme TEXT DEFAULT 'default',
  notif_reminder BOOLEAN DEFAULT true,
  notif_insight BOOLEAN DEFAULT true,
  notif_promo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily habit + skincare logs
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(3,1) DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  stress_level INTEGER DEFAULT 5 CHECK (stress_level BETWEEN 1 AND 10),
  skincare_morning BOOLEAN DEFAULT false,
  skincare_evening BOOLEAN DEFAULT false,
  touched_face BOOLEAN DEFAULT false,
  junk_food BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Skin photos uploaded by user
CREATE TABLE IF NOT EXISTS public.skin_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ai_analysis JSONB,
  analysis_type TEXT CHECK (analysis_type IN ('detect', 'purging'))
);

-- Skincare products tracked by user
CREATE TABLE IF NOT EXISTS public.skincare_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  category TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-generated insights
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('correlation', 'trend', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product recommendations (curated)
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  affiliate_link TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dermatology journal documents for RAG
-- (with optional vector column — extension must be enabled via CREATE EXTENSION IF NOT EXISTS vector)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_extension WHERE extname = 'vector') THEN
    EXECUTE $doc$
      CREATE TABLE IF NOT EXISTS public.documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT '',
        embedding vector(384),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    $doc$;
  ELSE
    CREATE TABLE IF NOT EXISTS public.documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'insight', 'promo')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  related_link TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== FOREIGN KEYS ====================

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'daily_logs_user_id_fkey' AND table_schema = 'public') THEN
      ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'skin_photos_user_id_fkey' AND table_schema = 'public') THEN
      ALTER TABLE public.skin_photos ADD CONSTRAINT skin_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'skincare_products_user_id_fkey' AND table_schema = 'public') THEN
      ALTER TABLE public.skincare_products ADD CONSTRAINT skincare_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'insights_user_id_fkey' AND table_schema = 'public') THEN
      ALTER TABLE public.insights ADD CONSTRAINT insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'notifications_user_id_fkey' AND table_schema = 'public') THEN
      ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_skin_photos_user_date ON public.skin_photos(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_user_date ON public.insights(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_extension WHERE extname = 'vector') THEN
    CREATE INDEX IF NOT EXISTS idx_documents_embedding ON public.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END IF;
END $$;

-- ==================== TRIGGERS ====================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create user profile on signup (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== RLS POLICIES ====================

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM public.users WHERE id = auth.uid())
  );

-- Daily logs
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own logs" ON public.daily_logs;
CREATE POLICY "Users can manage own logs" ON public.daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- Skin photos
ALTER TABLE public.skin_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own photos" ON public.skin_photos;
CREATE POLICY "Users can manage own photos" ON public.skin_photos
  FOR ALL USING (auth.uid() = user_id);

-- Skincare products
ALTER TABLE public.skincare_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own products" ON public.skincare_products;
CREATE POLICY "Users can manage own products" ON public.skincare_products
  FOR ALL USING (auth.uid() = user_id);

-- Insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
CREATE POLICY "Users can view own insights" ON public.insights
  FOR SELECT USING (auth.uid() = user_id);

-- Recommendations
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view recommendations" ON public.recommendations;
CREATE POLICY "Anyone can view recommendations" ON public.recommendations
  FOR SELECT USING (true);

-- Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;
CREATE POLICY "Anyone can view documents" ON public.documents
  FOR SELECT USING (true);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ==================== STORAGE ====================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('skin_photos', 'skin_photos', true, 52428800)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'skin_photos');

DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'skin_photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'skin_photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==================== SEED DATA ====================

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

-- ==================== RAG MATCH FUNCTION ====================

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_extension WHERE extname = 'vector') THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.match_documents(
        query_embedding vector(384),
        match_threshold float DEFAULT 0.78,
        match_count int DEFAULT 5
      )
      RETURNS TABLE (
        id UUID,
        title TEXT,
        content TEXT,
        source TEXT,
        similarity float
      )
      LANGUAGE plpgsql
      AS $body$
      BEGIN
        RETURN QUERY
        SELECT
          d.id,
          d.title,
          d.content,
          d.source,
          1 - (d.embedding <=> query_embedding) AS similarity
        FROM public.documents d
        WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
        ORDER BY d.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $body$;
    $fn$;
  END IF;
END $$;

-- ==================== VALIDATION ====================
SELECT '✅ Schema lengkap — semua tabel, RLS, trigger, seed berhasil' AS status;
