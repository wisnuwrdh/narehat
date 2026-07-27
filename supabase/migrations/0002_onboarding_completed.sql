-- Add onboarding_completed column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

SELECT '✅ Added onboarding_completed column' AS status;