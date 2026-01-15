/**
 * ITutoringAcademyRepository
 * Repository interface for managing tutoring academies
 */

import { ID } from '../../shared/types';
import { Result } from '../../shared/result';
import {
  TutoringAcademy,
  TutoringLevel,
  TutoringSubject,
  AcademyMembership,
  StudentRegistrationRequest,
  StudentSubjectEnrollment,
  ClassSchedule,
} from '../../domain/entities/tutoring';

export interface ITutoringAcademyRepository {
  // Academy CRUD
  createAcademy(data: {
    ownerId: ID;
    name: string;
    description?: string;
    logoUrl?: string;
    location?: string;
    phone?: string;
    email?: string;
    websiteUrl?: string;
  }): Promise<Result<TutoringAcademy>>;

  getAcademyById(academyId: ID): Promise<Result<TutoringAcademy | null>>;
  getAcademiesOwnedByUser(userId: ID): Promise<Result<TutoringAcademy[]>>;
  getAllAcademies(limit?: number, offset?: number): Promise<Result<TutoringAcademy[]>>;
  
  updateAcademy(
    academyId: ID,
    data: Partial<TutoringAcademy>
  ): Promise<Result<TutoringAcademy>>;

  deleteAcademy(academyId: ID): Promise<Result<boolean>>;

  // Level CRUD
  createLevel(
    academyId: ID,
    data: {
      name: string;
      code: string;
      description?: string;
    }
  ): Promise<Result<TutoringLevel>>;

  getLevelById(levelId: ID): Promise<Result<TutoringLevel | null>>;
  getLevelsByAcademyId(academyId: ID): Promise<Result<TutoringLevel[]>>;
  
  updateLevel(
    levelId: ID,
    data: Partial<TutoringLevel>
  ): Promise<Result<TutoringLevel>>;

  deleteLevel(levelId: ID): Promise<Result<boolean>>;

  // Subject CRUD
  createSubject(
    academyId: ID,
    levelId: ID,
    data: {
      name: string;
      code: string;
      description?: string;
      creditHours?: number;
      costPerMonth?: number;
      costPerTerm?: number;
      costPerYear?: number;
      capacity?: number;
      syllabusUrl?: string;
      prerequisites?: string;
      learningOutcomes?: string;
    }
  ): Promise<Result<TutoringSubject>>;

  getSubjectById(subjectId: ID): Promise<Result<TutoringSubject | null>>;
  getSubjectsByLevelId(levelId: ID): Promise<Result<TutoringSubject[]>>;
  getSubjectsByAcademyId(academyId: ID): Promise<Result<TutoringSubject[]>>;
  
  updateSubject(
    subjectId: ID,
    data: Partial<TutoringSubject>
  ): Promise<Result<TutoringSubject>>;

  deleteSubject(subjectId: ID): Promise<Result<boolean>>;

  // Class CRUD
  createClass(
    academyId: ID,
    levelId: ID,
    subjectId: ID,
    instructorId: ID,
    data: {
      name: string;
      code: string;
      description?: string;
      capacity?: number;
      schedule?: ClassSchedule;
      location?: string;
      platform?: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
      costPerMonth?: number;
      costPerTerm?: number;
      costPerYear?: number;
    }
  ): Promise<Result<any>>; // Classes removed - use subjects instead

  // Academy Membership
  addMemberToAcademy(
    academyId: ID,
    userId: ID,
    role: 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'ASSISTANT'
  ): Promise<Result<AcademyMembership>>;

  getMembersOfAcademy(academyId: ID): Promise<Result<AcademyMembership[]>>;
  getAcademiesForUser(userId: ID): Promise<Result<AcademyMembership[]>>;
  
  removeMemberFromAcademy(academyId: ID, userId: ID): Promise<Result<boolean>>;
  updateMemberRole(
    academyId: ID,
    userId: ID,
    newRole: string
  ): Promise<Result<AcademyMembership>>;

  // Student Registration Requests
  createRegistrationRequest(
    studentId: ID,
    classId: ID,
    data: {
      academyId: ID;
      levelId: ID;
      subjectId?: ID;
      costTerm?: 'MONTHLY' | 'TERMLY' | 'YEARLY';
      costAmount?: number;
    }
  ): Promise<Result<StudentRegistrationRequest>>;

  getRegistrationRequestById(requestId: ID): Promise<Result<StudentRegistrationRequest | null>>;
  getRegistrationRequestsForStudent(studentId: ID): Promise<Result<StudentRegistrationRequest[]>>;
  getRegistrationRequestsForClass(classId: ID): Promise<Result<StudentRegistrationRequest[]>>;
  getPendingRegistrationRequestsForAcademy(academyId: ID): Promise<Result<StudentRegistrationRequest[]>>;
  
  approveRegistrationRequest(
    requestId: ID,
    respondedBy: ID,
    enrollmentStartDate: Date,
    enrollmentEndDate?: Date
  ): Promise<Result<StudentRegistrationRequest>>;

  rejectRegistrationRequest(
    requestId: ID,
    respondedBy: ID,
    reason: string
  ): Promise<Result<StudentRegistrationRequest>>;

  withdrawRegistrationRequest(requestId: ID): Promise<Result<StudentRegistrationRequest>>;

  // Student Enrollments
  getEnrollmentsForStudent(studentId: ID): Promise<Result<StudentSubjectEnrollment[]>>;

  enrollStudentInSubject(
    studentId: ID,
    subjectId: ID,
    registrationId?: ID
  ): Promise<Result<StudentSubjectEnrollment>>;

  updateEnrollmentPaymentStatus(
    enrollmentId: ID,
    paymentStatus: 'PENDING' | 'PAID' | 'OVERDUE'
  ): Promise<Result<StudentSubjectEnrollment>>;

  removeStudentFromSubject(enrollmentId: ID): Promise<Result<boolean>>;

  // Search & Discovery
  searchAcademies(
    query: string,
    limit?: number,
    offset?: number
  ): Promise<Result<TutoringAcademy[]>>;

  // Statistics
  getAcademyStats(academyId: ID): Promise<Result<{
    totalLevels: number;
    totalSubjects: number;
    totalEnrolledStudents: number;
  }>>;
}
