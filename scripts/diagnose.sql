-- ============================================================
-- Narehat — Notification System (DIAGNOSIS + MIGRATION)
-- Jalankan di Supabase SQL Editor, laporkan hasilnya
-- ============================================================

-- STEP 1: Diagnosis — lihat tabel apa saja yang ada
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('public', 'auth')
  AND table_name IN ('users', 'daily_logs', 'skin_photos', 'recommendations', 'documents')
ORDER BY table_schema, table_name;

-- STEP 2: Lihat extension yang terinstall
SELECT extname FROM pg_extension;

-- STEP 3: Kalau users table ADA tapi dengan nama berbeda, coba ini
SELECT table_name FROM information_schema.tables
WHERE table_name ILIKE '%user%' AND table_schema = 'public';
