-- ============================================================
-- Fix: INSERT policy + SECURITY DEFINER for handle_new_user()
-- ============================================================
-- Issue: trigger handle_new_user() gagal INSERT ke public.users
-- karena tidak ada INSERT policy + RLS memblokir trigger.
-- ============================================================

-- Allow insert into public.users (untuk trigger signup)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure trigger runs as SECURITY DEFINER so it bypasses RLS
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
