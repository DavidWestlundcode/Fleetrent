-- Add facilities JSONB column to customers
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS facilities JSONB NOT NULL DEFAULT '[]';
