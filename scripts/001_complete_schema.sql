-- =====================================================
-- ARC RAIDERS MARKETPLACE - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Run this script on a fresh Supabase project
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('regular', 'escrow', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('active', 'sold', 'cancelled', 'reserved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'disputed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  discord_id TEXT,
  discord_username TEXT,
  discord_avatar TEXT,
  avatar_url TEXT,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'regular',
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_trades INTEGER DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  failed_trades INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allowed Items (tradeable items catalog)
CREATE TABLE IF NOT EXISTS allowed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rarity TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  blueprint_name TEXT NOT NULL,
  blueprint_rarity TEXT,
  item_category TEXT,
  item_icon_url TEXT,
  quantity INTEGER DEFAULT 1,
  payment_methods TEXT[] DEFAULT '{}',
  images TEXT[],
  status listing_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  escrow_id UUID REFERENCES profiles(id),
  status transaction_status NOT NULL DEFAULT 'pending',
  buyer_confirmation BOOLEAN DEFAULT FALSE,
  seller_confirmation BOOLEAN DEFAULT FALSE,
  payment_info JSONB DEFAULT '{}',
  notes TEXT,
  review_left_by_buyer BOOLEAN DEFAULT FALSE,
  review_left_by_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  evidence_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Dispute Messages
CREATE TABLE IF NOT EXISTS dispute_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (Direct messaging)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Logs (Audit trail)
CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Config (Legacy - roles now from env vars)
CREATE TABLE IF NOT EXISTS role_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_ids TEXT DEFAULT '',
  escrow_ids TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_transaction ON disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_allowed_items_category ON allowed_items(category);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings
CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Users can create their own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own listings" ON listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own listings" ON listings FOR DELETE USING (auth.uid() = seller_id);

-- Transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = escrow_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'escrow'))
);
CREATE POLICY "Buyers can create transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update transactions" ON transactions FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = escrow_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'escrow'))
);

-- Disputes
CREATE POLICY "Users can view disputes they're involved in" ON disputes FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())) OR
  auth.uid() = assigned_to OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'escrow'))
);
CREATE POLICY "Transaction participants can create disputes" ON disputes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid()))
);
CREATE POLICY "Escrow and admins can update disputes" ON disputes FOR UPDATE USING (
  auth.uid() = assigned_to OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'escrow'))
);

-- Dispute Messages
CREATE POLICY "Users can view dispute messages they're involved in" ON dispute_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM disputes d JOIN transactions t ON d.transaction_id = t.id
    WHERE d.id = dispute_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid() OR d.assigned_to = auth.uid())
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'escrow'))
);
CREATE POLICY "Involved users can send dispute messages" ON dispute_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM disputes d JOIN transactions t ON d.transaction_id = t.id
    WHERE d.id = dispute_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid() OR d.assigned_to = auth.uid())
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'escrow'))
);

-- Messages
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can mark their received messages as read" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their transactions" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (SELECT 1 FROM transactions WHERE id = transaction_id AND status = 'completed' AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);

-- Transaction Logs
CREATE POLICY "Users can view logs of their transactions" ON transaction_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid() OR t.escrow_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'escrow'))
);
CREATE POLICY "System can insert transaction logs" ON transaction_logs FOR INSERT WITH CHECK (true);

-- Allowed Items
CREATE POLICY "Anyone can view allowed items" ON allowed_items FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage allowed items" ON allowed_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Role Config
CREATE POLICY "Anyone can view role config" ON role_config FOR SELECT USING (true);
CREATE POLICY "Superadmins can update role config" ON role_config FOR UPDATE USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS disputes_updated_at ON disputes;
CREATE TRIGGER disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default role config row if not exists
INSERT INTO role_config (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM role_config);
