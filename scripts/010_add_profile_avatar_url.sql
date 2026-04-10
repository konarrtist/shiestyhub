-- Ensure profiles have a persisted avatar_url column for uploaded profile pictures
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Refresh PostgREST cache so the new column is available immediately
NOTIFY pgrst, 'reload schema';
