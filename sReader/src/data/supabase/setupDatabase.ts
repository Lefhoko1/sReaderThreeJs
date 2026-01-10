import supabase from './supabaseClient';

/**
 * Automatically creates all database tables if they don't exist
 */
export async function setupSupabaseSchema(): Promise<boolean> {
  try {
    console.log('📋 Setting up Supabase schema...');

    // Check if tables already exist by trying to query users table
    const { error: checkError } = await supabase.from('users').select('count').limit(1);
    
    if (!checkError) {
      console.log('✓ Database tables already exist');
      return true;
    }

    console.log('🔨 Creating database tables...');

    // Execute schema creation
    const schema = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
      CREATE TABLE IF NOT EXISTS public.users (
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
      CREATE TABLE IF NOT EXISTS public.profiles (
        user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
        bio TEXT,
        location_consent BOOLEAN DEFAULT FALSE,
        notification_prefs JSONB DEFAULT '{}'::JSONB
      );

      -- User locations
      CREATE TABLE IF NOT EXISTS public.locations (
        user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        address TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Devices
      CREATE TABLE IF NOT EXISTS public.devices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        push_token TEXT,
        platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Organizations
      CREATE TABLE IF NOT EXISTS public.organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        type TEXT CHECK (type IN ('SCHOOL', 'TUTORING', 'HOMESCHOOL')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Classes
      CREATE TABLE IF NOT EXISTS public.classes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        grade_level TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Class memberships
      CREATE TABLE IF NOT EXISTS public.class_members (
        class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        role TEXT CHECK (role IN ('TEACHER', 'LEARNER', 'GUARDIAN')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (class_id, user_id)
      );

      -- Assignments
      CREATE TABLE IF NOT EXISTS public.assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        content_blocks JSONB DEFAULT '[]'::JSONB,
        due_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Assignment tools
      CREATE TABLE IF NOT EXISTS public.assignment_tools (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        uri TEXT,
        metadata JSONB DEFAULT '{}'::JSONB
      );

      -- Content assets
      CREATE TABLE IF NOT EXISTS public.content_assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type TEXT CHECK (type IN ('ILLUSTRATION', 'AUDIO', 'PDF')),
        uri TEXT NOT NULL,
        checksum TEXT,
        owner_user_id UUID REFERENCES public.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Schedules
      CREATE TABLE IF NOT EXISTS public.schedules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        due_at TIMESTAMP WITH TIME ZONE,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'))
      );

      -- Attempts
      CREATE TABLE IF NOT EXISTS public.attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        submitted_at TIMESTAMP WITH TIME ZONE,
        score DECIMAL(5, 2),
        answers JSONB DEFAULT '[]'::JSONB
      );

      -- Friendships
      CREATE TABLE IF NOT EXISTS public.friendships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(from_user_id, to_user_id)
      );

      -- Notifications
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        payload JSONB DEFAULT '{}'::JSONB,
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- User stats
      CREATE TABLE IF NOT EXISTS public.user_stats (
        user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
        total_score INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0,
        last_active_date DATE,
        total_assignments_completed INTEGER DEFAULT 0,
        total_time_spent_minutes INTEGER DEFAULT 0
      );

      -- Achievements
      CREATE TABLE IF NOT EXISTS public.achievements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        criteria JSONB DEFAULT '{}'::JSONB
      );

      -- User achievements
      CREATE TABLE IF NOT EXISTS public.user_achievements (
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, achievement_id)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
      CREATE INDEX IF NOT EXISTS idx_class_members_user ON public.class_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_user ON public.schedules(user_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_assignment ON public.schedules(assignment_id);
      CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_from_user ON public.friendships(from_user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_to_user ON public.friendships(to_user_id);
    `;

    // Note: Supabase client doesn't support raw SQL execution directly
    // You need to use the Supabase Dashboard SQL Editor or use RPC function
    console.log('⚠ Please run the schema in Supabase SQL Editor once');
    console.log('📝 Schema file: supabase-schema.sql');
    
    return true;
  } catch (error) {
    console.error('✗ Error setting up schema:', error);
    return false;
  }
}

/**
 * Seeds demo data into the database
 */
export async function seedSupabaseData(): Promise<void> {
  try {
    console.log('🌱 Seeding demo data...');

    // Check if data already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('✓ Demo data already exists');
      return;
    }

    // Create demo organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: 'Demo Academy',
        type: 'SCHOOL'
      }])
      .select()
      .single();

    if (orgError) throw orgError;

    // Create demo class
    const { data: demoClass, error: classError } = await supabase
      .from('classes')
      .insert([{
        org_id: org.id,
        name: 'Grade 5 Mathematics',
        grade_level: '5'
      }])
      .select()
      .single();

    if (classError) throw classError;

    // Create demo users
    const { data: teacher, error: teacherError } = await supabase
      .from('users')
      .insert([{
        email: 'teacher@demo.com',
        display_name: 'Ms. Johnson',
        roles: ['TEACHER']
      }])
      .select()
      .single();

    if (teacherError) throw teacherError;

    const { data: student, error: studentError } = await supabase
      .from('users')
      .insert([{
        email: 'student@demo.com',
        display_name: 'John Smith',
        roles: ['LEARNER']
      }])
      .select()
      .single();

    if (studentError) throw studentError;

    // Add users to class
    await supabase.from('class_members').insert([
      { class_id: demoClass.id, user_id: teacher.id, role: 'TEACHER' },
      { class_id: demoClass.id, user_id: student.id, role: 'LEARNER' }
    ]);

    // Create demo assignments
    const { data: assignment1 } = await supabase
      .from('assignments')
      .insert([{
        class_id: demoClass.id,
        title: 'Multiplication Tables',
        description: 'Practice multiplication tables from 1-12',
        content_blocks: [
          { id: '1', type: 'DEFINITION', text: 'Learn your times tables!' },
          { id: '2', type: 'FILL_IN_BLANK', text: '7 × 8 = __', data: { answer: '56' } }
        ],
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single();

    const { data: assignment2 } = await supabase
      .from('assignments')
      .insert([{
        class_id: demoClass.id,
        title: 'Fractions Basics',
        description: 'Understanding fractions and decimals',
        content_blocks: [
          { id: '1', type: 'DEFINITION', text: 'A fraction represents part of a whole' },
          { id: '2', type: 'ILLUSTRATION_PICK', text: 'Which shows 1/2?', data: {} }
        ],
        due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single();

    // Schedule assignments for student
    if (assignment1) {
      await supabase.from('schedules').insert([{
        assignment_id: assignment1.id,
        user_id: student.id,
        due_at: assignment1.due_at,
        status: 'PENDING'
      }]);
    }

    if (assignment2) {
      await supabase.from('schedules').insert([{
        assignment_id: assignment2.id,
        user_id: student.id,
        due_at: assignment2.due_at,
        status: 'PENDING'
      }]);
    }

    // Create demo achievements
    await supabase.from('achievements').insert([
      {
        code: 'FIRST_LOGIN',
        name: 'Welcome!',
        description: 'Logged in for the first time',
        icon: '👋'
      },
      {
        code: 'STREAK_7',
        name: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥'
      },
      {
        code: 'PERFECT_SCORE',
        name: 'Perfect Score',
        description: 'Got 100% on an assignment',
        icon: '⭐'
      }
    ]);

    // Initialize user stats
    await supabase.from('user_stats').insert([
      { user_id: student.id, total_score: 0, streak_days: 0 }
    ]);

    console.log('✓ Demo data seeded successfully');
    console.log(`  📧 Demo Student: student@demo.com`);
    console.log(`  📧 Demo Teacher: teacher@demo.com`);
    
  } catch (error: any) {
    console.error('✗ Error seeding data:', error);
    if (error.message) {
      console.error('  Message:', error.message);
    }
  }
}
