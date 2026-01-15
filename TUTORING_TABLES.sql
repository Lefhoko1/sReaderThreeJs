-- ============================================
-- TUTORING SYSTEM TABLES
-- SQL DDL for PostgreSQL
-- ============================================

-- 1. TutoringAcademy Table
CREATE TABLE IF NOT EXISTS tutoring_academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(1024),
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  website_url VARCHAR(1024),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tutoring_academies_owner_id ON tutoring_academies(owner_id);
CREATE INDEX idx_tutoring_academies_is_verified ON tutoring_academies(is_verified);
CREATE INDEX idx_tutoring_academies_name ON tutoring_academies(name);

-- 2. TutoringLevel Table
CREATE TABLE IF NOT EXISTS tutoring_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES tutoring_academies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(academy_id, code)
);

CREATE INDEX idx_tutoring_levels_academy_id ON tutoring_levels(academy_id);

-- 3. TutoringSubject Table
CREATE TABLE IF NOT EXISTS tutoring_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES tutoring_academies(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES tutoring_levels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  credit_hours INTEGER,
  cost_per_month NUMERIC(10, 2),
  cost_per_term NUMERIC(10, 2),
  cost_per_year NUMERIC(10, 2),
  capacity INTEGER,
  syllabus_url VARCHAR(1024),
  prerequisites TEXT,
  learning_outcomes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(academy_id, level_id, code)
);

CREATE INDEX idx_tutoring_subjects_academy_id ON tutoring_subjects(academy_id);
CREATE INDEX idx_tutoring_subjects_level_id ON tutoring_subjects(level_id);

-- 4. TutoringClass Table
CREATE TABLE IF NOT EXISTS tutoring_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES tutoring_academies(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES tutoring_levels(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES tutoring_subjects(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  capacity INTEGER,
  schedule JSONB DEFAULT '{}',
  location VARCHAR(255),
  platform VARCHAR(50),
  cost_per_month NUMERIC(10, 2),
  cost_per_term NUMERIC(10, 2),
  cost_per_year NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(academy_id, code)
);

CREATE INDEX idx_tutoring_classes_academy_id ON tutoring_classes(academy_id);
CREATE INDEX idx_tutoring_classes_level_id ON tutoring_classes(level_id);
CREATE INDEX idx_tutoring_classes_subject_id ON tutoring_classes(subject_id);
CREATE INDEX idx_tutoring_classes_instructor_id ON tutoring_classes(instructor_id);

-- 5. AcademyMembership Table
CREATE TABLE IF NOT EXISTS academy_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES tutoring_academies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'INSTRUCTOR',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(academy_id, user_id)
);

CREATE INDEX idx_academy_memberships_academy_id ON academy_memberships(academy_id);
CREATE INDEX idx_academy_memberships_user_id ON academy_memberships(user_id);

-- 6. StudentRegistrationRequest Table
CREATE TABLE IF NOT EXISTS student_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES tutoring_academies(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES tutoring_levels(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES tutoring_subjects(id) ON DELETE SET NULL,
  class_id UUID NOT NULL REFERENCES tutoring_classes(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'PENDING',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  payment_status VARCHAR(50) DEFAULT 'NOT_PAID',
  enrollment_start_date TIMESTAMP WITH TIME ZONE,
  enrollment_end_date TIMESTAMP WITH TIME ZONE,
  cost_term VARCHAR(50),
  cost_amount NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_registration_requests_student_id ON student_registration_requests(student_id);
CREATE INDEX idx_student_registration_requests_academy_id ON student_registration_requests(academy_id);
CREATE INDEX idx_student_registration_requests_class_id ON student_registration_requests(class_id);
CREATE INDEX idx_student_registration_requests_status ON student_registration_requests(status);
CREATE INDEX idx_student_registration_requests_payment_status ON student_registration_requests(payment_status);

-- 7. StudentClassEnrollment Table
CREATE TABLE IF NOT EXISTS student_class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES tutoring_academies(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES tutoring_classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  enrollment_end_date TIMESTAMP WITH TIME ZONE,
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  cost_paid NUMERIC(10, 2) NOT NULL,
  cost_term VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, class_id)
);

CREATE INDEX idx_student_class_enrollments_student_id ON student_class_enrollments(student_id);
CREATE INDEX idx_student_class_enrollments_academy_id ON student_class_enrollments(academy_id);
CREATE INDEX idx_student_class_enrollments_class_id ON student_class_enrollments(class_id);
CREATE INDEX idx_student_class_enrollments_payment_status ON student_class_enrollments(payment_status);
CREATE INDEX idx_student_class_enrollments_is_active ON student_class_enrollments(is_active);

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE tutoring_academies IS 'Tutoring academies/centers created by tutors';
COMMENT ON TABLE tutoring_levels IS 'Educational levels/grades within academies (e.g., Grade 1, High School)';
COMMENT ON TABLE tutoring_subjects IS 'Subjects/modules offered at each level with pricing tiers';
COMMENT ON TABLE tutoring_classes IS 'Class sections with schedule, platform, and instructor information';
COMMENT ON TABLE academy_memberships IS 'Staff/instructor membership in academies with role management';
COMMENT ON TABLE student_registration_requests IS 'Student registration requests with approval workflow and payment tracking';
COMMENT ON TABLE student_class_enrollments IS 'Active student enrollments in classes with payment management';

COMMENT ON COLUMN tutoring_subjects.cost_per_month IS 'Monthly tuition cost - flexible pricing tier';
COMMENT ON COLUMN tutoring_subjects.cost_per_term IS 'Term-based tuition cost - semester or term pricing';
COMMENT ON COLUMN tutoring_subjects.cost_per_year IS 'Annual tuition cost - yearly pricing';
COMMENT ON COLUMN tutoring_classes.schedule IS 'JSON: {days: [MON, WED, FRI], startTime: 10:00, endTime: 11:30, timezone: UTC, frequency: WEEKLY}';
COMMENT ON COLUMN student_registration_requests.status IS 'PENDING, APPROVED, REJECTED, or WITHDRAWN';
COMMENT ON COLUMN student_registration_requests.payment_status IS 'NOT_PAID, PENDING, or PAID';
COMMENT ON COLUMN student_class_enrollments.cost_term IS 'MONTHLY, TERMLY, or YEARLY - which pricing tier was used';
