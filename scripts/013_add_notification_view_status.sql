-- Add view status tracking for notifications
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS viewed boolean DEFAULT false;

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS viewed_at timestamptz;

-- Backfill existing rows so previously read notifications are treated as viewed
UPDATE notifications
SET viewed = COALESCE(viewed, read, false),
    viewed_at = CASE
      WHEN (viewed_at IS NULL) AND (read = true OR viewed = true) THEN COALESCE(created_at, NOW())
      ELSE viewed_at
    END;
