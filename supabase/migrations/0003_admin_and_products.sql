-- Add admin role & product catalog enhancements

-- 1. Add role column to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Add missing columns to recommendations
ALTER TABLE public.recommendations
ADD COLUMN IF NOT EXISTS ingredients TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS why TEXT DEFAULT '';

SELECT '✅ 0003_admin_and_products OK' AS status;