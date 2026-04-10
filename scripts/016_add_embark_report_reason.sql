-- Ensure embark_reports has a non-null reason column for classifying feedback
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embark_reports'
      AND column_name = 'reason'
  ) THEN
    ALTER TABLE embark_reports ADD COLUMN reason TEXT;
  END IF;

  UPDATE embark_reports
  SET reason = COALESCE(NULLIF(reason, ''), 'Behavior feedback')
  WHERE reason IS NULL OR reason = '';

  ALTER TABLE embark_reports ALTER COLUMN reason SET DEFAULT 'Behavior feedback';
  ALTER TABLE embark_reports ALTER COLUMN reason SET NOT NULL;
END $$;
