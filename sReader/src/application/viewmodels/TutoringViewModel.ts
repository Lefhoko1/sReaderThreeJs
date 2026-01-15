/**
 * TutoringViewModel
 * Main coordinator for all tutoring system operations
 * Manages academies, levels, subjects, classes, and enrollments
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { Result, ok, err } from '../../shared/result';
import {
  TutoringAcademy,
  TutoringLevel,
  TutoringSubject,
  StudentRegistrationRequest,
  StudentSubjectEnrollment,
  ClassSchedule,
  AcademyMembership,
} from '../../domain/entities/tutoring';
import { ITutoringAcademyRepository } from '../../data/repositories/ITutoringRepository';
import { ID } from '../../shared/types';

export class TutoringViewModel {
  // Academy Management State
  academies: TutoringAcademy[] = [];
  currentAcademy: TutoringAcademy | null = null;
  
  // Level Management State
  levels: TutoringLevel[] = [];
  currentLevel: TutoringLevel | null = null;
  
  // Subject Management State
  subjects: TutoringSubject[] = [];
  currentSubject: TutoringSubject | null = null;
  
  // Academy Members State
  currentAcademyTutors: AcademyMembership[] = [];
  
  // Registration & Enrollment State
  registrationRequests: StudentRegistrationRequest[] = [];
  studentEnrollments: StudentSubjectEnrollment[] = [];
  
  // Search Results
  searchResults: TutoringAcademy[] = [];
  
  // UI State
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private tutoringRepo: ITutoringAcademyRepository) {
    makeAutoObservable(this);
  }

  // ============================================
  // ACADEMY MANAGEMENT - TUTOR
  // ============================================

  async createAcademy(
    ownerId: ID,
    data: {
      name: string;
      description?: string;
      logoUrl?: string;
      location?: string;
      phone?: string;
      email?: string;
      websiteUrl?: string;
    }
  ): Promise<Result<TutoringAcademy>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.createAcademy({
        ownerId,
        ...data,
      });

      runInAction(() => {
        if (result.ok) {
          this.academies.push(result.value);
          this.currentAcademy = result.value;
          this.successMessage = 'Academy created successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async loadMyAcademies(userId: ID): Promise<Result<TutoringAcademy[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getAcademiesOwnedByUser(userId);

      runInAction(() => {
        if (result.ok) {
          this.academies = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async loadAcademyById(academyId: ID): Promise<Result<TutoringAcademy>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getAcademyById(academyId);

      runInAction(() => {
        if (result.ok && result.value) {
          this.currentAcademy = result.value;
        } else {
          this.error = 'Academy not found';
        }
        this.loading = false;
      });

      return result as Result<TutoringAcademy>;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async updateAcademy(
    academyId: ID,
    data: Partial<TutoringAcademy>
  ): Promise<Result<TutoringAcademy>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.updateAcademy(academyId, data);

      runInAction(() => {
        if (result.ok) {
          const index = this.academies.findIndex(a => a.id === academyId);
          if (index !== -1) {
            this.academies[index] = result.value;
          }
          if (this.currentAcademy?.id === academyId) {
            this.currentAcademy = result.value;
          }
          this.successMessage = 'Academy updated successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async deleteAcademy(academyId: ID): Promise<Result<boolean>> {
    this.loading = true;
    this.error = null;

    try {
      console.log('[ViewModel] Deleting academy:', academyId);
      const result = await this.tutoringRepo.deleteAcademy(academyId);
      console.log('[ViewModel] Delete result:', result);

      runInAction(() => {
        if (result.ok) {
          console.log('[ViewModel] Delete was successful, filtering out academy from list');
          this.academies = this.academies.filter(a => a.id !== academyId);
          if (this.currentAcademy?.id === academyId) {
            this.currentAcademy = null;
          }
          this.successMessage = 'Academy deleted successfully';
        } else {
          console.log('[ViewModel] Delete failed:', result.error);
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      console.error('[ViewModel] Delete exception:', error);
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  // ============================================
  // LEVEL MANAGEMENT - TUTOR
  // ============================================

  async createLevel(
    academyId: ID,
    data: {
      name: string;
      code: string;
      description?: string;
    }
  ): Promise<Result<TutoringLevel>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.createLevel(academyId, data);

      runInAction(() => {
        if (result.ok) {
          this.levels.push(result.value);
          this.successMessage = 'Level created successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async loadLevelsByAcademyId(academyId: ID): Promise<Result<TutoringLevel[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getLevelsByAcademyId(academyId);

      runInAction(() => {
        if (result.ok) {
          this.levels = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async updateLevel(levelId: ID, data: Partial<TutoringLevel>): Promise<Result<TutoringLevel>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.updateLevel(levelId, data);

      runInAction(() => {
        if (result.ok) {
          const index = this.levels.findIndex(l => l.id === levelId);
          if (index !== -1) {
            this.levels[index] = result.value;
          }
          if (this.currentLevel?.id === levelId) {
            this.currentLevel = result.value;
          }
          this.successMessage = 'Level updated successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async deleteLevel(levelId: ID): Promise<Result<boolean>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.deleteLevel(levelId);

      runInAction(() => {
        if (result.ok) {
          this.levels = this.levels.filter(l => l.id !== levelId);
          if (this.currentLevel?.id === levelId) {
            this.currentLevel = null;
          }
          this.successMessage = 'Level deleted successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  // ============================================
  // SUBJECT/MODULE MANAGEMENT - TUTOR
  // ============================================

  async createSubject(
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
  ): Promise<Result<TutoringSubject>> {
    console.log('[TutoringViewModel.createSubject] Starting subject creation', {
      academyId,
      levelId,
      name: data.name,
      code: data.code,
    });
    
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.createSubject(academyId, levelId, data);

      console.log('[TutoringViewModel.createSubject] Repository result:', {
        ok: result.ok,
        error: result.ok ? null : (result as any).error,
        value: result.ok ? (result as any).value : null,
      });

      runInAction(() => {
        if (result.ok) {
          const createdSubject = (result as any).value;
          console.log('[TutoringViewModel.createSubject] Adding subject to viewModel:', createdSubject);
          this.subjects.push(createdSubject);
          this.successMessage = 'Subject created successfully';
          console.log('[TutoringViewModel.createSubject] Subjects array now has', this.subjects.length, 'items');
        } else {
          this.error = (result as any).error;
          console.error('[TutoringViewModel.createSubject] Error:', this.error);
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      console.error('[TutoringViewModel.createSubject] Exception:', error);
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async loadSubjectsByLevelId(levelId: ID): Promise<Result<TutoringSubject[]>> {
    console.log('[TutoringViewModel.loadSubjectsByLevelId] Loading subjects for level:', levelId);
    
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getSubjectsByLevelId(levelId);

      console.log('[TutoringViewModel.loadSubjectsByLevelId] Repository result:', {
        ok: result.ok,
        count: result.ok ? (result as any).value.length : 0,
        error: result.ok ? null : (result as any).error,
      });

      runInAction(() => {
        if (result.ok) {
          this.subjects = (result as any).value;
          console.log('[TutoringViewModel.loadSubjectsByLevelId] Subjects loaded:', this.subjects.length, 'items');
          this.subjects.forEach((s) => console.log('  - Subject:', s.id, s.name, 'for level:', s.levelId, 'academy:', s.academyId));
        } else {
          this.error = (result as any).error;
          console.error('[TutoringViewModel.loadSubjectsByLevelId] Error:', this.error);
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      console.error('[TutoringViewModel.loadSubjectsByLevelId] Exception:', error);
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async updateSubject(subjectId: ID, data: Partial<TutoringSubject>): Promise<Result<TutoringSubject>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.updateSubject(subjectId, data);

      runInAction(() => {
        if (result.ok) {
          const index = this.subjects.findIndex(s => s.id === subjectId);
          if (index !== -1) {
            this.subjects[index] = result.value;
          }
          if (this.currentSubject?.id === subjectId) {
            this.currentSubject = result.value;
          }
          this.successMessage = 'Subject updated successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async deleteSubject(subjectId: ID): Promise<Result<boolean>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.deleteSubject(subjectId);

      runInAction(() => {
        if (result.ok) {
          this.subjects = this.subjects.filter(s => s.id !== subjectId);
          if (this.currentSubject?.id === subjectId) {
            this.currentSubject = null;
          }
          this.successMessage = 'Subject deleted successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  // ============================================
  // ============================================
  // CLASS MANAGEMENT - REMOVED (Using Subjects Instead)
  // Classes have been replaced with direct Subject enrollment
  // ============================================

  // ============================================
  // REGISTRATION REQUEST MANAGEMENT - TUTOR
  // ============================================

  async loadPendingRegistrationRequests(academyId: ID): Promise<Result<StudentRegistrationRequest[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getPendingRegistrationRequestsForAcademy(academyId);

      runInAction(() => {
        if (result.ok) {
          this.registrationRequests = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async approveRegistrationRequest(
    requestId: ID,
    respondedBy: ID,
    enrollmentStartDate: Date,
    enrollmentEndDate?: Date
  ): Promise<Result<StudentRegistrationRequest>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.approveRegistrationRequest(
        requestId,
        respondedBy,
        enrollmentStartDate,
        enrollmentEndDate
      );

      runInAction(() => {
        if (result.ok) {
          const index = this.registrationRequests.findIndex(r => r.id === requestId);
          if (index !== -1) {
            this.registrationRequests[index] = result.value;
          }
          this.successMessage = 'Registration approved successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async rejectRegistrationRequest(
    requestId: ID,
    respondedBy: ID,
    reason: string
  ): Promise<Result<StudentRegistrationRequest>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.rejectRegistrationRequest(
        requestId,
        respondedBy,
        reason
      );

      runInAction(() => {
        if (result.ok) {
          const index = this.registrationRequests.findIndex(r => r.id === requestId);
          if (index !== -1) {
            this.registrationRequests[index] = result.value;
          }
          this.successMessage = 'Registration rejected successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  // ============================================
  // STUDENT REGISTRATION - STUDENT
  // ============================================

  async createRegistrationRequest(
    studentId: ID,
    classId: ID,
    data: {
      academyId: ID;
      levelId: ID;
      subjectId?: ID;
      costTerm?: 'MONTHLY' | 'TERMLY' | 'YEARLY';
      costAmount?: number;
    }
  ): Promise<Result<StudentRegistrationRequest>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.createRegistrationRequest(
        studentId,
        classId,
        data
      );

      runInAction(() => {
        if (result.ok) {
          this.registrationRequests.push(result.value);
          this.successMessage = 'Registration request sent successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async loadMyRegistrationRequests(studentId: ID): Promise<Result<StudentRegistrationRequest[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getRegistrationRequestsForStudent(studentId);

      runInAction(() => {
        if (result.ok) {
          this.registrationRequests = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async withdrawRegistrationRequest(requestId: ID): Promise<Result<StudentRegistrationRequest>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.withdrawRegistrationRequest(requestId);

      runInAction(() => {
        if (result.ok) {
          const index = this.registrationRequests.findIndex(r => r.id === requestId);
          if (index !== -1) {
            this.registrationRequests[index] = result.value;
          }
          this.successMessage = 'Registration withdrawn successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  // ============================================
  // ENROLLMENT MANAGEMENT - STUDENT
  // ============================================

  async loadMyEnrollments(studentId: ID): Promise<Result<StudentSubjectEnrollment[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getEnrollmentsForStudent(studentId);

      runInAction(() => {
        if (result.ok) {
          this.studentEnrollments = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async removeStudentFromClass(enrollmentId: ID): Promise<Result<boolean>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.removeStudentFromSubject(enrollmentId);

      runInAction(() => {
        if (result.ok) {
          this.studentEnrollments = this.studentEnrollments.filter(e => e.id !== enrollmentId);
          this.successMessage = 'Enrollment removed successfully';
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  // ============================================
  // SEARCH & DISCOVERY - STUDENT
  // ============================================

  async searchAcademies(query: string, limit?: number): Promise<Result<TutoringAcademy[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.searchAcademies(query, limit, 0);

      runInAction(() => {
        if (result.ok) {
          this.searchResults = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async loadAllAcademies(): Promise<Result<TutoringAcademy[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getAllAcademies(50, 0);

      runInAction(() => {
        if (result.ok) {
          this.academies = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async getAcademyStats(academyId: ID): Promise<Result<{
    totalLevels: number;
    totalSubjects: number;
    totalEnrolledStudents: number;
  }>> {
    try {
      return await this.tutoringRepo.getAcademyStats(academyId);
    } catch (error: any) {
      return err(error.message);
    }
  }

  // ============================================
  // ACADEMY DETAILS - STUDENT DISCOVERY
  // ============================================

  async getAcademyDetails(academyId: ID): Promise<Result<{
    academy: TutoringAcademy;
    levels: TutoringLevel[];
    subjects: TutoringSubject[];
  }>> {
    this.loading = true;
    this.error = null;

    try {
      // Fetch academy details
      const academyResult = await this.tutoringRepo.getAcademyById(academyId);
      if (!academyResult.ok) {
        throw new Error(academyResult.error);
      }

      const academy = academyResult.value as TutoringAcademy;

      // Fetch levels
      const levelsResult = await this.tutoringRepo.getLevelsByAcademyId(academyId);
      const levels = levelsResult.ok ? levelsResult.value : [];

      // Fetch subjects
      const subjectsResult = await this.tutoringRepo.getSubjectsByAcademyId(academyId);
      const subjects = subjectsResult.ok ? subjectsResult.value : [];

      runInAction(() => {
        this.currentAcademy = academy;
        this.levels = levels;
        this.subjects = subjects;
        this.loading = false;
      });

      return ok({
        academy,
        levels,
        subjects,
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  async getAcademyTutors(academyId: ID): Promise<Result<AcademyMembership[]>> {
    try {
      // Get academy members with instructor role
      const result = await this.tutoringRepo.getMembersOfAcademy(academyId);
      if (result.ok) {
        runInAction(() => {
          this.currentAcademyTutors = result.value.filter((m: AcademyMembership) => m.role === 'INSTRUCTOR' || m.role === 'ASSISTANT');
        });
      }
      return result;
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getSubjectsByLevel(levelId: ID): Promise<Result<TutoringSubject[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.tutoringRepo.getSubjectsByLevelId(levelId);

      runInAction(() => {
        if (result.ok) {
          this.subjects = result.value;
        } else {
          this.error = result.error;
        }
        this.loading = false;
      });

      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return err(error.message);
    }
  }

  // ============================================
  // UI STATE HELPERS
  // ============================================

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.successMessage = null;
  }

  selectAcademy(academy: TutoringAcademy | null): void {
    this.currentAcademy = academy;
  }

  selectLevel(level: TutoringLevel | null): void {
    this.currentLevel = level;
  }

  selectSubject(subject: TutoringSubject | null): void {
    this.currentSubject = subject;
  }
}
