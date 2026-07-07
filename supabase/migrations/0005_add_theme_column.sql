-- Add theme column to users table for cross-device sync
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default';
