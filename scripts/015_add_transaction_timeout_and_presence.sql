-- Add expires_at to transactions for 30-minute timeout
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Set default expires_at to 30 minutes from created_at for existing transactions
UPDATE transactions 
SET expires_at = created_at + INTERVAL '30 minutes'
WHERE expires_at IS NULL AND status IN ('pending', 'in_progress');

-- Add last_seen to profiles for online/offline status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen);
CREATE INDEX IF NOT EXISTS idx_transactions_expires_at ON transactions(expires_at);

-- Function to update last_seen automatically
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  NEW.is_online = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_seen on profile updates
DROP TRIGGER IF EXISTS trigger_update_last_seen ON profiles;
CREATE TRIGGER trigger_update_last_seen
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();

-- Function to auto-cancel expired transactions
CREATE OR REPLACE FUNCTION cancel_expired_transactions()
RETURNS void AS $$
BEGIN
  UPDATE transactions
  SET status = 'cancelled'::transaction_status,
      notes = COALESCE(notes, '') || ' [Auto-cancelled: 30-minute timeout expired]'
  WHERE status IN ('pending', 'in_progress')
    AND expires_at < NOW()
    AND expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
