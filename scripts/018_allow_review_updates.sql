-- Allow reviewers to edit their own trade reviews while enforcing participation and completion checks
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Users can update their own reviews'
  ) THEN
    DROP POLICY "Users can update their own reviews" ON reviews;
  END IF;

  CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (
      auth.uid() = reviewer_id
    )
    WITH CHECK (
      auth.uid() = reviewer_id AND
      EXISTS (
        SELECT 1 FROM transactions
        WHERE id = transaction_id
          AND (buyer_id = auth.uid() OR seller_id = auth.uid())
          AND status = 'completed'
      )
    );
END $$;
