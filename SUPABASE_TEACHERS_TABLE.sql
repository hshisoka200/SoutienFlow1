-- SQL to create a dedicated teachers table in Supabase
-- Run this in your Supabase SQL Editor if you want to migrate from metadata storage

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subjects TEXT[] DEFAULT '{}',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by center
CREATE INDEX IF NOT EXISTS idx_teachers_center_id ON teachers(center_id);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own teachers
CREATE POLICY "Users can view own teachers"
  ON teachers FOR SELECT
  USING (auth.uid() = center_id);

-- Policy: Users can insert their own teachers
CREATE POLICY "Users can insert own teachers"
  ON teachers FOR INSERT
  WITH CHECK (auth.uid() = center_id);

-- Policy: Users can update their own teachers
CREATE POLICY "Users can update own teachers"
  ON teachers FOR UPDATE
  USING (auth.uid() = center_id);

-- Policy: Users can delete their own teachers
CREATE POLICY "Users can delete own teachers"
  ON teachers FOR DELETE
  USING (auth.uid() = center_id);

-- Optional: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
