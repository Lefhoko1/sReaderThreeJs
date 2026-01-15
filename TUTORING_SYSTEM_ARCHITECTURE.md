# Tutoring System - Visual Overview & Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (UI)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────────────────┐   │
│  │ TutoringMenu     │      │  Academy Browser (Student)   │   │
│  │ - Navigation     │      │  - Search academies         │   │
│  │ - Role-based     │      │  - Browse levels/subjects   │   │
│  │ - Responsive     │      │  - View class details       │   │
│  └──────────────────┘      │  - Request registration     │   │
│                            └──────────────────────────────┘   │
│  ┌──────────────────┐      ┌──────────────────────────────┐   │
│  │ Academy Mgmt     │      │ Student Enrollments         │   │
│  │ (Tutor)          │      │ - Track requests            │   │
│  │ - CRUD academies │      │ - Manage enrollments        │   │
│  │ - View profile   │      │ - Payment tracking          │   │
│  └──────────────────┘      └──────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│               APPLICATION LAYER (Business Logic)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              ┌─────────────────────────────────┐               │
│              │    TutoringViewModel (MobX)     │               │
│              │  40+ Methods Coordinating:     │               │
│              ├─────────────────────────────────┤               │
│              │ • Academy Management           │               │
│              │ • Level Management             │               │
│              │ • Subject Management           │               │
│              │ • Class Management             │               │
│              │ • Registration Workflow        │               │
│              │ • Enrollment Management        │               │
│              │ • Search & Discovery           │               │
│              │ • Statistics & Capacity        │               │
│              └─────────────────────────────────┘               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                  DATA ACCESS LAYER (Repository)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐   ┌──────────────────────────┐   │
│  │ ITutoringRepository     │   │ SupabaseTutor.Repository │   │
│  │ (Interface)             │→→→│ (Implementation)         │   │
│  │ 30+ Methods:            │   │ - CRUD Operations       │   │
│  │ - Academy CRUD          │   │ - Search                │   │
│  │ - Level CRUD            │   │ - Filtering             │   │
│  │ - Subject CRUD          │   │ - Aggregation           │   │
│  │ - Class CRUD            │   │ - Capacity Tracking     │   │
│  │ - Registration Workflow │   │ - Statistics            │   │
│  │ - Enrollment Mgmt       │   │ - Error Handling        │   │
│  └─────────────────────────┘   └──────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                  DOMAIN LAYER (Models & Entities)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │            tutoring.ts Domain Entities                │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                        │   │
│  │  • TutoringAcademy                                   │   │
│  │  • TutoringLevel                                     │   │
│  │  • TutoringSubject                                   │   │
│  │  • TutoringClass                                     │   │
│  │  • AcademyMembership                                 │   │
│  │  • StudentRegistrationRequest                        │   │
│  │  • StudentClassEnrollment                            │   │
│  │  • ClassSchedule                                     │   │
│  │  • And supporting types...                           │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                DATABASE LAYER (PostgreSQL/Supabase)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐      │
│  │ tutoring_     │  │ tutoring_     │  │ tutoring_   │      │
│  │ academies    │  │ levels        │  │ subjects    │      │
│  └───────────────┘  └────────────────┘  └──────────────┘      │
│                                                                 │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐      │
│  │ tutoring_     │  │ academy_       │  │ student_     │      │
│  │ classes       │  │ memberships    │  │ registration │      │
│  │               │  │                │  │ _requests    │      │
│  └───────────────┘  └────────────────┘  └──────────────┘      │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │ student_class_           │                                  │
│  │ enrollments              │                                  │
│  └──────────────────────────┘                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram - Tutor Creates Academy

```
┌─────────────────────────────────────────────────────────────┐
│ Tutor clicks "Create Academy" in AcademyManagement.tsx     │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│ Form submitted with academy data                           │
│ - name, description, location, email, phone, website      │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│ TutoringViewModel.createAcademy()                           │
│ - Validates input                                          │
│ - Sets loading = true                                      │
│ - Calls repository                                         │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│ SupabaseTutoringRepository.createAcademy()                 │
│ - Inserts into tutoring_academies table                    │
│ - Maps response to domain entity                           │
│ - Returns Result<TutoringAcademy>                          │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│ Supabase Database                                          │
│ INSERT INTO tutoring_academies (                           │
│   owner_id, name, description, logo_url, location,        │
│   phone, email, website_url, is_verified, created_at      │
│ ) VALUES (...)                                             │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│ Response returned through layers                           │
│ - Result<TutoringAcademy> with new academy                │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│ ViewModel processes result                                │
│ - Adds to academies array                                 │
│ - Sets currentAcademy                                     │
│ - Sets loading = false                                    │
│ - Sets successMessage                                     │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│ MobX notifies React component                              │
│ - Component re-renders                                     │
│ - Shows success message                                    │
│ - Updates academy list                                     │
│ - Clears form                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram - Student Requests Registration

```
┌──────────────────────────────────────────────────────────────┐
│ Student browses academy, finds class, clicks               │
│ "Request Registration" in AcademyBrowser.tsx              │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────────┐
│ Modal shows class details with cost options                │
│ Student selects cost term (MONTHLY/TERMLY/YEARLY)         │
│ Confirms registration request                             │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────────┐
│ TutoringViewModel.createRegistrationRequest()             │
│ - Validates student not already registered               │
│ - Sets loading = true                                    │
│ - Calls repository                                       │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────────┐
│ SupabaseTutoringRepository.createRegistrationRequest()    │
│ - Inserts into student_registration_requests table        │
│ - Status = PENDING, paymentStatus = NOT_PAID             │
│ - Returns Result<StudentRegistrationRequest>              │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────────┐
│ Supabase Database                                        │
│ INSERT INTO student_registration_requests (               │
│   student_id, class_id, academy_id, level_id,            │
│   subject_id, status, cost_term, cost_amount,            │
│   payment_status, requested_at                            │
│ ) VALUES (...)                                            │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────────┐
│ Response returned                                        │
│ - Result<StudentRegistrationRequest> with PENDING status │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────────┐
│ ViewModel processes result                              │
│ - Adds to registrationRequests array                    │
│ - Sets loading = false                                  │
│ - Sets successMessage                                   │
│ - Closes modal                                          │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────────┐
│ Student sees confirmation                              │
│ - Can view request in StudentEnrollments component      │
│ - Tracks status (PENDING → APPROVED/REJECTED)          │
│ - Can withdraw if PENDING                              │
└──────────────────────────────────────────────────────────────┘

                    ╔════════════════════════════╗
                    ║  Request Approval (Tutor)  ║
                    ╚═════════┬══════════════════╝
                              │
                              ↓
        ┌──────────────────────────────────────────┐
        │ Tutor sees pending request               │
        │ Views student profile and class info    │
        │ Clicks APPROVE or REJECT               │
        └──────────┬───────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────────────────────────┐
        │ TutoringViewModel                       │
        │ .approveRegistrationRequest()           │
        │ .rejectRegistrationRequest()            │
        │ Status → APPROVED/REJECTED              │
        │ Creates enrollment if APPROVED          │
        └──────────┬───────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────────────────────────┐
        │ Student sees approval in app            │
        │ Can now proceed to payment              │
        │ Or view rejection reason                │
        └──────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
                    ┌──────────────────────┐
                    │  User (from auth)   │
                    ├──────────────────────┤
                    │ id (UUID)            │
                    │ displayName          │
                    │ roles: TUTOR/STUDENT │
                    └──────┬───────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ↓               ↓               ↓
      ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
      │ Academy     │ │ Tutor        │ │ Student      │
      │ (owns)      │ │ (extends)    │ │ (extends)    │
      └──────┬──────┘ └──────────────┘ └──────────────┘
             │
      ┌──────┴──────────────────┐
      │                         │
      ↓                         ↓
  ┌────────────┐      ┌────────────────────┐
  │ Level      │      │ AcademyMembership  │
  │ (part of)  │      │ (member of)        │
  └─────┬──────┘      └────────────────────┘
        │
        ↓
  ┌──────────────┐
  │ Subject      │
  │ (part of)    │
  └──────┬───────┘
         │
         ↓
  ┌──────────────────┐
  │ Class            │
  │ (offers)         │
  └────────┬─────────┘
           │
    ┌──────┴────────────────────────────┐
    │                                   │
    ↓                                   ↓
┌─────────────────────────┐    ┌────────────────────────┐
│ RegistrationRequest     │    │ Enrollment             │
│ (student requests)      │    │ (student enrolled in)  │
│ Status: PENDING→...     │    │ Active: ACTIVE/        │
│ PaymentStatus: NOT_PAID │    │ INACTIVE               │
└─────────────────────────┘    │ PaymentStatus: PAID/   │
                               │ PENDING/OVERDUE        │
                               └────────────────────────┘
```

## State Management Flow (MobX)

```
┌─────────────────────────────────────────┐
│    TutoringViewModel (MobX Observable)  │
├─────────────────────────────────────────┤
│                                         │
│  Observable State:                      │
│  ├─ academies: Academy[]               │
│  ├─ currentAcademy: Academy | null     │
│  ├─ levels: Level[]                    │
│  ├─ subjects: Subject[]                │
│  ├─ classes: Class[]                   │
│  ├─ registrationRequests: Request[]    │
│  ├─ studentEnrollments: Enrollment[]   │
│  ├─ searchResults: Academy[]           │
│  ├─ loading: boolean                   │
│  ├─ error: string | null               │
│  └─ successMessage: string | null      │
│                                         │
│  Observable Methods (40+):              │
│  ├─ createAcademy(...)                 │
│  ├─ loadMyAcademies(...)               │
│  ├─ updateAcademy(...)                 │
│  ├─ ... (and 35+ more)                 │
│  └─ clearError()                       │
│                                         │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ↓                    ↓
    ┌─────────┐         ┌──────────┐
    │ Component│         │ Database │
    │ (observer)        │ (Supabase)
    │ Re-renders        │ Persists  │
    │ on state change   │ Data     │
    └─────────┘         └──────────┘
```

## User Journey Maps

### Tutor Journey
```
Sign Up as Tutor
    ↓
Create Academy
    ↓
Add Levels/Grades to Academy
    ↓
Add Subjects/Modules to Levels
    ↓
Create Classes for Subjects
    ↓
View Student Registration Requests
    ↓
Approve/Reject Requests
    ↓
Monitor Student Enrollments
    ↓
View Academy Analytics & Statistics
```

### Student Journey
```
Sign Up as Student
    ↓
Browse/Search Academies
    ↓
View Academy Profile & Levels
    ↓
Explore Subjects & Classes
    ↓
Check Class Details & Availability
    ↓
Request Registration for Class
    ↓
Wait for Academy Approval
    ↓
Complete Payment (once approved)
    ↓
View Enrollment Status
    ↓
Attend Class / Manage Enrollment
    ↓
Drop Class or Wait for Renewal
```

## Integration Checklist

```
□ Database Setup
  □ Run Prisma migrations
  □ Verify 7 tables created
  □ Check schema matches

□ Domain Layer
  □ Import tutoring.ts entities
  □ Verify all interfaces available

□ Data Access
  □ Initialize SupabaseTutoringRepository
  □ Test connection

□ Application Logic
  □ Create TutoringViewModel instance
  □ Test basic methods

□ UI Integration
  □ Add TutoringMenu to navigation
  □ Implement tutor screens
  □ Implement student screens
  □ Wire up navigation

□ Testing
  □ Test tutor flow (create → manage)
  □ Test student flow (search → register)
  □ Test approval workflow
  □ Test error scenarios

□ Polish
  □ Customize styling
  □ Add your branding
  □ Test on target devices
  □ Deploy!
```

---

This completes the visual architecture overview. For detailed documentation, see the accompanying guides.
