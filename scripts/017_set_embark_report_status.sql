-- Ensure embark_reports records have a visible status defaulting to resolved
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embark_reports'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE embark_reports ADD COLUMN status TEXT;
  END IF;

  UPDATE embark_reports
  SET status = 'resolved'
  WHERE status IS NULL OR status = '' OR status = 'pending';

  ALTER TABLE embark_reports ALTER COLUMN status SET DEFAULT 'resolved';
  ALTER TABLE embark_reports ALTER COLUMN status SET NOT NULL;
END $$;
