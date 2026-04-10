-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'trade_offer', 'trade_completed', 'message', 'dispute', 'review'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification on new transaction
CREATE OR REPLACE FUNCTION notify_on_transaction_create()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify seller
  PERFORM create_notification(
    NEW.seller_id,
    'trade_offer',
    'New Trade Offer',
    'You have received a new trade offer',
    '/dashboard/transactions/' || NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_notification_trigger
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_transaction_create();

-- Trigger to notify on transaction status change
CREATE OR REPLACE FUNCTION notify_on_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Notify buyer
    PERFORM create_notification(
      NEW.buyer_id,
      CASE 
        WHEN NEW.status = 'completed' THEN 'trade_completed'
        WHEN NEW.status = 'disputed' THEN 'dispute'
        ELSE 'trade_offer'
      END,
      'Trade Status Updated',
      'Your trade status changed to: ' || NEW.status,
      '/dashboard/transactions/' || NEW.id
    );
    
    -- Notify seller
    PERFORM create_notification(
      NEW.seller_id,
      CASE 
        WHEN NEW.status = 'completed' THEN 'trade_completed'
        WHEN NEW.status = 'disputed' THEN 'dispute'
        ELSE 'trade_offer'
      END,
      'Trade Status Updated',
      'Trade status changed to: ' || NEW.status,
      '/dashboard/transactions/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_update_notification_trigger
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_transaction_update();
