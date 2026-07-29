-- ============================================================
-- Narehat — NextAuth Migration
-- Hapus dependensi ke auth.users, RLS, trigger
-- ============================================================

-- 1. Kolom baru untuk NextAuth credentials
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

-- 2. Hapus FK ke auth.users (sekarang UUID biasa tanpa referensi)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Hapus trigger auto-create user (dari auth.users)
DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Hapus RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can manage own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can manage own photos" ON public.skin_photos;
DROP POLICY IF EXISTS "Users can manage own products" ON public.skincare_products;
DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
DROP POLICY IF EXISTS "Anyone can view recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage;
DROP POLICY IF EXISTS "Service role can insert usage" ON public.ai_usage;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;

-- 5. Disable RLS semua tabel
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.skincare_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
