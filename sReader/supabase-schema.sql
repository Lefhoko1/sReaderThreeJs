-- sReader Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTH
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  roles TEXT[] DEFAULT ARRAY['LEARNER']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  location_consent BOOLEAN DEFAULT FALSE,
  notification_prefs JSONB DEFAULT '{}'::JSONB
);

-- User locations
CREATE TABLE public.locations (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices for push notifications
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  push_token TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset codes
CREATE TABLE public.password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for password reset lookups
CREATE INDEX idx_password_resets_email ON public.password_resets(email);
CREATE INDEX idx_password_resets_code_hash ON public.password_resets(code_hash);

-- ============================================
-- ROLE-SPECIFIC USER DATA
-- ============================================

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  grade_level TEXT,
  school_name TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guardians table (parents/caregivers of students)
CREATE TABLE public.guardians (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  relationship_to_student TEXT, -- 'PARENT', 'GRANDPARENT', 'AUNT_UNCLE', 'SIBLING', 'OTHER'
  occupation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guardian-Student relationships
CREATE TABLE public.guardian_students (
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- 'PARENT', 'GUARDIAN', 'CAREGIVER'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (guardian_id, student_id)
);

-- Tutors table
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  specializations TEXT[], -- Array of subjects/specializations
  education_level TEXT, -- 'HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD'
  years_of_experience INTEGER,
  hourly_rate DECIMAL(8, 2),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor-Academy relationships
CREATE TABLE public.tutor_academies (
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'INSTRUCTOR', -- 'ADMIN', 'INSTRUCTOR', 'ASSISTANT'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (tutor_id, academy_id)
);

-- ============================================
-- INDEXES FOR ROLE TABLES
-- ============================================

CREATE INDEX idx_students_user_id ON public.students(id);
CREATE INDEX idx_guardians_user_id ON public.guardians(id);
CREATE INDEX idx_guardian_students_guardian ON public.guardian_students(guardian_id);
CREATE INDEX idx_guardian_students_student ON public.guardian_students(student_id);
CREATE INDEX idx_tutors_user_id ON public.tutors(id);
CREATE INDEX idx_tutors_verified ON public.tutors(is_verified);
CREATE INDEX idx_tutor_academies_tutor ON public.tutor_academies(tutor_id);
CREATE INDEX idx_tutor_academies_academy ON public.tutor_academies(academy_id);

-- ============================================
-- ORGANIZATIONS & CLASSES
-- ============================================

-- Organizations (Schools, Academies, etc.)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('SCHOOL', 'TUTORING', 'HOMESCHOOL')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class memberships
CREATE TABLE public.class_members (
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('TEACHER', 'LEARNER', 'GUARDIAN')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (class_id, user_id)
);

-- ============================================
-- ASSIGNMENTS & CONTENT
-- ============================================

-- Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_blocks JSONB DEFAULT '[]'::JSONB,
  due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment tools (attachments, resources)
CREATE TABLE public.assignment_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  uri TEXT,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Content assets (illustrations, audio, PDFs)
CREATE TABLE public.content_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('ILLUSTRATION', 'AUDIO', 'PDF')),
  uri TEXT NOT NULL,
  checksum TEXT,
  owner_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHEDULING & ATTEMPTS
-- ============================================

-- Schedules (assignment assigned to specific user)
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'))
);

-- Attempts (user attempts at assignments)
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5, 2),
  answers JSONB DEFAULT '[]'::JSONB
);

-- ============================================
-- SOCIAL & GAMIFICATION
-- ============================================

-- Friendships
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats (gamification)
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  total_assignments_completed INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB DEFAULT '{}'::JSONB
);

-- User achievements
CREATE TABLE public.user_achievements (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_class_members_user ON public.class_members(user_id);
CREATE INDEX idx_assignments_class ON public.assignments(class_id);
CREATE INDEX idx_schedules_user ON public.schedules(user_id);
CREATE INDEX idx_schedules_assignment ON public.schedules(assignment_id);
CREATE INDEX idx_attempts_user ON public.attempts(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_friendships_from_user ON public.friendships(from_user_id);
CREATE INDEX idx_friendships_to_user ON public.friendships(to_user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- RLS is disabled to allow full data access
-- Enable only when implementing specific authorization requirements

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON public.guardians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON public.tutors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
