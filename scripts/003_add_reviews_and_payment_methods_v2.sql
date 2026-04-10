-- Add payment methods to listings (no real money, payment method is part of the trade)
ALTER TABLE listings 
DROP COLUMN IF EXISTS price,
ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS item_icon_url TEXT,
ADD COLUMN IF NOT EXISTS item_category TEXT;

-- Create reviews table for reputation system
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, reviewer_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_transaction_id ON reviews(transaction_id);

-- Update profiles to track trade counts
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS successful_trades INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_trades INTEGER DEFAULT 0;

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating them
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews for their transactions" ON reviews;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their transactions"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM transactions
      WHERE id = transaction_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
      AND status = 'completed'
    )
  );

-- Remove price from transactions, add payment_info
ALTER TABLE transactions
DROP COLUMN IF EXISTS amount,
ADD COLUMN IF NOT EXISTS payment_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS review_left_by_buyer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_left_by_seller BOOLEAN DEFAULT false;

-- Create allowed items table from CSV
CREATE TABLE IF NOT EXISTS allowed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  rarity TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_allowed_items_rarity ON allowed_items(rarity);
CREATE INDEX IF NOT EXISTS idx_allowed_items_category ON allowed_items(category);

ALTER TABLE allowed_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating them
DROP POLICY IF EXISTS "Anyone can view allowed items" ON allowed_items;
DROP POLICY IF EXISTS "Only super_admin can manage allowed items" ON allowed_items;

CREATE POLICY "Anyone can view allowed items"
  ON allowed_items FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage allowed items"
  ON allowed_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );
