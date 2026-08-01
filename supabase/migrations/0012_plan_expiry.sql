-- ============================================================
-- Narehat — Plan expiry
-- QRIS = pembayaran sekali bayar (tanpa auto-renewal).
-- plan_expires_at menandai kapan langganan berakhir.
-- ============================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Backfill: user berbayar yang sudah ada diberi masa aktif 30 hari dari sekarang
-- agar tidak berlaku selamanya setelah fitur ini aktif.
UPDATE public.users
SET plan_expires_at = now() + interval '30 days'
WHERE plan <> 'free' AND plan_expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_plan_expires ON public.users(plan, plan_expires_at);
