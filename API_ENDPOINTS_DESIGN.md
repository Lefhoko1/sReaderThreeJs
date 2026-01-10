# Role-Based User System: API Endpoints Design

This document outlines recommended API endpoints for the role-based user system.

---

## Overview

The API is organized by resource type with role-based access control (RBAC).

---

## Base URL

```
/api/v1
```

---

## Authentication

All endpoints require authentication via:
- Bearer token in `Authorization` header
- Supabase session from auth client

```
Authorization: Bearer <supabase_jwt_token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation completed"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": { /* optional debugging info */ }
}
```

---

## User Endpoints

### Get User Profile
```
GET /api/v1/users/:userId
```

**Response:**
```json
{
  "id": "uuid",
  "displayName": "John Doe",
  "email": "john@example.com",
  "roles": ["STUDENT"],
  "profile": { /* profile data */ },
  "student": { /* if student */ },
  "guardian": { /* if guardian */ },
  "tutor": { /* if tutor */ }
}
```

**Access:** Own data or admin

---

### Update User Profile
```
PATCH /api/v1/users/:userId
```

**Request:**
```json
{
  "displayName": "Jane Doe",
  "avatarUrl": "https://..."
}
```

**Access:** Own data only

---

### Get Current User
```
GET /api/v1/users/me
```

**Response:** Same as get user profile

**Access:** Authenticated user

---

## Student Endpoints

### Get Student Profile
```
GET /api/v1/students/:studentId
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "gradeLevel": "10th Grade",
  "schoolName": "Central High",
  "dateOfBirth": "2008-05-15",
  "user": { /* basic user info */ },
  "guardians": [
    {
      "guardianId": "uuid",
      "relationship": "PARENT",
      "user": { /* guardian user info */ }
    }
  ]
}
```

**Access:** Own data, guardians, or admin

---

### Update Student Profile
```
PATCH /api/v1/students/:studentId
```

**Request:**
```json
{
  "gradeLevel": "11th Grade",
  "schoolName": "Central High"
}
```

**Access:** Own data or admin

---

### Get Student's Guardians
```
GET /api/v1/students/:studentId/guardians
```

**Response:**
```json
{
  "guardians": [
    {
      "id": "uuid",
      "displayName": "John Doe",
      "relationship": "PARENT",
      "email": "john@example.com"
    }
  ]
}
```

**Access:** Student, their guardians, or admin

---

### Get Student's Assignments
```
GET /api/v1/students/:studentId/assignments
```

**Query Params:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `status`: PENDING|IN_PROGRESS|COMPLETED|OVERDUE

**Response:**
```json
{
  "assignments": [ /* assignment list */ ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

**Access:** Own data, guardians, or admin

---

## Guardian Endpoints

### Get Guardian Profile
```
GET /api/v1/guardians/:guardianId
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "relationshipToStudent": "PARENT",
  "occupation": "Software Engineer",
  "user": { /* basic user info */ },
  "students": [
    {
      "studentId": "uuid",
      "relationship": "PARENT",
      "user": { /* student user info */ }
    }
  ]
}
```

**Access:** Own data, managed students, or admin

---

### Update Guardian Profile
```
PATCH /api/v1/guardians/:guardianId
```

**Request:**
```json
{
  "relationshipToStudent": "GRANDPARENT",
  "occupation": "Retired"
}
```

**Access:** Own data or admin

---

### Get Guardian's Students
```
GET /api/v1/guardians/:guardianId/students
```

**Response:**
```json
{
  "students": [
    {
      "id": "uuid",
      "displayName": "Jane Doe",
      "relationship": "PARENT",
      "gradeLevel": "10th Grade"
    }
  ]
}
```

**Access:** Own data or admin

---

### Link Student to Guardian
```
POST /api/v1/guardians/:guardianId/students
```

**Request:**
```json
{
  "studentId": "uuid",
  "relationship": "PARENT"
}
```

**Response:**
```json
{
  "guardianId": "uuid",
  "studentId": "uuid",
  "relationship": "PARENT"
}
```

**Note:** Might require student acceptance or admin verification

**Access:** Guardian or admin

---

### Unlink Student from Guardian
```
DELETE /api/v1/guardians/:guardianId/students/:studentId
```

**Response:** 204 No Content

**Access:** Guardian, student, or admin

---

### Get Student's Progress
```
GET /api/v1/guardians/:guardianId/students/:studentId/progress
```

**Response:**
```json
{
  "studentId": "uuid",
  "totalAssignments": 25,
  "completedAssignments": 18,
  "averageScore": 85.5,
  "streakDays": 7,
  "recentAttempts": [
    {
      "assignmentId": "uuid",
      "title": "Math Quiz",
      "score": 90,
      "submittedAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

**Access:** Guardian, student, or admin

---

## Tutor Endpoints

### Get Tutor Profile
```
GET /api/v1/tutors/:tutorId
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "bio": "Experienced math tutor...",
  "specializations": ["Mathematics", "Physics"],
  "educationLevel": "MASTER",
  "yearsOfExperience": 5,
  "hourlyRate": 50.00,
  "isVerified": true,
  "verificationDate": "2023-06-15",
  "user": { /* basic user info */ },
  "academies": [ /* list of academies */ ]
}
```

**Access:** Public (limited), own data, or admin

---

### Update Tutor Profile
```
PATCH /api/v1/tutors/:tutorId
```

**Request:**
```json
{
  "bio": "Updated bio...",
  "specializations": ["Mathematics", "Physics", "Chemistry"],
  "hourlyRate": 55.00
}
```

**Note:** Cannot change verification status (admin only)

**Access:** Own data or admin

---

### Get Tutor's Academies
```
GET /api/v1/tutors/:tutorId/academies
```

**Response:**
```json
{
  "academies": [
    {
      "id": "uuid",
      "name": "Math Academy",
      "type": "TUTORING",
      "role": "INSTRUCTOR"
    }
  ]
}
```

**Access:** Tutor, academy members, or admin

---

### Join Academy
```
POST /api/v1/tutors/:tutorId/academies
```

**Request:**
```json
{
  "academyId": "uuid",
  "role": "INSTRUCTOR"
}
```

**Note:** Might require academy admin approval

**Response:**
```json
{
  "tutorId": "uuid",
  "academyId": "uuid",
  "role": "INSTRUCTOR",
  "joinedAt": "2024-01-10T10:30:00Z"
}
```

**Access:** Tutor or admin

---

### Leave Academy
```
DELETE /api/v1/tutors/:tutorId/academies/:academyId
```

**Response:** 204 No Content

**Access:** Tutor or academy admin

---

### Request Verification
```
POST /api/v1/tutors/:tutorId/request-verification
```

**Request:**
```json
{
  "certifications": ["https://..."],
  "references": ["name@email.com"]
}
```

**Response:**
```json
{
  "verificationStatus": "PENDING",
  "submittedAt": "2024-01-10T10:30:00Z"
}
```

**Access:** Tutor (unverified)

---

### List Tutors (Public)
```
GET /api/v1/tutors
```

**Query Params:**
- `specialization`: filter by subject
- `minRating`: minimum rating
- `isVerified`: true/false
- `page`: number
- `limit`: number

**Response:**
```json
{
  "tutors": [
    {
      "id": "uuid",
      "displayName": "John Tutor",
      "specializations": ["Math"],
      "hourlyRate": 50,
      "isVerified": true,
      "rating": 4.8
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

**Access:** Public

---

## Academy (Organization) Endpoints

### Get Academy Details
```
GET /api/v1/academies/:academyId
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Math Academy",
  "type": "TUTORING",
  "tutors": [ /* list of tutors */ ],
  "classes": [ /* list of classes */ ],
  "createdAt": "2023-01-01"
}
```

**Access:** Public, academy members, or admin

---

### Get Academy's Tutors
```
GET /api/v1/academies/:academyId/tutors
```

**Response:**
```json
{
  "tutors": [
    {
      "id": "uuid",
      "displayName": "John Tutor",
      "role": "INSTRUCTOR",
      "joinedAt": "2023-01-01"
    }
  ]
}
```

**Access:** Academy members or admin

---

### Get Academy's Classes
```
GET /api/v1/academies/:academyId/classes
```

**Response:**
```json
{
  "classes": [
    {
      "id": "uuid",
      "name": "Algebra 101",
      "gradeLevel": "9th Grade",
      "studentCount": 25
    }
  ]
}
```

**Access:** Academy members or admin

---

## Search & Discovery Endpoints

### Search Tutors
```
GET /api/v1/search/tutors
```

**Query Params:**
- `q`: search query (name or specialization)
- `specialization`: exact specialization
- `location`: nearby (if location data available)
- `page`: number

**Response:** List of matching tutors

**Access:** Public

---

### Search Academies
```
GET /api/v1/search/academies
```

**Query Params:**
- `q`: search query (academy name)
- `type`: SCHOOL|TUTORING|HOMESCHOOL
- `location`: nearby
- `page`: number

**Response:** List of matching academies

**Access:** Public

---

## Administrative Endpoints

### Verify Tutor
```
PATCH /api/v1/admin/tutors/:tutorId/verify
```

**Request:**
```json
{
  "verified": true,
  "notes": "Credentials verified"
}
```

**Access:** Admin only

---

### Ban User
```
PATCH /api/v1/admin/users/:userId/ban
```

**Request:**
```json
{
  "banned": true,
  "reason": "Violation of ToS"
}
```

**Access:** Admin only

---

### Get Admin Dashboard Stats
```
GET /api/v1/admin/stats
```

**Response:**
```json
{
  "totalUsers": 1000,
  "usersByRole": {
    "STUDENT": 600,
    "GUARDIAN": 250,
    "TUTOR": 150
  },
  "verifiedTutors": 120,
  "academies": 45,
  "activeClasses": 120
}
```

**Access:** Admin only

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 500 requests/minute
- **Admin endpoints**: 1000 requests/minute

---

## Pagination

All list endpoints support pagination:

**Query Params:**
- `page`: 1-indexed (default: 1)
- `limit`: 1-100 (default: 20)
- `sort`: field name (default: created_at)
- `order`: asc|desc (default: desc)

**Response includes:**
```json
{
  "items": [ /* paginated items */ ],
  "total": 500,
  "page": 2,
  "limit": 20,
  "totalPages": 25
}
```

---

## Filtering Examples

### Get assignments for student
```
GET /api/v1/students/:studentId/assignments?status=PENDING&sort=due_at&order=asc
```

### Get verified tutors by subject
```
GET /api/v1/tutors?specialization=Mathematics&isVerified=true&limit=50
```

### Get guardians' students progress
```
GET /api/v1/guardians/:guardianId/students?page=1&sort=name&order=asc
```

---

## Implementation Notes

1. **Version the API** (`/api/v1/`) for backward compatibility
2. **Use JWT tokens** from Supabase Auth
3. **Implement RBAC** using `user.roles` array
4. **Cache public data** (tutors list, academies list)
5. **Log all admin actions** for audit trail
6. **Use soft deletes** for sensitive records
7. **Validate role before operations**
8. **Return paginated responses** for lists

---

## SDK Examples

### TypeScript/JavaScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Get student profile
const { data: student } = await supabase
  .from('students')
  .select('*, user:users(*), guardians:guardian_students(*)')
  .eq('id', studentId)
  .single();

// Update tutor
const { data: updated } = await supabase
  .from('tutors')
  .update({ bio: 'New bio' })
  .eq('id', tutorId)
  .select()
  .single();
```

### React Example
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Get tutor profile
const { data: tutor } = useQuery({
  queryKey: ['tutor', tutorId],
  queryFn: () => fetchTutorProfile(tutorId),
});

// Update tutor
const { mutate: updateTutor } = useMutation({
  mutationFn: (updates) => updateTutorProfile(tutorId, updates),
  onSuccess: () => queryClient.invalidateQueries(['tutor', tutorId]),
});
```

---

## Testing the API

### Setup
```bash
# Create test accounts for each role
curl -X POST https://api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "test123",
    "displayName": "Test Student",
    "role": "STUDENT"
  }'
```

### Test Guardian-Student Link
```bash
# Link student to guardian
curl -X POST https://api/v1/guardians/{guardianId}/students \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "uuid",
    "relationship": "PARENT"
  }'
```

### Test Access Control
```bash
# Try to access another user's data (should fail)
curl -X GET https://api/v1/students/{otherId} \
  -H "Authorization: Bearer {token}"
# Response: 403 Forbidden
```

---

## Future Enhancements

- [ ] Real-time notifications
- [ ] File uploads (certificates, documents)
- [ ] Ratings and reviews
- [ ] Payment/subscription endpoints
- [ ] Messaging/chat endpoints
- [ ] Video call integration
- [ ] Analytics endpoints
- [ ] Export reports functionality
