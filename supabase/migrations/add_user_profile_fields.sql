-- Add profile fields to User table
-- Run this in Supabase SQL Editor

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "birthday" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT,
ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT;

