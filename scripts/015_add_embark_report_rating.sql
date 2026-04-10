-- Ensure embark_reports has a rating field for storing numeric feedback
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embark_reports'
      AND column_name = 'rating'
  ) THEN
    ALTER TABLE embark_reports
      ADD COLUMN rating NUMERIC(2,1);
  END IF;
END $$;
