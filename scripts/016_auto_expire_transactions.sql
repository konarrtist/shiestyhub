-- Function to check and auto-expire transactions
CREATE OR REPLACE FUNCTION auto_expire_old_transactions()
RETURNS void AS $$
DECLARE
  expired_tx RECORD;
BEGIN
  -- Find and expire transactions
  FOR expired_tx IN
    SELECT t.id, t.buyer_id, t.seller_id, l.title as listing_title
    FROM transactions t
    LEFT JOIN listings l ON l.id = t.listing_id
    WHERE t.status IN ('pending', 'in_progress')
      AND t.expires_at < NOW()
      AND t.expires_at IS NOT NULL
  LOOP
    -- Update transaction status
    UPDATE transactions
    SET status = 'cancelled',
        notes = COALESCE(notes, '') || ' [Auto-cancelled: 30-minute timeout expired]'
    WHERE id = expired_tx.id;

    -- Log the expiration
    INSERT INTO transaction_logs (transaction_id, user_id, action, details)
    VALUES (
      expired_tx.id,
      expired_tx.buyer_id,
      'Trade auto-expired',
      jsonb_build_object(
        'reason', '30-minute timeout',
        'expired_at', NOW()
      )
    );

    -- Note: Email notifications would need to be handled by your application
    -- This function only updates the database
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a way to manually trigger this (can be called by a cron job)
COMMENT ON FUNCTION auto_expire_old_transactions() IS 
'Auto-expires transactions that have exceeded the 30-minute limit. Should be run periodically via cron.';
