-- ============================================================
-- Narehat — Cleanup (hapus semua data & struktur)
-- Jalankan ini dulu sebelum 0001_complete_schema.sql
-- ============================================================

-- Drop semua triggers yang terikat ke auth.users (jalankan dulu sebelum drop function)
DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;

-- Drop semua tabel (urutan aman: child dulu, parent terakhir)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.ai_usage CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.skincare_products CASCADE;
DROP TABLE IF EXISTS public.skin_photos CASCADE;
DROP TABLE IF EXISTS public.daily_logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.match_documents CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at CASCADE;

-- Drop types / enums
DROP TYPE IF EXISTS public.plan_type CASCADE;
DROP TYPE IF EXISTS public.goal CASCADE;
DROP TYPE IF EXISTS public.acne_severity CASCADE;
DROP TYPE IF EXISTS public.skin_type CASCADE;

SELECT '✅ Cleanup complete' AS status;
