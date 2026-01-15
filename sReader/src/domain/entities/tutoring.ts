/**
 * Tutoring System Domain Entities
 * Models for managing tutoring academies, levels, subjects, classes, and student enrollments
 */

import { ID } from '../../shared/types';

/**
 * TutoringAcademy - Represents a tutoring business
 */
export interface TutoringAcademy {
  id: ID;
  ownerId: ID; // User ID of the tutor/owner
  name: string;
  description?: string;
  logoUrl?: string;
  location?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TutoringLevel - Represents a level/grade in an academy
 * E.g., "High School", "Grade 10", "A-Levels", "University Prep"
 */
export interface TutoringLevel {
  id: ID;
  academyId: ID;
  name: string;
  code: string; // Unique within academy (e.g., "HS", "G10", "AL")
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TutoringSubject - Represents a subject/module offered at a level
 * E.g., "Mathematics", "English Literature", "Physics"
 * Students enroll directly in subjects without needing a separate class entity
 */
export interface TutoringSubject {
  id: ID;
  academyId: ID;
  levelId: ID;
  name: string;
  code: string; // Unique within academy+level
  description?: string;
  creditHours?: number;
  costPerMonth?: number;
  costPerTerm?: number;
  costPerYear?: number;
  capacity?: number; // Max number of students
  instructorId?: ID; // User ID of the tutor/instructor
  schedule?: ClassSchedule; // Days, times, timezone
  location?: string;
  platform?: 'IN_PERSON' | 'ONLINE' | 'HYBRID'; // Default: ONLINE
  syllabusUrl?: string;
  prerequisites?: string;
  learningOutcomes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ClassSchedule - Details about when a class meets
 */
export interface ClassSchedule {
  days: string[]; // ['MON', 'WED', 'FRI']
  startTime: string; // "10:00"
  endTime: string; // "11:30"
  duration?: number; // minutes
  timezone: string; // "UTC", "Africa/Johannesburg", etc.
  startDate?: Date;
  endDate?: Date;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'; // Default: WEEKLY
}

/**
 * AcademyMembership - Represents membership of a tutor/admin in an academy
 */
export interface AcademyMembership {
  id: ID;
  academyId: ID;
  userId: ID;
  role: 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'ASSISTANT';
  joinedAt: Date;
}

/**
 * StudentRegistrationRequest - Request from student to enroll in a subject
 */
export interface StudentRegistrationRequest {
  id: ID;
  studentId: ID;
  academyId: ID;
  levelId: ID;
  subjectId: ID; // Now required - students enroll in subjects, not classes
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  requestedAt: Date;
  respondedAt?: Date;
  respondedBy?: ID; // User ID of tutor/admin who responded
  rejectionReason?: string;
  paymentStatus: 'NOT_PAID' | 'PENDING' | 'PAID';
  enrollmentStartDate?: Date;
  enrollmentEndDate?: Date;
  costTerm?: 'MONTHLY' | 'TERMLY' | 'YEARLY';
  costAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * StudentSubjectEnrollment - Represents a student actively enrolled in a subject
 */
export interface StudentSubjectEnrollment {
  id: ID;
  studentId: ID;
  academyId: ID;
  levelId: ID;
  subjectId: ID;
  enrolledAt: Date;
  enrollmentEndDate?: Date;
  paymentStatus: 'PENDING' | 'PAID' | 'OVERDUE';
  costPaid: number;
  costTerm: 'MONTHLY' | 'TERMLY' | 'YEARLY';
  isActive: boolean;
  lastPaymentDate?: Date;
  nextPaymentDueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SubjectWithRelations - Enriched subject data with related entities
 */
export interface SubjectWithRelations extends TutoringSubject {
  academy?: TutoringAcademy;
  level?: TutoringLevel;
  instructor?: {
    id: ID;
    displayName: string;
    avatarUrl?: string;
  };
  enrollmentCount?: number;
  availableSeats?: number;
}

/**
 * StudentSearchResult - Result of searching for academies/levels/subjects
 */
export interface StudentSearchResult {
  id: ID;
  type: 'ACADEMY' | 'LEVEL' | 'SUBJECT';
  academy: TutoringAcademy;
  level?: TutoringLevel;
  subject?: TutoringSubject;
  matchScore?: number;
}

/**
 * AcademyStats - Statistics for an academy
 */
export interface AcademyStats {
  totalLevels: number;
  totalSubjects: number;
  totalEnrolledStudents: number;
  totalRevenue: number;
  averageRating?: number;
}

/**
 * EnrollmentSummary - Summary of a student's enrollments
 */
export interface EnrollmentSummary {
  id: ID;
  studentId: ID;
  academy: TutoringAcademy;
  level: TutoringLevel;
  subject: TutoringSubject;
  enrolledAt: Date;
  enrollmentEndDate?: Date;
  nextPaymentDue?: Date;
  costOutstanding?: number;
  status: 'ACTIVE' | 'PENDING_PAYMENT' | 'INACTIVE';
}
