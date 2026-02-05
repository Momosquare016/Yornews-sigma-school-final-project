-- Add profile_image_url column to users table
-- Run this in your Neon database console

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
