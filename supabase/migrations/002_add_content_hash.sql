-- Add content_hash for duplicate match prevention
ALTER TABLE pro_matches ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Create unique index on content_hash (allows null for old rows)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pro_matches_content_hash
  ON pro_matches(content_hash) WHERE content_hash IS NOT NULL;
