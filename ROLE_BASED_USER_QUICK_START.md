# Quick Start: Role-Based User System

## What Changed?

### Database
- Added `students`, `guardians`, `tutors` tables
- Added `guardian_students` and `tutor_academies` junction tables
- All role tables have RLS enabled

### Backend (AuthViewModel)
- Signup now requires a `role` parameter
- Role-specific data is captured and stored
- Each role creates appropriate records in their table

### Frontend (SignupScreen)
- Added role selection UI with segmented buttons
- Conditional fields based on selected role
- Student: grade level, school name
- Tutor: years of experience

---

## How to Test

### 1. Signup as Student
1. Open SignupScreen
2. Enter name, email, password
3. Select "Student" role
4. Optionally enter grade level and school
5. Submit

### 2. Signup as Guardian
1. Enter name, email, password
2. Select "Guardian" role
3. Submit

### 3. Signup as Tutor
1. Enter name, email, password
2. Select "Tutor" role
3. Optionally enter years of experience
4. Submit

---

## Database Queries

### Find user and their role data
```typescript
// For Student
const student = await supabase
  .from('users')
  .select('*, student:students(*)')
  .eq('id', userId)
  .single();

// For Guardian
const guardian = await supabase
  .from('users')
  .select('*, guardian:guardians(*)')
  .eq('id', userId)
  .single();

// For Tutor
const tutor = await supabase
  .from('users')
  .select('*, tutor:tutors(*)')
  .eq('id', userId)
  .single();
```

---

## Login Behavior

Login flow remains the same - users authenticate with email/password. Their roles are retrieved from the `users.roles` array.

---

## Next Steps

1. **Deploy schema changes**
   - Run `supabase-schema.sql` in your Supabase SQL editor
   - OR use `prisma migrate` if using migrations

2. **Test signup flow**
   - Create test accounts with each role
   - Verify data in Supabase tables

3. **Implement role-specific features**
   - Create role-specific screens/dashboards
   - Add role-specific navigation
   - Implement authorization logic

4. **Add relationship management**
   - Guardian → Student linking UI
   - Tutor → Academy linking
   - Student → Guardian visibility

---

## File Changes Summary

| File | Change |
|------|--------|
| `supabase-schema.sql` | Added role tables and RLS policies |
| `prisma/schema.prisma` | Added Student, Guardian, Tutor models |
| `src/domain/entities/user.ts` | Added role-specific interfaces |
| `src/application/viewmodels/AuthViewModel.ts` | Enhanced signup with role handling |
| `src/presentation/screens/SignupScreen.tsx` | Added role selection UI |

---

## Data Model Relationships

```
User (1) ──→ (0..1) Student
User (1) ──→ (0..1) Guardian
User (1) ──→ (0..1) Tutor

Guardian (1) ──→ (many) Student (via guardian_students)
Tutor (1) ──→ (many) Academy (via tutor_academies)
```

---

## Default Roles

When a user signs up, they get one role in the `users.roles[]` array:
- STUDENT
- GUARDIAN
- TUTOR

(Future: support multiple roles in single array)

---

## Error Handling

- Invalid role: "Invalid user role selected"
- Missing role: "All fields are required"
- Student record creation fails: "Failed to create student profile"
- Guardian record creation fails: "Failed to create guardian profile"
- Tutor record creation fails: "Failed to create tutor profile"

---

## Common Issues & Fixes

**Problem**: Role-specific table is empty after signup
- **Solution**: Check RLS policies allow inserts by the user

**Problem**: User created but role table is empty
- **Solution**: Verify Supabase connection, check console errors

**Problem**: Can't login after signup
- **Solution**: Verify email was confirmed, check auth logs

---

## API Design (To Implement)

```typescript
// User Profile Endpoints
GET    /api/users/:userId              // Get user + role data
PATCH  /api/users/:userId              // Update user basic info

// Student-specific
PATCH  /api/students/:studentId        // Update student data
GET    /api/students/:studentId/guardians

// Guardian-specific
PATCH  /api/guardians/:guardianId      // Update guardian data
GET    /api/guardians/:guardianId/students
POST   /api/guardians/:guardianId/link-student
DELETE /api/guardians/:guardianId/students/:studentId

// Tutor-specific
PATCH  /api/tutors/:tutorId            // Update tutor data
GET    /api/tutors/:tutorId/academies
POST   /api/tutors/:tutorId/academies
```

---

## Schema Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ phone           │
│ display_name    │
│ avatar_url      │
│ roles[]         │
└────────┬────────┘
         │
    ┌────┴──────────────────┐
    │                       │
┌───▼──────────┐  ┌────────▼────┐  ┌───────────────┐
│   students   │  │  guardians   │  │    tutors     │
├──────────────┤  ├──────────────┤  ├───────────────┤
│ id (FK)      │  │ id (FK)      │  │ id (FK)       │
│ grade_level  │  │ occupation   │  │ bio           │
│ school_name  │  │ relationship │  │ specializ...  │
│ dob          │  │              │  │ education_lvl │
└──────┬───────┘  └──────┬───────┘  │ years_exp     │
       │                 │           │ hourly_rate   │
       │      ┌──────────┴───────┐   │ is_verified   │
       │      │                  │   └────────┬──────┘
       ▼      ▼                  │            │
┌─────────────────────┐   ┌──────▼────────────▼──┐
│ guardian_students   │   │  tutor_academies     │
├─────────────────────┤   ├──────────────────────┤
│ guardian_id (FK)    │   │ tutor_id (FK)        │
│ student_id (FK)     │   │ academy_id (FK)      │
│ relationship        │   │ role                 │
└─────────────────────┘   └──────────────────────┘
```
