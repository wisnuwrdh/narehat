-- ============================================================
-- Narehat — Notification System (v2 — resilient)
-- ============================================================

-- 1. Drop any stale leftovers
DROP TABLE IF EXISTS notifications CASCADE;

-- 2. Create table (FK added after we confirm users exists)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'insight', 'promo')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  related_link TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add FK only if users table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Index
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC);

-- 5. RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- 6. Add notif columns to users (only if table exists)  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notif_reminder' AND table_schema = 'public') THEN
      ALTER TABLE users ADD COLUMN notif_reminder BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notif_insight' AND table_schema = 'public') THEN
      ALTER TABLE users ADD COLUMN notif_insight BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notif_promo' AND table_schema = 'public') THEN
      ALTER TABLE users ADD COLUMN notif_promo BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;

-- 7. Show results
SELECT 'notifications table OK' AS status;
