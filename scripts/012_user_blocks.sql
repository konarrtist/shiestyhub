-- User blocking and messaging safety
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure uniqueness for each pair
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_blocks_unique_pair'
  ) THEN
    ALTER TABLE user_blocks
      ADD CONSTRAINT user_blocks_unique_pair UNIQUE (blocker_id, blocked_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their block list' AND tablename = 'user_blocks'
  ) THEN
    CREATE POLICY "Users can manage their block list" ON user_blocks
      FOR ALL USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view who blocked them' AND tablename = 'user_blocks'
  ) THEN
    CREATE POLICY "Users can view who blocked them" ON user_blocks
      FOR SELECT USING (auth.uid() = blocked_id OR auth.uid() = blocker_id);
  END IF;
END $$;

-- Harden messaging so blocked users cannot chat
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can send messages' AND tablename = 'messages'
  ) THEN
    DROP POLICY "Users can send messages" ON messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can send unblocked messages' AND tablename = 'messages'
  ) THEN
    CREATE POLICY "Users can send unblocked messages" ON messages
      FOR INSERT
      WITH CHECK (
        auth.uid() = sender_id
        AND NOT EXISTS (
          SELECT 1 FROM user_blocks b
          WHERE (b.blocker_id = sender_id AND b.blocked_id = receiver_id)
             OR (b.blocker_id = receiver_id AND b.blocked_id = sender_id)
        )
      );
  END IF;
END $$;
