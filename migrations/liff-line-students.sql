-- LINE LIFF Integration: line_students mapping table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS line_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_user_id TEXT UNIQUE NOT NULL,
    student_code TEXT NOT NULL,
    display_name TEXT,
    picture_url TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_line_students_line_user_id ON line_students(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_students_student_code ON line_students(student_code);

-- Enable RLS
ALTER TABLE line_students ENABLE ROW LEVEL SECURITY;

-- Allow all operations (API uses service role key)
CREATE POLICY "Allow all for service role" ON line_students
    FOR ALL USING (true) WITH CHECK (true);
