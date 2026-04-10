-- Embark behavior reports tied to Embark IDs
-- Supports optional post-match feedback flow

CREATE TABLE IF NOT EXISTS embark_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  embark_id TEXT NOT NULL,
  rating NUMERIC(2,1),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill missing transaction_id and reported_id columns on existing installations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embark_reports'
      AND column_name = 'embark_id'
  ) THEN
    ALTER TABLE embark_reports
      ADD COLUMN embark_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embark_reports'
      AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE embark_reports
      ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embark_reports'
      AND column_name = 'reported_id'
  ) THEN
    ALTER TABLE embark_reports
      ADD COLUMN reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Enforce NOT NULL when possible (skipped if legacy rows need backfill)
  IF NOT EXISTS (
    SELECT 1 FROM embark_reports WHERE reported_id IS NULL
  ) THEN
    ALTER TABLE embark_reports ALTER COLUMN reported_id SET NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM embark_reports WHERE embark_id IS NULL
  ) THEN
    ALTER TABLE embark_reports ALTER COLUMN embark_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_embark_reports_reporter ON embark_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_embark_reports_reported ON embark_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_embark_reports_transaction ON embark_reports(transaction_id);
CREATE INDEX IF NOT EXISTS idx_embark_reports_embark_id ON embark_reports(embark_id);

-- Ensure one report per reporter per transaction
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'embark_reports_unique_reporter_transaction'
  ) THEN
    ALTER TABLE embark_reports
    ADD CONSTRAINT embark_reports_unique_reporter_transaction UNIQUE (transaction_id, reporter_id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE embark_reports ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'embark_reports' AND policyname = 'Users can view related embark reports'
  ) THEN
    CREATE POLICY "Users can view related embark reports" ON embark_reports
      FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'embark_reports' AND policyname = 'Users can submit embark reports'
  ) THEN
    CREATE POLICY "Users can submit embark reports" ON embark_reports
      FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'embark_reports' AND policyname = 'Users can edit their embark reports'
  ) THEN
    CREATE POLICY "Users can edit their embark reports" ON embark_reports
      FOR UPDATE USING (auth.uid() = reporter_id);
  END IF;
END $$;
