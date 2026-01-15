-- ============================================
-- READING ASSIGNMENT SYSTEM TABLES
-- SQL DDL for PostgreSQL
-- ============================================

-- 1. Assignments Table (Main)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES tutoring_classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  -- Metadata
  tools TEXT[] DEFAULT '{}',
  duration_minutes INT,
  parent_encouragement TEXT,
  zombie_gifts JSONB,
  -- Dates
  due_date TIMESTAMP WITH TIME ZONE,
  submission_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_tutor_id ON assignments(tutor_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- 2. Assignment Images (For storing illustration images)
CREATE TABLE IF NOT EXISTS assignment_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  word_id VARCHAR(255) NOT NULL,
  image_url VARCHAR(1024) NOT NULL,
  image_source VARCHAR(50),
  alt_text VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignment_images_assignment_id ON assignment_images(assignment_id);
CREATE INDEX idx_assignment_images_word_id ON assignment_images(assignment_id, word_id);

-- 3. Student Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
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

CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions(submission_status);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE assignments IS 'Reading assignments with paragraph content, word actions, and metadata';
COMMENT ON COLUMN assignments.content IS 'JSON: {original_paragraph: string, sentences: [{sentence_id, sentence_text, words: [{word_id, word_text, action_type, action_data}]}]}';
COMMENT ON COLUMN assignments.tools IS 'Array of tools needed: ["protractor", "ruler", "compass", etc]';
COMMENT ON COLUMN assignments.duration_minutes IS 'Estimated time to complete assignment in minutes';
COMMENT ON COLUMN assignments.parent_encouragement IS 'Motivational message from parent/tutor';
COMMENT ON COLUMN assignments.zombie_gifts IS 'Rewards/gifts for failing level: {type, reward}';
COMMENT ON COLUMN assignment_images.image_source IS 'Source of image: google, phone_upload, library';
COMMENT ON TABLE assignment_submissions IS 'Student responses to assignments with answers and scoring';
COMMENT ON COLUMN assignment_submissions.answers IS 'JSON: {word_id: {action_type, student_answer, timestamp}}';
