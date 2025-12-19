CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- The owner
  center_id UUID, -- For multi-center support if needed, currently same as user_id
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  teacher_id TEXT,
  teacher_name TEXT,
  day TEXT NOT NULL,
  schedule_time TEXT NOT NULL,
  max_capacity INTEGER DEFAULT 20,
  current_students INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own classes"
ON classes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
