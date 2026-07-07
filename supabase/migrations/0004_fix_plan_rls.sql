-- ============================================================
-- Fix: RLS policy — prevent users from changing own plan
-- ============================================================
-- TH-01: Users could update their own plan field via RLS bypass.
-- This migration adds a WITH CHECK clause that prevents plan mutation.
-- ============================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM public.users WHERE id = auth.uid())
  );
