-- ============================================================
-- Narehat — Complete Schema (consolidated 0001-0010)
-- Cloudflare R2 untuk gambar, Cloudflare Pages deployment
-- ============================================================

-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== TABLES ====================

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  skin_type TEXT NOT NULL DEFAULT 'combination',
  acne_severity TEXT NOT NULL DEFAULT 'mild',
  goal TEXT NOT NULL DEFAULT 'clear_acne',
  plan TEXT NOT NULL DEFAULT 'free',
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily habit + skincare tracker
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Skin photos (disimpan di Cloudflare R2, kolom url menyimpan URL R2)
CREATE TABLE IF NOT EXISTS public.skin_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  ai_analysis JSONB,
  analysis_type TEXT CHECK (analysis_type IN ('detect', 'purging')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skincare products tracked by user
CREATE TABLE IF NOT EXISTS public.skincare_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Dermatology journal documents (for RAG vector search)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  embedding vector(384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Push notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI usage tracking (anti-quota bypass)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('consult', 'detect', 'purging', 'routine_analyze', 'routine_build')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments (SumoPod)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_skin_photos_user_date ON public.skin_photos(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_user_date ON public.insights(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON public.ai_usage(user_id, feature, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON public.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ==================== FUNCTIONS ====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile on signup (bypasses RLS as SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.raw_user_meta_data->>'name', 'User'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vector similarity search for RAG
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (id UUID, title TEXT, content TEXT, source TEXT, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.title, d.content, d.source,
         1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ==================== TRIGGERS ====================
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== RLS POLICIES ====================

-- users: read own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- users: update own profile (tapi TIDAK bisa ubah plan sendiri — hanya service_role / webhook)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND plan = (SELECT plan FROM public.users WHERE id = auth.uid()));

-- users: insert own profile (untuk trigger signup bypass RLS)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- daily_logs: user-owned
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own logs" ON public.daily_logs;
CREATE POLICY "Users can manage own logs" ON public.daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- skin_photos: user-owned
ALTER TABLE public.skin_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own photos" ON public.skin_photos;
CREATE POLICY "Users can manage own photos" ON public.skin_photos
  FOR ALL USING (auth.uid() = user_id);

-- skincare_products: user-owned
ALTER TABLE public.skincare_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own products" ON public.skincare_products;
CREATE POLICY "Users can manage own products" ON public.skincare_products
  FOR ALL USING (auth.uid() = user_id);

-- insights: user-owned, read-only
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
CREATE POLICY "Users can view own insights" ON public.insights
  FOR SELECT USING (auth.uid() = user_id);

-- recommendations: public read
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view recommendations" ON public.recommendations;
CREATE POLICY "Anyone can view recommendations" ON public.recommendations
  FOR SELECT USING (true);

-- documents: public read (RAG)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;
CREATE POLICY "Anyone can view documents" ON public.documents
  FOR SELECT USING (true);

-- notifications: user-owned
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- ai_usage: select own, insert by service
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage;
CREATE POLICY "Users can view own usage" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can insert usage" ON public.ai_usage;
CREATE POLICY "Service role can insert usage" ON public.ai_usage
  FOR INSERT WITH CHECK (true);

-- payments: select own, manage by service
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
CREATE POLICY "Service role can manage payments" ON public.payments
  FOR ALL USING (true);

-- ==================== SEED DATA ====================
INSERT INTO public.recommendations (name, brand, description, price, rating, reviews, affiliate_link, image_url, category)
VALUES
  ('Cetaphil Gentle Skin Cleanser', 'Cetaphil', 'Pembersih lembut untuk kulit sensitif dan berjerawat. Non-comedogenic.', 89000, 4.8, 2100, 'https://shopee.co.id/cetaphil-gentle-skin-cleanser', '', 'Cleanser'),
  ('The Ordinary Niacinamide 10% + Zinc 1%', 'The Ordinary', 'Mengurangi minyak berlebih dan memudarkan bekas jerawat.', 145000, 4.7, 5300, 'https://tokopedia.co.id/the-ordinary-niacinamide', '', 'Treatment'),
  ('Skin Aqua UV Moisture Milk', 'Skin Aqua', 'SPF 50 PA++++, ringan, tidak greasy, cocok untuk kulit berminyak.', 65000, 4.9, 8700, 'https://shopee.co.id/skin-aqua-uv-moisture-milk', '', 'Sunscreen'),
  ('Hada Labo Gokujyun Premium Lotion', 'Hada Labo', 'Pelembab dengan hyaluronic acid untuk hidrasi maksimal tanpa menyumbat pori.', 95000, 4.7, 3200, 'https://tokopedia.co.id/hada-labo-gokujyun', '', 'Moisturizer'),
  ('COSRX Low pH Good Morning Gel Cleanser', 'COSRX', 'Pembersih pagi dengan pH rendah yang menenangkan kulit sensitif.', 110000, 4.6, 4800, 'https://shopee.co.id/cosrx-low-ph-gel-cleanser', '', 'Cleanser'),
  ('Azelaic Acid Suspension 10%', 'The Ordinary', 'Mencerahkan bekas jerawat dan mengurangi kemerahan.', 135000, 4.5, 2900, 'https://tokopedia.co.id/the-ordinary-azelaic-acid', '', 'Treatment'),
  ('Biore UV Aqua Rich Watery Essence SPF 50', 'Biore', 'Sunscreen waterproof dengan finish ringan dan tidak putih.', 75000, 4.8, 12500, 'https://shopee.co.id/biore-uv-aqua-rich', '', 'Sunscreen'),
  ('Illiyoon Ceramide Ato Soothing Gel', 'Illiyoon', 'Gel pelembab dengan ceramide untuk memperbaiki skin barrier.', 119000, 4.7, 5100, 'https://tokopedia.co.id/illiyoon-ceramide-gel', '', 'Moisturizer')
ON CONFLICT DO NOTHING;

SELECT '✅ Complete schema OK' AS status;
