-- Add news cache columns to users table
-- Run this in your Neon database console

ALTER TABLE users
ADD COLUMN IF NOT EXISTS news_cache TEXT,
ADD COLUMN IF NOT EXISTS cache_updated_at TIMESTAMP;
