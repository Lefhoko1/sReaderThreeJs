# Tutoring System Integration Guide

## Overview

The tutoring system has been fully implemented with a complete architecture supporting academies (tutoring businesses), levels/grades, subjects/modules, classes, and student registration/enrollment.

## File Structure

```
src/
├── application/viewmodels/
│   └── TutoringViewModel.ts        # Main business logic coordinator
├── data/
│   ├── repositories/
│   │   └── ITutoringRepository.ts  # Repository interface
│   └── supabase/
│       └── SupabaseTutoringRepository.ts  # Supabase implementation
├── domain/entities/
│   └── tutoring.ts                 # Domain models
└── presentation/components/tutoring/
    ├── TutoringMenu.tsx            # Main horizontal menu
    ├── tutor/
    │   └── AcademyManagement.tsx   # Tutor academy management
    ├── student/
    │   └── AcademyBrowser.tsx      # Student search and browse
    └── index.ts                     # Exports
```

## Database Schema

New tables created in Prisma schema:
- `tutoring_academies` - Tutoring business entities
- `tutoring_levels` - Grade/level within academy
- `tutoring_subjects` - Subject/module within level
- `tutoring_classes` - Individual classes for subject+level
- `academy_memberships` - Tutor/admin membership in academies
- `student_registration_requests` - Student requests to join classes
- `student_class_enrollments` - Active student enrollments

## How to Use

### 1. Initialize the System

```typescript
import { SupabaseTutoringRepository } from './src/data/supabase/SupabaseTutoringRepository';
import { TutoringViewModel } from './src/application/viewmodels/TutoringViewModel';

// Create repository instance
const tutoringRepo = new SupabaseTutoringRepository();

// Create view model
const tutoringViewModel = new TutoringViewModel(tutoringRepo);
```

### 2. For Tutors - Create an Academy

```typescript
const result = await tutoringViewModel.createAcademy(
  tutorUserId,
  {
    name: 'Elite Math Academy',
    description: 'Premier mathematics tutoring',
    location: 'New York, NY',
    email: 'contact@elitemath.com',
    phone: '+1234567890',
    websiteUrl: 'https://elitemath.com'
  }
);

if (result.ok) {
  console.log('Academy created:', result.value);
} else {
  console.error('Error:', result.value);
}
```

### 3. For Tutors - Create Levels

```typescript
// First, load their academies
await tutoringViewModel.loadMyAcademies(tutorUserId);

const levelResult = await tutoringViewModel.createLevel(
  academyId,
  {
    name: 'Grade 10',
    code: 'G10',
    description: 'Advanced mathematics for grade 10 students'
  }
);
```

### 4. For Tutors - Create Subjects

```typescript
const subjectResult = await tutoringViewModel.createSubject(
  academyId,
  levelId,
  {
    name: 'Algebra II',
    code: 'ALG2',
    description: 'Advanced algebraic concepts',
    creditHours: 40,
    costPerMonth: 150,
    costPerTerm: 450,
    costPerYear: 1200,
    capacity: 25,
    syllabusUrl: 'https://example.com/syllabus',
    prerequisites: 'Algebra I',
    learningOutcomes: '...'
  }
);
```

### 5. For Tutors - Create Classes

```typescript
const classResult = await tutoringViewModel.createClass(
  academyId,
  levelId,
  subjectId,
  instructorUserId,  // The tutor teaching this class
  {
    name: 'Algebra II - Section A',
    code: 'ALG2-A',
    description: 'Morning class for serious students',
    capacity: 20,
    schedule: {
      days: ['MON', 'WED', 'FRI'],
      startTime: '09:00',
      endTime: '10:30',
      timezone: 'America/New_York',
      frequency: 'WEEKLY'
    },
    location: '123 Math Street, NY',
    platform: 'IN_PERSON',
    costPerMonth: 150,
    costPerTerm: 450,
    costPerYear: 1200
  }
);
```

### 6. For Tutors - Manage Student Requests

```typescript
// Load pending requests for academy
const requestsResult = await tutoringViewModel.loadPendingRegistrationRequests(academyId);

if (requestsResult.ok) {
  const requests = requestsResult.value;
  
  // Approve a request
  const approveResult = await tutoringViewModel.approveRegistrationRequest(
    requestId,
    tutorUserId,  // who is approving
    new Date('2024-01-15'),  // enrollment start
    new Date('2024-05-15')   // enrollment end
  );
  
  // Reject a request
  const rejectResult = await tutoringViewModel.rejectRegistrationRequest(
    requestId,
    tutorUserId,
    'Class is full for this term'
  );
}
```

### 7. For Students - Browse Academies

```typescript
// Load all academies
const academiesResult = await tutoringViewModel.loadAllAcademies();

// Search academies
const searchResult = await tutoringViewModel.searchAcademies('Math Academy');

// Get academy stats
const statsResult = await tutoringViewModel.getAcademyStats(academyId);
if (statsResult.ok) {
  console.log('Total students:', statsResult.value.totalEnrolledStudents);
}
```

### 8. For Students - Request Registration

```typescript
// Load classes for browsing
const classesResult = await tutoringViewModel.loadClassesByAcademyId(academyId);

// Create registration request
const registrationResult = await tutoringViewModel.createRegistrationRequest(
  studentUserId,
  classId,
  {
    academyId: academyId,
    levelId: levelId,
    subjectId: subjectId,
    costTerm: 'MONTHLY',
    costAmount: 150
  }
);

if (registrationResult.ok) {
  console.log('Request sent! Academy will review soon.');
}
```

### 9. For Students - View Enrollments

```typescript
// Get all enrolled classes
const enrollmentsResult = await tutoringViewModel.loadMyEnrollments(studentUserId);

if (enrollmentsResult.ok) {
  enrollmentsResult.value.forEach(enrollment => {
    console.log(`Enrolled in ${enrollment.classId}`);
    console.log(`Payment Status: ${enrollment.paymentStatus}`);
    console.log(`Cost: $${enrollment.costPaid} (${enrollment.costTerm})`);
  });
}
```

### 10. Using the UI Components

#### Add to Your App Layout

```typescript
import {
  TutoringMenu,
  AcademyManagement,
  AcademyBrowser,
  TutoringViewModel
} from './src/presentation/components/tutoring';
import { SupabaseTutoringRepository } from './src/data/supabase/SupabaseTutoringRepository';

export const TutoringScreen = ({ userId, userRole }: Props) => {
  const [activeTab, setActiveTab] = useState('home');
  const [viewModel] = useState(() => 
    new TutoringViewModel(new SupabaseTutoringRepository())
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Horizontal Menu */}
      <TutoringMenu
        userRole={userRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content based on role */}
      {userRole === 'TUTOR' && activeTab === 'academies' && (
        <AcademyManagement
          viewModel={viewModel}
          tutorId={userId}
          onAcademySelect={(academy) => {
            // Handle academy selection
          }}
        />
      )}

      {userRole === 'STUDENT' && activeTab === 'browse' && (
        <AcademyBrowser
          viewModel={viewModel}
          studentId={userId}
          onClassSelect={(classData) => {
            // Handle class selection
          }}
        />
      )}
    </View>
  );
};
```

## Data Captured

### Academy Level
- ✅ Name, description, logo
- ✅ Location with contact info
- ✅ Email, phone, website
- ✅ Verification status
- ✅ Owner tracking

### Level/Grade Level
- ✅ Name (e.g., "IGCSE", "Grade 10")
- ✅ Code (unique per academy)
- ✅ Description

### Subject/Module Level
- ✅ Name, code, description
- ✅ Credit hours
- ✅ Multiple pricing options (monthly, termly, yearly)
- ✅ Capacity limits
- ✅ Syllabus URL
- ✅ Prerequisites
- ✅ Learning outcomes

### Class Level
- ✅ Name, code, description
- ✅ Schedule (days, times, timezone)
- ✅ Location and platform (in-person, online, hybrid)
- ✅ Instructor assignment
- ✅ Multiple cost options
- ✅ Capacity tracking

### Student Registration
- ✅ Request tracking with status
- ✅ Cost terms and amounts
- ✅ Approval/rejection workflows
- ✅ Enrollment date ranges
- ✅ Payment status

### Enrollment
- ✅ Enrollment dates
- ✅ Payment tracking
- ✅ Cost term tracking
- ✅ Active status
- ✅ Payment due dates

## ViewModels Available

### TutoringViewModel Methods

**Academy Management:**
- `createAcademy()` - Create new academy
- `loadMyAcademies()` - Get tutor's academies
- `loadAcademyById()` - Get specific academy
- `updateAcademy()` - Update academy details
- `deleteAcademy()` - Delete academy

**Level Management:**
- `createLevel()` - Create grade/level
- `loadLevelsByAcademyId()` - Get levels for academy
- `updateLevel()` - Update level
- `deleteLevel()` - Delete level

**Subject Management:**
- `createSubject()` - Create subject/module
- `loadSubjectsByLevelId()` - Get subjects for level
- `updateSubject()` - Update subject
- `deleteSubject()` - Delete subject

**Class Management:**
- `createClass()` - Create class
- `loadClassesBySubjectId()` - Get classes for subject
- `loadClassesByAcademyId()` - Get all classes in academy
- `loadClassesByInstructorId()` - Get tutor's classes
- `updateClass()` - Update class details
- `deleteClass()` - Delete class

**Registration Management:**
- `createRegistrationRequest()` - Student requests to join
- `loadPendingRegistrationRequests()` - View pending requests (tutor)
- `loadMyRegistrationRequests()` - View my requests (student)
- `approveRegistrationRequest()` - Approve student
- `rejectRegistrationRequest()` - Reject with reason
- `withdrawRegistrationRequest()` - Student withdraw request

**Enrollment Management:**
- `loadMyEnrollments()` - Get student's enrolled classes
- `removeStudentFromClass()` - Unenroll student

**Search & Discovery:**
- `searchAcademies()` - Search by name/location
- `loadAllAcademies()` - Get all academies
- `getClassCapacityInfo()` - Check availability
- `getAcademyStats()` - Get academy statistics

**UI Helpers:**
- `clearError()` - Clear error messages
- `clearSuccess()` - Clear success messages
- `selectAcademy()` - Set selected academy
- `selectLevel()` - Set selected level
- `selectSubject()` - Set selected subject
- `selectClass()` - Set selected class

## State Management (MobX)

The `TutoringViewModel` uses MobX for reactive state management:

```typescript
// Observable state
academies: TutoringAcademy[] = [];
currentAcademy: TutoringAcademy | null = null;
levels: TutoringLevel[] = [];
subjects: TutoringSubject[] = [];
classes: TutoringClass[] = [];
registrationRequests: StudentRegistrationRequest[] = [];
studentEnrollments: StudentClassEnrollment[] = [];

// UI state
loading = false;
error: string | null = null;
successMessage: string | null = null;
```

Use with `observer` HOC for automatic updates:

```typescript
export const MyComponent = observer(() => {
  // Component will automatically re-render when viewModel state changes
});
```

## Error Handling

All methods return a `Result<T>` type:

```typescript
interface Result<T> {
  ok: boolean;
  value: T | string; // T if ok=true, error message if ok=false
}

// Usage
const result = await viewModel.createAcademy(...);
if (result.ok) {
  // Handle success
  const academy = result.value as TutoringAcademy;
} else {
  // Handle error
  const errorMsg = result.value as string;
}
```

## Next Steps

### To Further Enhance:

1. **Payment Integration**
   - Add Stripe/PayPal payment processing
   - Create PaymentViewModel
   - Add payment confirmation workflow

2. **Notifications**
   - Notify tutors of registration requests
   - Notify students of approval/rejection
   - Schedule reminders for payments

3. **Analytics**
   - Track enrollment trends
   - Generate revenue reports
   - Student performance tracking

4. **Ratings & Reviews**
   - Add rating system for academies
   - Add review system for instructors
   - Display ratings in search results

5. **Advanced Search**
   - Filter by price range
   - Filter by schedule
   - Filter by instructor qualifications
   - Filter by academy location

6. **Attendance Tracking**
   - Mark attendance
   - Track absence patterns
   - Generate attendance reports

7. **Student-Instructor Chat**
   - Direct messaging
   - Class announcements
   - Assignment submission

8. **Admin Dashboard**
   - Verify academies
   - Manage disputes
   - View platform statistics

## Troubleshooting

### Data Not Loading?
- Check if tables are created in database
- Run migrations: `npm run db:migrate`
- Check Supabase connection

### Component Not Updating?
- Ensure component is wrapped with `observer` HOC
- Check that you're calling async methods properly
- Verify MobX state is being modified

### Registration Requests Not Appearing?
- Check academy ID is correct
- Verify requests have `PENDING` status
- Check user permissions

## API Response Examples

### Create Academy Success
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ownerId": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Elite Math Academy",
  "description": "Premier mathematics tutoring",
  "location": "New York, NY",
  "email": "contact@elitemath.com",
  "phone": "+1234567890",
  "isVerified": false,
  "createdAt": "2024-01-11T10:30:00Z",
  "updatedAt": "2024-01-11T10:30:00Z"
}
```

### Student Registration Request
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "studentId": "550e8400-e29b-41d4-a716-446655440003",
  "classId": "550e8400-e29b-41d4-a716-446655440004",
  "status": "PENDING",
  "costTerm": "MONTHLY",
  "costAmount": 150,
  "paymentStatus": "NOT_PAID",
  "requestedAt": "2024-01-11T10:30:00Z"
}
```

### Class with Capacity Info
```json
{
  "capacity": 30,
  "enrolled": 22,
  "available": 8
}
```

## Support

For issues or questions:
1. Check the plan document: `TUTORING_SYSTEM_PLAN.md`
2. Review entity definitions: `src/domain/entities/tutoring.ts`
3. Check repository interface: `src/data/repositories/ITutoringRepository.ts`
4. Review ViewModel implementation: `src/application/viewmodels/TutoringViewModel.ts`
