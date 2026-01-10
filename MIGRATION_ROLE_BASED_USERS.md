# Migration Guide: Adding Role-Based User System

This guide helps you migrate your existing user data to the new role-based system.

---

## Pre-Migration Checklist

- [ ] Backup your database
- [ ] Have development environment ready
- [ ] Review this guide completely
- [ ] Test in dev/staging first
- [ ] Have rollback plan ready

---

## Step 1: Run Database Schema Changes

### Option A: Direct SQL (Recommended for Supabase)

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the role-specific tables and indexes from `supabase-schema.sql`
4. Execute the SQL:

```sql
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
  relationship_to_student TEXT,
  occupation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guardian-Student relationships
CREATE TABLE public.guardian_students (
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (guardian_id, student_id)
);

-- Tutors table
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  specializations TEXT[],
  education_level TEXT,
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
  role TEXT DEFAULT 'INSTRUCTOR',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (tutor_id, academy_id)
);

-- Create indexes
CREATE INDEX idx_students_user_id ON public.students(id);
CREATE INDEX idx_guardians_user_id ON public.guardians(id);
CREATE INDEX idx_guardian_students_guardian ON public.guardian_students(guardian_id);
CREATE INDEX idx_guardian_students_student ON public.guardian_students(student_id);
CREATE INDEX idx_tutors_user_id ON public.tutors(id);
CREATE INDEX idx_tutors_verified ON public.tutors(is_verified);
CREATE INDEX idx_tutor_academies_tutor ON public.tutor_academies(tutor_id);
CREATE INDEX idx_tutor_academies_academy ON public.tutor_academies(academy_id);
```

### Option B: Using Prisma Migrations

```bash
cd sReader
npx prisma migrate dev --name add-role-based-tables
```

---

## Step 2: Migrate Existing Users

### Scenario A: All existing users are Students

If all your current users should be migrated as students, run:

```sql
-- Create student records for all existing users
INSERT INTO public.students (id, created_at, updated_at)
SELECT id, created_at, updated_at 
FROM public.users 
WHERE id NOT IN (SELECT id FROM public.students)
ON CONFLICT DO NOTHING;

-- Update roles to include STUDENT if not already present
UPDATE public.users 
SET roles = array_append(roles, 'STUDENT') 
WHERE NOT (roles @> ARRAY['STUDENT']::text[])
  AND NOT (roles @> ARRAY['GUARDIAN']::text[])
  AND NOT (roles @> ARRAY['TUTOR']::text[]);
```

### Scenario B: Different user types already tracked

If you have a column tracking user type (e.g., `user_type`), map existing data:

```sql
-- Migrate teachers to tutors
INSERT INTO public.tutors (id, created_at, updated_at)
SELECT id, created_at, updated_at 
FROM public.users 
WHERE role_type = 'teacher'
ON CONFLICT DO NOTHING;

-- Migrate students
INSERT INTO public.students (id, created_at, updated_at)
SELECT id, created_at, updated_at 
FROM public.users 
WHERE role_type = 'student'
ON CONFLICT DO NOTHING;

-- Update roles array
UPDATE public.users 
SET roles = array['TUTOR']::text[]
WHERE role_type = 'teacher';

UPDATE public.users 
SET roles = array['STUDENT']::text[]
WHERE role_type = 'student';
```

### Scenario C: Manual classification

If you need to manually assign roles, use the Supabase UI or:

```sql
-- Assign specific users to tutor role
UPDATE public.users 
SET roles = array['TUTOR']::text[]
WHERE id IN (
  'user-id-1', 'user-id-2', 'user-id-3'
);

-- Insert corresponding tutor records
INSERT INTO public.tutors (id, created_at, updated_at)
VALUES 
  ('user-id-1', NOW(), NOW()),
  ('user-id-2', NOW(), NOW()),
  ('user-id-3', NOW(), NOW())
ON CONFLICT DO NOTHING;
```

---

## Step 3: Update RLS Policies

Run the RLS policy creation SQL from `supabase-schema.sql`:

```sql
-- Students can view their own student record
CREATE POLICY "Students can view own data" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own data" ON public.students
  FOR UPDATE USING (auth.uid() = id);

-- Guardians can view their own guardian record
CREATE POLICY "Guardians can view own data" ON public.guardians
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Guardians can update own data" ON public.guardians
  FOR UPDATE USING (auth.uid() = id);

-- Guardians can view students they manage
CREATE POLICY "Guardians can view their students" ON public.guardian_students
  FOR SELECT USING (auth.uid() = guardian_id);

-- Tutors can view their own tutor record
CREATE POLICY "Tutors can view own data" ON public.tutors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Tutors can update own data" ON public.tutors
  FOR UPDATE USING (auth.uid() = id);

-- Tutors can view academies they belong to
CREATE POLICY "Tutors can view their academies" ON public.tutor_academies
  FOR SELECT USING (auth.uid() = tutor_id);
```

---

## Step 4: Update Code

1. Update [AuthViewModel.ts](src/application/viewmodels/AuthViewModel.ts)
   - Replace with new implementation from this codebase

2. Update [SignupScreen.tsx](src/presentation/screens/SignupScreen.tsx)
   - Replace with new implementation with role selection

3. Regenerate Prisma Client:
   ```bash
   cd sReader
   npx prisma generate
   ```

---

## Step 5: Test Migration

### Test 1: Create new user with role
```typescript
const result = await authVM.signup({
  displayName: 'Test User',
  email: 'test@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  role: Role.STUDENT,
});

// Verify user created with correct role
```

### Test 2: Query migrated users
```sql
-- Check student count
SELECT COUNT(*) FROM public.students;

-- Check roles array updated
SELECT id, display_name, roles FROM public.users LIMIT 10;

-- Check guardian relationships
SELECT * FROM public.guardian_students LIMIT 5;
```

### Test 3: RLS policies work
```typescript
// As authenticated user, should be able to read own data
const myData = await supabase
  .from('students')
  .select('*')
  .eq('id', authUser.id)
  .single();

// Should fail if trying to read someone else's data (RLS enforces)
```

---

## Step 6: Update Frontend Navigation

Update your app's navigation based on user role:

```typescript
// Example: AuthStack.tsx or RootStack.tsx
const userRole = currentUser?.roles[0]; // Get primary role

if (userRole === Role.STUDENT) {
  return <StudentNavigator />;
} else if (userRole === Role.GUARDIAN) {
  return <GuardianNavigator />;
} else if (userRole === Role.TUTOR) {
  return <TutorNavigator />;
}
```

---

## Step 7: Monitor & Debug

### Check migration success:
```sql
-- All users have a role
SELECT COUNT(*) FROM public.users WHERE roles = '{}';

-- All tutors have user record
SELECT COUNT(*) FROM public.tutors;
SELECT COUNT(*) FROM public.users WHERE 'TUTOR' = ANY(roles);

-- RLS policies enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('students', 'guardians', 'tutors');
```

### Enable logging (optional):
```sql
-- Monitor RLS policy violations
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- Try to read other user's data - should fail
```

---

## Rollback Plan (if needed)

If something goes wrong:

### Quick Rollback:
```sql
-- Revert role changes (if migration just happened)
UPDATE public.users 
SET roles = array['STUDENT']::text[];

-- Drop new role tables
DROP TABLE IF EXISTS public.tutor_academies CASCADE;
DROP TABLE IF EXISTS public.guardian_students CASCADE;
DROP TABLE IF EXISTS public.tutors CASCADE;
DROP TABLE IF EXISTS public.guardians CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
```

### Full Rollback:
1. Restore from database backup
2. Revert code changes
3. Re-test signup/login flow

---

## Timeline

- **Planning**: 30 minutes
- **Schema changes**: 5 minutes
- **Data migration**: 2-5 minutes (depending on user count)
- **Code updates**: 15 minutes
- **Testing**: 20 minutes
- **Deployment**: 10 minutes

**Total**: ~1 hour

---

## Support

### Common Issues:

**Error: "role already exists"**
```sql
-- Drop conflicting policy
DROP POLICY IF EXISTS "policy-name" ON table-name;
-- Re-create
```

**Error: "Foreign key violation"**
```sql
-- User exists but not in role table
-- Create role record for user
INSERT INTO public.students (id, created_at, updated_at)
VALUES ('user-uuid', NOW(), NOW())
ON CONFLICT DO NOTHING;
```

**RLS blocking all queries**
- Check `SELECT * FROM pg_policies` to see active policies
- Verify `auth.uid()` returns correct user ID
- Test with `SECURITY_DEFINER` if needed

---

## After Migration

1. **Monitor logs** for any authentication issues
2. **Test all auth flows**: signup, login, logout
3. **Test role-specific features** once implemented
4. **Update API documentation** with new role fields
5. **Train support team** on new role system

---

## Next: Implementing Role Features

See [ROLE_BASED_USER_SYSTEM.md](ROLE_BASED_USER_SYSTEM.md) for:
- Role-specific dashboards
- Relationship management
- Feature implementation per role

---

**Backup reminder**: Always backup before running migrations! 🔒
