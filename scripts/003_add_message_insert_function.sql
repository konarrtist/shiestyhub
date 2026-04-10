-- Create function to insert messages, bypassing PostgREST schema cache issues
CREATE OR REPLACE FUNCTION insert_message(
  p_transaction_id UUID,
  p_sender_id UUID,
  p_receiver_id UUID,
  p_content TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO messages (
    transaction_id,
    sender_id,
    receiver_id,
    content,
    read
  ) VALUES (
    p_transaction_id,
    p_sender_id,
    p_receiver_id,
    p_content,
    false
  );
END;
$$;
