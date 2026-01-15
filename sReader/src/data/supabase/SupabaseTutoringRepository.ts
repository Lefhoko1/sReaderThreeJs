/**
 * SupabaseTutoringRepository
 * Supabase implementation of ITutoringRepository
 */

import { ID } from '../../shared/types';
import { Result, ok, err } from '../../shared/result';
import supabase from './supabaseClient';
import {
  TutoringAcademy,
  TutoringLevel,
  TutoringSubject,
  AcademyMembership,
  StudentRegistrationRequest,
  StudentSubjectEnrollment,
  ClassSchedule,
} from '../../domain/entities/tutoring';
import { ITutoringAcademyRepository } from '../repositories/ITutoringRepository';

export class SupabaseTutoringRepository implements ITutoringAcademyRepository {
  // ============================================
  // ACADEMY CRUD
  // ============================================

  async createAcademy(data: {
    ownerId: ID;
    name: string;
    description?: string;
    logoUrl?: string;
    location?: string;
    phone?: string;
    email?: string;
    websiteUrl?: string;
  }): Promise<Result<TutoringAcademy>> {
    try {
      const { data: academy, error } = await supabase
        .from('tutoring_academies')
        .insert([
          {
            owner_id: data.ownerId,
            name: data.name,
            description: data.description,
            logo_url: data.logoUrl,
            location: data.location,
            phone: data.phone,
            email: data.email,
            website_url: data.websiteUrl,
            is_verified: false,
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapAcademy(academy));
    } catch (error: any) {
      return err(error.message || 'Failed to create academy');
    }
  }

  async getAcademyById(academyId: ID): Promise<Result<TutoringAcademy | null>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_academies')
        .select()
        .eq('id', academyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return err(error.message);
      }

      return ok(data ? this.mapAcademy(data) : null);
    } catch (error: any) {
      return err(error.message || 'Failed to fetch academy');
    }
  }

  async getAcademiesOwnedByUser(userId: ID): Promise<Result<TutoringAcademy[]>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_academies')
        .select()
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((a: any) => this.mapAcademy(a)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch academies');
    }
  }

  async getAllAcademies(limit?: number, offset?: number): Promise<Result<TutoringAcademy[]>> {
    try {
      let query = supabase.from('tutoring_academies').select();

      if (limit) {
        query = query.range(offset || 0, (offset || 0) + limit - 1);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((a: any) => this.mapAcademy(a)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch academies');
    }
  }

  async updateAcademy(academyId: ID, data: Partial<TutoringAcademy>): Promise<Result<TutoringAcademy>> {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.logoUrl) updateData.logo_url = data.logoUrl;
      if (data.location) updateData.location = data.location;
      if (data.phone) updateData.phone = data.phone;
      if (data.email) updateData.email = data.email;
      if (data.websiteUrl) updateData.website_url = data.websiteUrl;

      const { data: updated, error } = await supabase
        .from('tutoring_academies')
        .update(updateData)
        .eq('id', academyId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapAcademy(updated));
    } catch (error: any) {
      return err(error.message || 'Failed to update academy');
    }
  }

  async deleteAcademy(academyId: ID): Promise<Result<boolean>> {
    try {
      console.log('[Repository] Attempting to delete academy:', academyId);
      
      const { data, error } = await supabase
        .from('tutoring_academies')
        .delete()
        .eq('id', academyId)
        .select();

      console.log('[Repository] Delete response:', { data, error });

      if (error) {
        console.error('[Repository] Delete error:', error);
        return err(error.message);
      }

      console.log('[Repository] Delete successful');
      return ok(true);
    } catch (error: any) {
      console.error('[Repository] Delete exception:', error);
      return err(error.message || 'Failed to delete academy');
    }
  }

  // ============================================
  // LEVEL CRUD
  // ============================================

  async createLevel(
    academyId: ID,
    data: {
      name: string;
      code: string;
      description?: string;
    }
  ): Promise<Result<TutoringLevel>> {
    try {
      const { data: level, error } = await supabase
        .from('tutoring_levels')
        .insert([
          {
            academy_id: academyId,
            name: data.name,
            code: data.code,
            description: data.description,
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapLevel(level));
    } catch (error: any) {
      return err(error.message || 'Failed to create level');
    }
  }

  async getLevelById(levelId: ID): Promise<Result<TutoringLevel | null>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_levels')
        .select()
        .eq('id', levelId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return err(error.message);
      }

      return ok(data ? this.mapLevel(data) : null);
    } catch (error: any) {
      return err(error.message || 'Failed to fetch level');
    }
  }

  async getLevelsByAcademyId(academyId: ID): Promise<Result<TutoringLevel[]>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_levels')
        .select()
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((l: any) => this.mapLevel(l)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch levels');
    }
  }

  async updateLevel(levelId: ID, data: Partial<TutoringLevel>): Promise<Result<TutoringLevel>> {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.code) updateData.code = data.code;
      if (data.description) updateData.description = data.description;

      const { data: updated, error } = await supabase
        .from('tutoring_levels')
        .update(updateData)
        .eq('id', levelId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapLevel(updated));
    } catch (error: any) {
      return err(error.message || 'Failed to update level');
    }
  }

  async deleteLevel(levelId: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('tutoring_levels')
        .delete()
        .eq('id', levelId);

      if (error) {
        return err(error.message);
      }

      return ok(true);
    } catch (error: any) {
      return err(error.message || 'Failed to delete level');
    }
  }

  // ============================================
  // SUBJECT CRUD
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
    console.log('[SupabaseTutoringRepository.createSubject] Creating subject:', {
      academyId,
      levelId,
      name: data.name,
      code: data.code,
    });
    
    try {
      const insertData = {
        academy_id: academyId,
        level_id: levelId,
        name: data.name,
        code: data.code,
        description: data.description,
        credit_hours: data.creditHours,
        cost_per_month: data.costPerMonth,
        cost_per_term: data.costPerTerm,
        cost_per_year: data.costPerYear,
        capacity: data.capacity,
        syllabus_url: data.syllabusUrl,
        prerequisites: data.prerequisites,
        learning_outcomes: data.learningOutcomes,
      };
      
      console.log('[SupabaseTutoringRepository.createSubject] Insert data:', insertData);
      
      const { data: subject, error } = await supabase
        .from('tutoring_subjects')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('[SupabaseTutoringRepository.createSubject] Supabase error:', error);
        return err(error.message);
      }

      console.log('[SupabaseTutoringRepository.createSubject] Subject created successfully:', subject);
      return ok(this.mapSubject(subject));
    } catch (error: any) {
      console.error('[SupabaseTutoringRepository.createSubject] Exception:', error);
      return err(error.message || 'Failed to create subject');
    }
  }

  async getSubjectById(subjectId: ID): Promise<Result<TutoringSubject | null>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_subjects')
        .select()
        .eq('id', subjectId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return err(error.message);
      }

      return ok(data ? this.mapSubject(data) : null);
    } catch (error: any) {
      return err(error.message || 'Failed to fetch subject');
    }
  }

  async getSubjectsByLevelId(levelId: ID): Promise<Result<TutoringSubject[]>> {
    console.log('[SupabaseTutoringRepository.getSubjectsByLevelId] Fetching subjects for level:', levelId);
    
    try {
      const { data, error } = await supabase
        .from('tutoring_subjects')
        .select()
        .eq('level_id', levelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseTutoringRepository.getSubjectsByLevelId] Supabase error:', error);
        return err(error.message);
      }

      const subjects = (data || []).map((s: any) => this.mapSubject(s));
      console.log('[SupabaseTutoringRepository.getSubjectsByLevelId] Fetched subjects:', subjects.length, 'items');
      subjects.forEach((s) => console.log('  - Subject:', s.id, s.name, 'levelId:', s.levelId, 'academyId:', s.academyId));
      
      return ok(subjects);
    } catch (error: any) {
      console.error('[SupabaseTutoringRepository.getSubjectsByLevelId] Exception:', error);
      return err(error.message || 'Failed to fetch subjects');
    }
  }

  async getSubjectsByAcademyId(academyId: ID): Promise<Result<TutoringSubject[]>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_subjects')
        .select()
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((s: any) => this.mapSubject(s)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch subjects');
    }
  }

  async updateSubject(subjectId: ID, data: Partial<TutoringSubject>): Promise<Result<TutoringSubject>> {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.code) updateData.code = data.code;
      if (data.description) updateData.description = data.description;
      if (data.creditHours !== undefined) updateData.credit_hours = data.creditHours;
      if (data.costPerMonth !== undefined) updateData.cost_per_month = data.costPerMonth;
      if (data.costPerTerm !== undefined) updateData.cost_per_term = data.costPerTerm;
      if (data.costPerYear !== undefined) updateData.cost_per_year = data.costPerYear;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.syllabusUrl) updateData.syllabus_url = data.syllabusUrl;
      if (data.prerequisites) updateData.prerequisites = data.prerequisites;
      if (data.learningOutcomes) updateData.learning_outcomes = data.learningOutcomes;

      const { data: updated, error } = await supabase
        .from('tutoring_subjects')
        .update(updateData)
        .eq('id', subjectId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapSubject(updated));
    } catch (error: any) {
      return err(error.message || 'Failed to update subject');
    }
  }

  async deleteSubject(subjectId: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('tutoring_subjects')
        .delete()
        .eq('id', subjectId);

      if (error) {
        return err(error.message);
      }

      return ok(true);
    } catch (error: any) {
      return err(error.message || 'Failed to delete subject');
    }
  }

  // ============================================
  // CLASS CRUD
  // ============================================

  async createClass(
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
  ): Promise<Result<any>> {
    try {
      const { data: tutoringClass, error } = await supabase
        .from('tutoring_classes')
        .insert([
          {
            academy_id: academyId,
            level_id: levelId,
            subject_id: subjectId,
            instructor_id: instructorId,
            name: data.name,
            code: data.code,
            description: data.description,
            capacity: data.capacity,
            schedule: data.schedule,
            location: data.location,
            platform: data.platform,
            cost_per_month: data.costPerMonth,
            cost_per_term: data.costPerTerm,
            cost_per_year: data.costPerYear,
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapClass(tutoringClass));
    } catch (error: any) {
      return err(error.message || 'Failed to create class');
    }
  }

  async getClassById(classId: ID): Promise<Result<any | null>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_classes')
        .select()
        .eq('id', classId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return err(error.message);
      }

      return ok(data ? this.mapClass(data) : null);
    } catch (error: any) {
      return err(error.message || 'Failed to fetch class');
    }
  }

  async getClassesBySubjectId(subjectId: ID): Promise<Result<any[]>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_classes')
        .select()
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((c: any) => this.mapClass(c)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch classes');
    }
  }

  async getClassesByLevelId(levelId: ID): Promise<Result<any[]>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_classes')
        .select()
        .eq('level_id', levelId)
        .order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((c: any) => this.mapClass(c)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch classes');
    }
  }

  async getClassesByAcademyId(academyId: ID): Promise<Result<any[]>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_classes')
        .select()
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((c: any) => this.mapClass(c)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch classes');
    }
  }

  async getClassesByInstructorId(instructorId: ID): Promise<Result<any[]>> {
    try {
      const { data, error } = await supabase
        .from('tutoring_classes')
        .select()
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((c: any) => this.mapClass(c)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch classes');
    }
  }

  async updateClass(classId: ID, data: Partial<any>): Promise<Result<any>> {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.code) updateData.code = data.code;
      if (data.description) updateData.description = data.description;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.schedule) updateData.schedule = data.schedule;
      if (data.location) updateData.location = data.location;
      if (data.platform) updateData.platform = data.platform;
      if (data.costPerMonth !== undefined) updateData.cost_per_month = data.costPerMonth;
      if (data.costPerTerm !== undefined) updateData.cost_per_term = data.costPerTerm;
      if (data.costPerYear !== undefined) updateData.cost_per_year = data.costPerYear;

      const { data: updated, error } = await supabase
        .from('tutoring_classes')
        .update(updateData)
        .eq('id', classId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapClass(updated));
    } catch (error: any) {
      return err(error.message || 'Failed to update class');
    }
  }

  async deleteClass(classId: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('tutoring_classes')
        .delete()
        .eq('id', classId);

      if (error) {
        return err(error.message);
      }

      return ok(true);
    } catch (error: any) {
      return err(error.message || 'Failed to delete class');
    }
  }

  // ============================================
  // ACADEMY MEMBERSHIP
  // ============================================

  async addMemberToAcademy(
    academyId: ID,
    userId: ID,
    role: 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'ASSISTANT'
  ): Promise<Result<AcademyMembership>> {
    try {
      const { data: membership, error } = await supabase
        .from('academy_memberships')
        .insert([
          {
            academy_id: academyId,
            user_id: userId,
            role,
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapMembership(membership));
    } catch (error: any) {
      return err(error.message || 'Failed to add member');
    }
  }

  async getMembersOfAcademy(academyId: ID): Promise<Result<AcademyMembership[]>> {
    try {
      const { data, error } = await supabase
        .from('academy_memberships')
        .select()
        .eq('academy_id', academyId)
        .order('joined_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((m: any) => this.mapMembership(m)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch members');
    }
  }

  async getAcademiesForUser(userId: ID): Promise<Result<AcademyMembership[]>> {
    try {
      const { data, error } = await supabase
        .from('academy_memberships')
        .select()
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((m: any) => this.mapMembership(m)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch academies');
    }
  }

  async removeMemberFromAcademy(academyId: ID, userId: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_memberships')
        .delete()
        .eq('academy_id', academyId)
        .eq('user_id', userId);

      if (error) {
        return err(error.message);
      }

      return ok(true);
    } catch (error: any) {
      return err(error.message || 'Failed to remove member');
    }
  }

  async updateMemberRole(
    academyId: ID,
    userId: ID,
    newRole: string
  ): Promise<Result<AcademyMembership>> {
    try {
      const { data, error } = await supabase
        .from('academy_memberships')
        .update({ role: newRole })
        .eq('academy_id', academyId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapMembership(data));
    } catch (error: any) {
      return err(error.message || 'Failed to update member role');
    }
  }

  // ============================================
  // STUDENT REGISTRATION REQUESTS
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
    try {
      const { data: request, error } = await supabase
        .from('student_registration_requests')
        .insert([
          {
            student_id: studentId,
            class_id: classId,
            academy_id: data.academyId,
            level_id: data.levelId,
            subject_id: data.subjectId,
            cost_term: data.costTerm,
            cost_amount: data.costAmount,
            status: 'PENDING',
            payment_status: 'NOT_PAID',
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapRegistrationRequest(request));
    } catch (error: any) {
      return err(error.message || 'Failed to create registration request');
    }
  }

  async getRegistrationRequestById(requestId: ID): Promise<Result<StudentRegistrationRequest | null>> {
    try {
      const { data, error } = await supabase
        .from('student_registration_requests')
        .select()
        .eq('id', requestId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return err(error.message);
      }

      return ok(data ? this.mapRegistrationRequest(data) : null);
    } catch (error: any) {
      return err(error.message || 'Failed to fetch request');
    }
  }

  async getRegistrationRequestsForStudent(studentId: ID): Promise<Result<StudentRegistrationRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('student_registration_requests')
        .select()
        .eq('student_id', studentId)
        .order('requested_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((r: any) => this.mapRegistrationRequest(r)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch requests');
    }
  }

  async getRegistrationRequestsForClass(classId: ID): Promise<Result<StudentRegistrationRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('student_registration_requests')
        .select()
        .eq('class_id', classId)
        .order('requested_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((r: any) => this.mapRegistrationRequest(r)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch requests');
    }
  }

  async getPendingRegistrationRequestsForAcademy(academyId: ID): Promise<Result<StudentRegistrationRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('student_registration_requests')
        .select()
        .eq('academy_id', academyId)
        .eq('status', 'PENDING')
        .order('requested_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((r: any) => this.mapRegistrationRequest(r)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch pending requests');
    }
  }

  async approveRegistrationRequest(
    requestId: ID,
    respondedBy: ID,
    enrollmentStartDate: Date,
    enrollmentEndDate?: Date
  ): Promise<Result<StudentRegistrationRequest>> {
    try {
      const { data, error } = await supabase
        .from('student_registration_requests')
        .update({
          status: 'APPROVED',
          responded_by: respondedBy,
          responded_at: new Date().toISOString(),
          enrollment_start_date: enrollmentStartDate.toISOString(),
          enrollment_end_date: enrollmentEndDate?.toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapRegistrationRequest(data));
    } catch (error: any) {
      return err(error.message || 'Failed to approve request');
    }
  }

  async rejectRegistrationRequest(
    requestId: ID,
    respondedBy: ID,
    reason: string
  ): Promise<Result<StudentRegistrationRequest>> {
    try {
      const { data, error } = await supabase
        .from('student_registration_requests')
        .update({
          status: 'REJECTED',
          responded_by: respondedBy,
          responded_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapRegistrationRequest(data));
    } catch (error: any) {
      return err(error.message || 'Failed to reject request');
    }
  }

  async withdrawRegistrationRequest(requestId: ID): Promise<Result<StudentRegistrationRequest>> {
    try {
      const { data, error } = await supabase
        .from('student_registration_requests')
        .update({
          status: 'WITHDRAWN',
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapRegistrationRequest(data));
    } catch (error: any) {
      return err(error.message || 'Failed to withdraw request');
    }
  }

  // ============================================
  // STUDENT ENROLLMENTS
  // ============================================

  async getEnrollmentsForStudent(studentId: ID): Promise<Result<StudentSubjectEnrollment[]>> {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .select()
        .eq('student_id', studentId)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((e: any) => this.mapEnrollment(e)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch enrollments');
    }
  }

  async getEnrollmentsForClass(classId: ID): Promise<Result<StudentSubjectEnrollment[]>> {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .select()
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((e: any) => this.mapEnrollment(e)));
    } catch (error: any) {
      return err(error.message || 'Failed to fetch enrollments');
    }
  }

  async getEnrollmentById(enrollmentId: ID): Promise<Result<StudentSubjectEnrollment | null>> {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .select()
        .eq('id', enrollmentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return err(error.message);
      }

      return ok(data ? this.mapEnrollment(data) : null);
    } catch (error: any) {
      return err(error.message || 'Failed to fetch enrollment');
    }
  }

  async createEnrollment(
    studentId: ID,
    academyId: ID,
    classId: ID,
    data: {
      costPaid: number;
      costTerm: 'MONTHLY' | 'TERMLY' | 'YEARLY';
      paymentStatus: 'PENDING' | 'PAID';
      enrollmentEndDate?: Date;
    }
  ): Promise<Result<StudentSubjectEnrollment>> {
    try {
      const { data: enrollment, error } = await supabase
        .from('student_class_enrollments')
        .insert([
          {
            student_id: studentId,
            academy_id: academyId,
            class_id: classId,
            cost_paid: data.costPaid,
            cost_term: data.costTerm,
            payment_status: data.paymentStatus,
            enrollment_end_date: data.enrollmentEndDate?.toISOString(),
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapEnrollment(enrollment));
    } catch (error: any) {
      return err(error.message || 'Failed to create enrollment');
    }
  }

  async updateEnrollmentPaymentStatus(
    enrollmentId: ID,
    paymentStatus: 'PENDING' | 'PAID' | 'OVERDUE'
  ): Promise<Result<StudentSubjectEnrollment>> {
    try {
      const { data, error } = await supabase
        .from('student_class_enrollments')
        .update({
          payment_status: paymentStatus,
          last_payment_date: paymentStatus === 'PAID' ? new Date().toISOString() : undefined,
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) {
        return err(error.message);
      }

      return ok(this.mapEnrollment(data));
    } catch (error: any) {
      return err(error.message || 'Failed to update enrollment');
    }
  }

  async removeStudentFromClass(enrollmentId: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('student_class_enrollments')
        .update({ is_active: false })
        .eq('id', enrollmentId);

      if (error) {
        return err(error.message);
      }

      return ok(true);
    } catch (error: any) {
      return err(error.message || 'Failed to remove student');
    }
  }

  // ============================================
  // SEARCH & DISCOVERY
  // ============================================

  async searchAcademies(query: string, limit?: number, offset?: number): Promise<Result<TutoringAcademy[]>> {
    try {
      let searchQuery = supabase
        .from('tutoring_academies')
        .select()
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);

      if (limit) {
        searchQuery = searchQuery.range(offset || 0, (offset || 0) + limit - 1);
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((a: any) => this.mapAcademy(a)));
    } catch (error: any) {
      return err(error.message || 'Failed to search academies');
    }
  }

  async searchClasses(query: string, limit?: number, offset?: number): Promise<Result<any[]>> {
    try {
      let searchQuery = supabase
        .from('tutoring_classes')
        .select()
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,code.ilike.%${query}%`);

      if (limit) {
        searchQuery = searchQuery.range(offset || 0, (offset || 0) + limit - 1);
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false });

      if (error) {
        return err(error.message);
      }

      return ok((data || []).map((c: any) => this.mapClass(c)));
    } catch (error: any) {
      return err(error.message || 'Failed to search classes');
    }
  }

  async getClassCapacityInfo(
    classId: ID
  ): Promise<Result<{ capacity: number; enrolled: number; available: number }>> {
    try {
      // Get class capacity
      const classResult = await this.getClassById(classId);
      if (!classResult.ok) {
        return classResult as any;
      }

      const tutoringClass = classResult.value;
      const capacity = tutoringClass?.capacity || 999;

      // Get enrollment count
      const { count, error } = await supabase
        .from('student_class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('is_active', true);

      if (error) {
        return err(error.message);
      }

      const enrolled = count || 0;
      const available = Math.max(0, capacity - enrolled);

      return ok({ capacity, enrolled, available });
    } catch (error: any) {
      return err(error.message || 'Failed to get capacity info');
    }
  }

  async getAcademyStats(academyId: ID): Promise<Result<{
    totalLevels: number;
    totalSubjects: number;
    totalClasses: number;
    totalEnrolledStudents: number;
  }>> {
    try {
      const [levelsRes, subjectsRes, classesRes, enrollmentsRes] = await Promise.all([
        supabase.from('tutoring_levels').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
        supabase.from('tutoring_subjects').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
        supabase.from('tutoring_classes').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
        supabase.from('student_class_enrollments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('is_active', true),
      ]);

      return ok({
        totalLevels: levelsRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalEnrolledStudents: enrollmentsRes.count || 0,
      });
    } catch (error: any) {
      return err(error.message || 'Failed to get academy stats');
    }
  }

  async getClassEnrollmentCount(classId: ID): Promise<Result<number>> {
    try {
      const { count, error } = await supabase
        .from('student_class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('is_active', true);

      if (error) {
        return err(error.message);
      }

      return ok(count || 0);
    } catch (error: any) {
      return err(error.message || 'Failed to get enrollment count');
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private mapAcademy(data: any): TutoringAcademy {
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      description: data.description,
      logoUrl: data.logo_url,
      location: data.location,
      phone: data.phone,
      email: data.email,
      websiteUrl: data.website_url,
      isVerified: data.is_verified,
      verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapLevel(data: any): TutoringLevel {
    return {
      id: data.id,
      academyId: data.academy_id,
      name: data.name,
      code: data.code,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapSubject(data: any): TutoringSubject {
    return {
      id: data.id,
      academyId: data.academy_id,
      levelId: data.level_id,
      name: data.name,
      code: data.code,
      description: data.description,
      creditHours: data.credit_hours,
      costPerMonth: data.cost_per_month,
      costPerTerm: data.cost_per_term,
      costPerYear: data.cost_per_year,
      capacity: data.capacity,
      syllabusUrl: data.syllabus_url,
      prerequisites: data.prerequisites,
      learningOutcomes: data.learning_outcomes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapClass(data: any): any {
    return {
      id: data.id,
      academyId: data.academy_id,
      levelId: data.level_id,
      subjectId: data.subject_id,
      instructorId: data.instructor_id,
      name: data.name,
      code: data.code,
      description: data.description,
      capacity: data.capacity,
      schedule: data.schedule,
      location: data.location,
      platform: data.platform,
      costPerMonth: data.cost_per_month,
      costPerTerm: data.cost_per_term,
      costPerYear: data.cost_per_year,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapMembership(data: any): AcademyMembership {
    return {
      id: data.id,
      academyId: data.academy_id,
      userId: data.user_id,
      role: data.role,
      joinedAt: new Date(data.joined_at),
    };
  }

  private mapRegistrationRequest(data: any): StudentRegistrationRequest {
    return {
      id: data.id,
      studentId: data.student_id,
      academyId: data.academy_id,
      levelId: data.level_id,
      subjectId: data.subject_id,
      status: data.status,
      requestedAt: new Date(data.requested_at),
      respondedAt: data.responded_at ? new Date(data.responded_at) : undefined,
      respondedBy: data.responded_by,
      rejectionReason: data.rejection_reason,
      paymentStatus: data.payment_status,
      enrollmentStartDate: data.enrollment_start_date ? new Date(data.enrollment_start_date) : undefined,
      enrollmentEndDate: data.enrollment_end_date ? new Date(data.enrollment_end_date) : undefined,
      costTerm: data.cost_term,
      costAmount: data.cost_amount,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapEnrollment(data: any): StudentSubjectEnrollment {
    return {
      id: data.id,
      studentId: data.student_id,
      academyId: data.academy_id,
      levelId: data.level_id,
      subjectId: data.subject_id,
      enrolledAt: new Date(data.enrolled_at),
      enrollmentEndDate: data.enrollment_end_date ? new Date(data.enrollment_end_date) : undefined,
      paymentStatus: data.payment_status,
      costPaid: data.cost_paid,
      costTerm: data.cost_term,
      isActive: data.is_active,
      lastPaymentDate: data.last_payment_date ? new Date(data.last_payment_date) : undefined,
      nextPaymentDueDate: data.next_payment_due_date ? new Date(data.next_payment_due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Stub implementations for subject enrollment (replacing class enrollment)
  async enrollStudentInSubject(studentId: ID, subjectId: ID, registrationId?: ID): Promise<Result<StudentSubjectEnrollment>> {
    try {
      // TODO: Implement actual enrollment logic
      return ok({} as StudentSubjectEnrollment);
    } catch (error: any) {
      return err(error.message);
    }
  }

  async removeStudentFromSubject(enrollmentId: ID): Promise<Result<boolean>> {
    try {
      // TODO: Implement actual removal logic
      return ok(true);
    } catch (error: any) {
      return err(error.message);
    }
  }
}
