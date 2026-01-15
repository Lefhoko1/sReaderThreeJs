-- ============================================
-- COMPLETE ASSIGNMENT TABLES RECREATION
-- Deletes all assignment-related tables and recreates them with proper structure
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop dependent tables first (in reverse dependency order)
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignment_images CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;

-- Step 2: Create assignments table with correct schema
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES tutoring_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_blocks JSONB DEFAULT '[]'::jsonb,
  content JSON,
  due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER,
  tools TEXT[] DEFAULT '{}',
  parent_encouragement TEXT,
  zombie_gifts JSONB
);

-- Step 3: Create assignment_images table
CREATE TABLE assignment_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  word_id VARCHAR(255) NOT NULL,
  image_url VARCHAR(1024) NOT NULL,
  image_source VARCHAR(50),
  alt_text VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create assignment_submissions table
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  submission_status VARCHAR(50) DEFAULT 'PENDING',
  score NUMERIC(5, 2),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'PENDING'
);

-- Step 6: Create indexes
CREATE INDEX idx_assignments_subject_id ON assignments(subject_id);
CREATE INDEX idx_assignments_created_at ON assignments(created_at);
CREATE INDEX idx_assignment_images_assignment_id ON assignment_images(assignment_id);
CREATE INDEX idx_assignment_images_word_id ON assignment_images(assignment_id, word_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions(submission_status);
CREATE INDEX idx_schedules_assignment_id ON schedules(assignment_id);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);

-- Verify the structure
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'assignment%' OR table_name = 'schedules';
