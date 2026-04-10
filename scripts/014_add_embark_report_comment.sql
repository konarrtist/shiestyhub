-- Ensure embark_reports has a comment field for storing report notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embark_reports'
      AND column_name = 'comment'
  ) THEN
    ALTER TABLE embark_reports
      ADD COLUMN comment TEXT;
  END IF;
END $$;
