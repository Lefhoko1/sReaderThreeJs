# Tutoring System - Quick Start Reference

## 🚀 30-Second Setup

```typescript
import { SupabaseTutoringRepository } from './src/data/supabase/SupabaseTutoringRepository';
import { TutoringViewModel } from './src/application/viewmodels/TutoringViewModel';

// Initialize
const repo = new SupabaseTutoringRepository();
const vm = new TutoringViewModel(repo);

// Ready to use!
```

## 📚 Core Concepts

### 1. Academy (Tutoring Business)
Your tutoring business entity with location, contact info, and profile.

```typescript
const result = await vm.createAcademy(userId, {
  name: 'Math Masters',
  location: 'New York, NY',
  email: 'info@mathmaster.com'
});
```

### 2. Level (Grade/Year)
Organize academy into levels: "Grade 10", "A-Levels", "IGCSE"

```typescript
const result = await vm.createLevel(academyId, {
  name: 'Grade 10',
  code: 'G10'
});
```

### 3. Subject (Module/Course)
Subjects within a level with pricing: "Mathematics", "English", "Physics"

```typescript
const result = await vm.createSubject(academyId, levelId, {
  name: 'Algebra II',
  costPerMonth: 150,
  costPerTerm: 450,
  costPerYear: 1200
});
```

### 4. Class (Actual Class Section)
Individual classes with schedule, instructor, and capacity.

```typescript
const result = await vm.createClass(
  academyId, levelId, subjectId, instructorId,
  {
    name: 'Algebra II - Section A',
    schedule: {
      days: ['MON', 'WED', 'FRI'],
      startTime: '09:00',
      endTime: '10:30',
      timezone: 'America/New_York'
    },
    platform: 'IN_PERSON',
    costPerMonth: 150
  }
);
```

### 5. Registration Request
Student requests to join a class, academy approves or rejects.

**Student creates request:**
```typescript
await vm.createRegistrationRequest(studentId, classId, {
  academyId, levelId, subjectId,
  costTerm: 'MONTHLY',
  costAmount: 150
});
```

**Tutor approves:**
```typescript
await vm.approveRegistrationRequest(
  requestId, 
  tutorId,
  new Date('2024-01-15'),  // start
  new Date('2024-05-15')   // end
);
```

### 6. Enrollment
Once approved, student is enrolled and can manage payments.

```typescript
const enrollments = await vm.loadMyEnrollments(studentId);
```

## 🎯 Common Workflows

### Tutor: Set Up Complete Academy

```typescript
// 1. Create academy
const acad = await vm.createAcademy(tutorId, { name: '...' });
const academyId = acad.value.id;

// 2. Add levels
const level = await vm.createLevel(academyId, { name: 'Grade 10', code: 'G10' });
const levelId = level.value.id;

// 3. Add subjects
const subj = await vm.createSubject(academyId, levelId, { 
  name: 'Math', 
  costPerMonth: 150 
});
const subjectId = subj.value.id;

// 4. Create classes
await vm.createClass(academyId, levelId, subjectId, tutorId, {
  name: 'Morning Class',
  schedule: { days: ['MON', 'WED'], startTime: '09:00', endTime: '10:30', timezone: 'UTC' }
});
```

### Student: Find and Register

```typescript
// 1. Browse academies
const academies = await vm.loadAllAcademies();

// 2. Search
const results = await vm.searchAcademies('math');

// 3. Load levels
const levels = await vm.loadLevelsByAcademyId(academyId);

// 4. Load classes
const classes = await vm.loadClassesByLevelId(levelId);

// 5. Request registration
await vm.createRegistrationRequest(studentId, classId, {
  academyId, levelId, costTerm: 'MONTHLY'
});

// 6. Track requests
const requests = await vm.loadMyRegistrationRequests(studentId);
```

### Tutor: Manage Requests

```typescript
// Get pending requests
const requests = await vm.loadPendingRegistrationRequests(academyId);

// Approve
await vm.approveRegistrationRequest(requestId, tutorId, startDate, endDate);

// Reject
await vm.rejectRegistrationRequest(requestId, tutorId, 'Class is full');
```

## 📊 Key Data Points

| Entity | Key Fields |
|--------|-----------|
| **Academy** | id, name, location, email, phone, isVerified |
| **Level** | id, name, code, description |
| **Subject** | id, name, costPerMonth, costPerTerm, costPerYear, capacity |
| **Class** | id, name, instructorId, schedule, platform, costPerMonth |
| **Request** | id, status, costAmount, paymentStatus, enrollmentStartDate |
| **Enrollment** | id, classId, costPaid, paymentStatus, enrollmentEndDate |

## 🎨 UI Components

### TutoringMenu
Navigation menu - use to switch between sections
```typescript
<TutoringMenu 
  userRole="TUTOR" 
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### AcademyManagement (Tutor)
Create and manage academies
```typescript
<AcademyManagement 
  viewModel={vm} 
  tutorId={userId}
/>
```

### AcademyBrowser (Student)
Search and browse classes
```typescript
<AcademyBrowser 
  viewModel={vm}
  studentId={userId}
/>
```

### StudentEnrollments (Student)
View requests and enrollments
```typescript
<StudentEnrollments 
  viewModel={vm}
  studentId={userId}
/>
```

## 💡 Tips

1. **Always check `result.ok`** before using value
   ```typescript
   if (result.ok) {
     const data = result.value;
   } else {
     const error = result.value; // error message
   }
   ```

2. **Use observer HOC** for React components
   ```typescript
   export const MyComponent = observer(() => { ... });
   ```

3. **Watch VM state** for reactive updates
   ```typescript
   // These update automatically when data changes
   vm.academies
   vm.classes
   vm.registrationRequests
   vm.loading
   vm.error
   ```

4. **Multiple cost options** - use what fits
   ```typescript
   subject: {
     costPerMonth: 150,    // For monthly billing
     costPerTerm: 450,     // For term billing
     costPerYear: 1200     // For yearly billing
   }
   ```

5. **Schedule flexibility**
   ```typescript
   schedule: {
     days: ['MON', 'TUE', 'THU'],
     startTime: '14:00',
     endTime: '15:30',
     timezone: 'America/New_York',
     frequency: 'WEEKLY'
   }
   ```

## 🔍 Common Queries

```typescript
// Get tutor's academies
await vm.loadMyAcademies(tutorId);

// Get levels in academy
await vm.loadLevelsByAcademyId(academyId);

// Get subjects in level
await vm.loadSubjectsByLevelId(levelId);

// Get classes in subject
await vm.loadClassesBySubjectId(subjectId);

// Get classes taught by instructor
await vm.loadClassesByInstructorId(instructorId);

// Search academies by name/location
await vm.searchAcademies('Boston');

// Check class capacity
await vm.getClassCapacityInfo(classId);
// Returns: { capacity: 30, enrolled: 22, available: 8 }

// Get academy stats
await vm.getAcademyStats(academyId);
// Returns: { totalLevels, totalSubjects, totalClasses, totalEnrolledStudents }

// Get student's requests
await vm.loadMyRegistrationRequests(studentId);

// Get student's enrollments
await vm.loadMyEnrollments(studentId);

// Get pending requests for academy (tutor view)
await vm.loadPendingRegistrationRequests(academyId);
```

## ✅ Statuses

**Request Status:**
- `PENDING` - Awaiting tutor approval
- `APPROVED` - Student can enroll
- `REJECTED` - Student not accepted
- `WITHDRAWN` - Student withdrew

**Payment Status:**
- `NOT_PAID` - No payment yet
- `PENDING` - Payment in progress
- `PAID` - Payment complete
- `OVERDUE` - Past due date

**Enrollment Status:**
- `ACTIVE` - Currently enrolled
- `INACTIVE` - Dropped or completed

## 🚨 Error Handling

```typescript
const result = await vm.createAcademy(...);

if (!result.ok) {
  console.error('Failed:', result.value); // error message
  vm.error; // also available in viewmodel
}

// Watch errors
runInAction(() => {
  vm.error; // null or error message
  vm.successMessage; // null or success message
});

// Clear messages
vm.clearError();
vm.clearSuccess();
```

## 📖 Documentation Files

- `TUTORING_SYSTEM_PLAN.md` - Detailed architecture and design
- `TUTORING_INTEGRATION_GUIDE.md` - Complete integration instructions
- `TUTORING_SYSTEM_IMPLEMENTATION.md` - Implementation summary
- `TUTORING_SYSTEM_QUICK_START.md` - This file!

## 🎓 Example: Complete Flow

```typescript
// 1. Setup
const vm = new TutoringViewModel(new SupabaseTutoringRepository());

// 2. Tutor creates academy
const academy = await vm.createAcademy(tutorId, {
  name: 'Elite Academy',
  location: 'NYC'
});

// 3. Tutor adds level
const level = await vm.createLevel(academy.value.id, {
  name: 'Grade 10',
  code: 'G10'
});

// 4. Tutor adds subject
const subject = await vm.createSubject(
  academy.value.id,
  level.value.id,
  { name: 'Math', costPerMonth: 100 }
);

// 5. Tutor creates class
const cls = await vm.createClass(
  academy.value.id,
  level.value.id,
  subject.value.id,
  tutorId,
  { name: 'Class A', schedule: {...} }
);

// 6. Student searches
const academies = await vm.loadAllAcademies();

// 7. Student requests registration
const request = await vm.createRegistrationRequest(
  studentId,
  cls.value.id,
  { academyId: academy.value.id, levelId: level.value.id }
);

// 8. Tutor approves
await vm.approveRegistrationRequest(
  request.value.id,
  tutorId,
  new Date(),
  new Date('2024-12-31')
);

// 9. Student views enrollment
const enrollments = await vm.loadMyEnrollments(studentId);
```

That's it! You now have a functioning tutoring platform. 🎓
