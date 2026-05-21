-- User-facing document title, separate from the raw storage filename
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT;
