# Comprehensive Tutoring Business System Plan

## 1. Database Schema Additions

### Core Models

#### Academy (Tutoring Business)
```
- id: UUID (PK)
- ownerId: UUID (FK -> User, TUTOR)
- name: String
- description: String
- logo: String (URL)
- location: String
- phone: String
- email: String
- websiteUrl: String
- isVerified: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### Level/Grade (Within Academy)
```
- id: UUID (PK)
- academyId: UUID (FK -> Academy)
- name: String (e.g., "High School", "Grade 10", "A-Levels")
- description: String
- code: String (unique per academy)
- createdAt: DateTime
```

#### Subject/Module
```
- id: UUID (PK)
- levelId: UUID (FK -> Level)
- academyId: UUID (FK -> Academy)
- name: String (e.g., "Mathematics", "English Literature")
- code: String
- description: String
- creditHours: Int
- costPerMonth: Decimal
- costPerTerm: Decimal
- costPerYear: Decimal
- capacity: Int (max students)
- syllabus: String (URL/reference)
- createdAt: DateTime
```

#### AcademyClass
```
- id: UUID (PK)
- levelId: UUID (FK -> Level)
- subjectId: UUID (FK -> Subject)
- academyId: UUID (FK -> Academy)
- name: String (e.g., "Class 10A - Mathematics")
- code: String
- description: String
- capacity: Int
- schedule: Json (recurring time slots)
- instructorId: UUID (FK -> User, TUTOR)
- costPerMonth: Decimal
- costPerTerm: Decimal
- costPerYear: Decimal
- createdAt: DateTime
```

#### StudentRegistrationRequest
```
- id: UUID (PK)
- studentId: UUID (FK -> User, STUDENT)
- classId: UUID (FK -> AcademyClass)
- levelId: UUID (FK -> Level)
- subjectId: UUID (FK -> Subject)
- academyId: UUID (FK -> Academy)
- status: String (PENDING, APPROVED, REJECTED, WITHDRAWN)
- requestedAt: DateTime
- respondedAt: DateTime
- respondedBy: UUID (FK -> User, TUTOR/ADMIN)
- reason: String (for rejection)
- paymentStatus: String (NOT_PAID, PENDING, PAID)
- enrollmentStartDate: DateTime
- enrollmentEndDate: DateTime
```

#### AcademyMembership (Tutor/Admin management)
```
- id: UUID (PK)
- academyId: UUID (FK -> Academy)
- userId: UUID (FK -> User)
- role: String (OWNER, ADMIN, INSTRUCTOR, ASSISTANT)
- joinedAt: DateTime
```

#### StudentClassEnrollment
```
- id: UUID (PK)
- studentId: UUID (FK -> User, STUDENT)
- classId: UUID (FK -> AcademyClass)
- enrolledAt: DateTime
- enrollmentEndDate: DateTime
- paymentStatus: String
- costPaid: Decimal
- costTerm: String (monthly, termly, yearly)
- isActive: Boolean
```

## 2. Domain Entities Structure

```
src/domain/entities/
├── tutoring.ts (Core tutoring entities)
│   ├── Academy
│   ├── Level
│   ├── Subject
│   ├── AcademyClass
│   ├── StudentRegistrationRequest
│   └── StudentClassEnrollment
└── (existing entities remain)
```

## 3. Repository Pattern

```
src/data/repositories/
├── IAcademyRepository.ts (CRUD + queries)
├── ILevelRepository.ts
├── ISubjectRepository.ts
├── IClassRepository.ts
├── IStudentRegistrationRequestRepository.ts
├── IEnrollmentRepository.ts
└── (implementation in supabase/ folder)
```

## 4. ViewModel Layer

```
src/application/viewmodels/
├── TutoringViewModel.ts (Main coordinator)
├── AcademyManagementViewModel.ts
├── LevelManagementViewModel.ts
├── SubjectManagementViewModel.ts
├── ClassManagementViewModel.ts
├── StudentSearchViewModel.ts
├── StudentRegistrationViewModel.ts
└── EnrollmentViewModel.ts
```

## 5. UI Component Structure

```
src/presentation/components/
├── tutoring/
│   ├── TutoringMenu.tsx (Main horizontal menu)
│   ├── tutor/
│   │   ├── AcademyManagement.tsx
│   │   ├── LevelManagement.tsx
│   │   ├── SubjectManagement.tsx
│   │   ├── ClassManagement.tsx
│   │   ├── StudentRequestsList.tsx
│   │   └── ClassStudentsManagement.tsx
│   ├── student/
│   │   ├── AcademySearch.tsx
│   │   ├── LevelSearch.tsx
│   │   ├── SubjectSearch.tsx
│   │   ├── ClassSearch.tsx
│   │   ├── ClassDetails.tsx (with profile/cost info)
│   │   ├── RegistrationRequest.tsx
│   │   └── MyEnrollments.tsx
│   └── common/
│       ├── AcademyCard.tsx
│       ├── ClassCard.tsx
│       └── CostDisplay.tsx
```

## 6. Feature Breakdown

### Tutor Features
1. **Academy Management**
   - Create/Edit/Delete academy
   - View academy profile and students
   - Manage academy members (admins, instructors)

2. **Level Management**
   - Add levels/grades to academy
   - Edit level information
   - View level statistics

3. **Subject Management**
   - Add subjects/modules to levels
   - Set pricing (monthly, termly, yearly)
   - Set capacity limits
   - Upload syllabus

4. **Class Management**
   - Create classes for level+subject combinations
   - Set schedule
   - Set pricing
   - Assign instructors
   - View enrolled students

5. **Student Registration**
   - View pending requests
   - Approve/reject student requests
   - Remove students from classes

### Student Features
1. **Search & Discover**
   - Browse all academies
   - Browse levels within academy
   - Browse subjects within level
   - Browse classes within subject

2. **Detailed View**
   - View academy profile (description, location, contact, ratings)
   - View subject details (syllabus, duration, requirements)
   - View class details (schedule, instructor info, cost breakdown)
   - View instructor profile

3. **Request & Registration**
   - Send registration request for class
   - View request status
   - View payment options
   - Complete payment
   - View enrollment status

4. **My Enrollments**
   - View all enrolled classes
   - View class schedule
   - Access class materials
   - Contact instructor

## 7. Payment Integration Points
- Display costs clearly in all searches
- Multiple pricing options (monthly, termly, yearly)
- Payment status tracking
- Invoice generation
- Payment confirmation before enrollment completion

## 8. Data Capture Requirements

### Academy Level
- Name, description, logo
- Location (with coordinates for map)
- Contact (email, phone, website)
- Verification status
- Operating hours
- Bank details (for payment)

### Level Level
- Name (e.g., "IGCSE", "A-Levels", "Grade 9-10")
- Code (unique within academy)
- Description
- Duration (weeks/months)

### Subject Level
- Name, code, description
- Credit hours / duration
- Pricing structure (monthly/termly/yearly)
- Capacity
- Prerequisites
- Learning outcomes
- Syllabus/curriculum reference

### Class Level
- Name, code
- Schedule (days, times, duration)
- Instructor assignment
- Pricing (may differ from subject)
- Class size limit
- Description/notes
- Meeting location/platform
- Instructor qualifications

### Student Registration
- Student profile (name, email, current education)
- Classes requested
- Why interested
- Schedule availability confirmation
- Payment information
- Terms acceptance

### Enrollment
- Enrollment dates
- Payment status and amount
- Attendance tracking
- Performance metrics
- Renewal status

## 9. Implementation Approach

1. **Phase 1**: Database schema + Repository interfaces
2. **Phase 2**: Domain entities + Repository implementations
3. **Phase 3**: ViewModels with business logic
4. **Phase 4**: UI Components (menu, management, search)
5. **Phase 5**: Integration into main app
6. **Phase 6**: Testing and refinement
