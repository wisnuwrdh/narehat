-- ============================================================
-- Narehat — Kuota per periode langganan
-- plan_started_at = awal periode kuota berbayar saat ini.
-- Reset kuota terjadi saat pembayaran/perpanjangan (webhook),
-- bukan per bulan kalender. Free tier tetap per bulan kalender.
-- ============================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;

-- Backfill user berbayar aktif: perkirakan awal periode = habis - durasi.
UPDATE public.users
SET plan_started_at = plan_expires_at - CASE
  WHEN plan LIKE '%yearly%' THEN interval '365 days'
  ELSE interval '30 days'
END
WHERE plan <> 'free' AND plan_started_at IS NULL AND plan_expires_at IS NOT NULL;
