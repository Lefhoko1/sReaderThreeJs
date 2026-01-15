import { IAssignmentRepository } from '../repositories/IAssignmentRepository';
import {
  Assignment,
  AssignmentTool,
  ContentAsset,
  ReadingAssignment,
  AssignmentSubmission,
  AssignmentImage,
} from '../../domain/entities/assignment';
import { Result, ok, err } from '../../shared/result';
import { ID } from '../../shared/types';
import supabase from './supabaseClient';

export class SupabaseAssignmentRepository implements IAssignmentRepository {
  // ============================================
  // OLD ASSIGNMENT METHODS (Keep for compatibility)
  // ============================================

  async getAssignmentById(id: ID): Promise<Assignment | null> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToAssignment(data);
    } catch (error) {
      console.error('Error getting assignment:', error);
      return null;
    }
  }

  async getAssignmentsByClass(classId: ID): Promise<Assignment[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map((d) => this.mapToAssignment(d)) || [];
    } catch (error) {
      console.error('Error getting assignments by class:', error);
      return [];
    }
  }

  async getToolsForAssignment(assignmentId: ID): Promise<AssignmentTool[]> {
    try {
      const { data, error } = await supabase
        .from('assignment_tools')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (error) throw error;

      return (
        data?.map((d) => ({
          id: d.id,
          assignmentId: d.assignment_id,
          type: d.type,
          uri: d.uri,
          metadata: d.metadata,
        })) || []
      );
    } catch (error) {
      console.error('Error getting assignment tools:', error);
      return [];
    }
  }

  async saveAsset(asset: ContentAsset): Promise<Result<ContentAsset>> {
    try {
      const { data, error } = await supabase
        .from('content_assets')
        .insert([
          {
            id: asset.id,
            type: asset.type,
            uri: asset.uri,
            checksum: asset.checksum,
            owner_user_id: asset.ownerUserId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return ok({
        id: data.id,
        type: data.type,
        uri: data.uri,
        checksum: data.checksum,
        ownerUserId: data.owner_user_id,
      });
    } catch (error: any) {
      console.error('Error saving asset:', error);
      return err(error.message || 'Failed to save asset');
    }
  }

  // ============================================
  // INTERFACE METHOD STUBS (Old Pattern)
  // ============================================

  async getAssignment(id: string): Promise<Result<Assignment>> {
    return err('Not implemented');
  }

  async listAssignments(): Promise<Result<any>> {
    return err('Not implemented');
  }

  async searchAssignments(): Promise<Result<any>> {
    return err('Not implemented');
  }

  async createAssignment(a: Omit<Assignment, 'id'>): Promise<Result<Assignment>> {
    return err('Not implemented');
  }

  async updateAssignment(a: Assignment): Promise<Result<Assignment>> {
    return err('Not implemented');
  }

  async deleteAssignment(id: string): Promise<Result<boolean>> {
    return err('Not implemented');
  }

  async addTool(t: any): Promise<Result<AssignmentTool>> {
    return err('Not implemented');
  }

  async listTools(assignmentId: string): Promise<Result<AssignmentTool[]>> {
    return err('Not implemented');
  }

  async removeTool(id: string): Promise<Result<boolean>> {
    return err('Not implemented');
  }

  async addAsset(asset: any): Promise<Result<ContentAsset>> {
    return err('Not implemented');
  }

  async listAssets(assignmentId: string): Promise<Result<ContentAsset[]>> {
    return err('Not implemented');
  }

  // ============================================
  // READING ASSIGNMENT CRUD (New)
  // ============================================

  async createReadingAssignment(
    tutorId: ID,
    subjectId: ID,
    data: {
      title: string;
      description?: string;
      content: any;
      tools?: string[];
      durationMinutes?: number;
      parentEncouragement?: string;
      zombieGifts?: any[];
      dueDate?: Date;
    }
  ): Promise<Result<ReadingAssignment>> {
    try {
      console.log('[Repository] Creating reading assignment:', { tutorId, subjectId, title: data.title });

      const { data: created, error } = await supabase
        .from('assignments')
        .insert({
          subject_id: subjectId,
          title: data.title,
          description: data.description,
          content: data.content,
          tools: data.tools || [],
          duration_minutes: data.durationMinutes,
          parent_encouragement: data.parentEncouragement,
          zombie_gifts: data.zombieGifts,
          due_at: data.dueDate,
        })
        .select()
        .single();

      if (error) {
        console.error('[Repository] Error creating assignment:', error);
        return err(error.message);
      }

      console.log('[Repository] Reading assignment created successfully');
      return ok(this.mapToReadingAssignment(created));
    } catch (error: any) {
      console.error('[Repository] Exception:', error);
      return err(error.message);
    }
  }

  async getReadingAssignmentById(assignmentId: ID): Promise<Result<ReadingAssignment>> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (error) return err(error.message);
      if (!data) return err('Assignment not found');

      return ok(this.mapToReadingAssignment(data));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getReadingAssignmentsBySubjectId(subjectId: ID): Promise<Result<ReadingAssignment[]>> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (error) return err(error.message);

      return ok((data || []).map(d => this.mapToReadingAssignment(d)));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getReadingAssignmentsByClassId(classId: ID): Promise<Result<ReadingAssignment[]>> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) return err(error.message);

      return ok((data || []).map(d => this.mapToReadingAssignment(d)));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getReadingAssignmentsByTutorId(tutorId: ID): Promise<Result<ReadingAssignment[]>> {
    try {
      // Note: assignments table doesn't have tutor_id column
      // This method would need to join with tutoring_classes -> tutor
      // For now, returning empty array
      console.warn('[Repository] getReadingAssignmentsByTutorId: Tutor filter not available, use getReadingAssignmentsByClassId instead');
      return ok([]);
    } catch (error: any) {
      return err(error.message);
    }
  }

  async updateReadingAssignment(
    assignmentId: ID,
    data: Partial<ReadingAssignment>
  ): Promise<Result<ReadingAssignment>> {
    try {
      const updateData: any = {};
      if (data.title) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.content) updateData.content = data.content;
      if (data.tools) updateData.tools = data.tools;
      if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;
      if (data.parentEncouragement !== undefined) updateData.parent_encouragement = data.parentEncouragement;
      if (data.zombieGifts !== undefined) updateData.zombie_gifts = data.zombieGifts;
      if (data.dueDate !== undefined) updateData.due_at = data.dueDate;
      updateData.updated_at = new Date().toISOString();

      const { data: updated, error } = await supabase
        .from('assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) return err(error.message);
      return ok(this.mapToReadingAssignment(updated));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async deleteReadingAssignment(assignmentId: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) return err(error.message);
      return ok(true);
    } catch (error: any) {
      return err(error.message);
    }
  }

  // ============================================
  // ASSIGNMENT IMAGES
  // ============================================

  async addAssignmentImage(
    assignmentId: ID,
    wordId: string,
    imageUrl: string,
    imageSource: 'google' | 'phone_upload' | 'library',
    altText?: string
  ): Promise<Result<AssignmentImage>> {
    try {
      const { data, error } = await supabase
        .from('assignment_images')
        .insert({
          assignment_id: assignmentId,
          word_id: wordId,
          image_url: imageUrl,
          image_source: imageSource,
          alt_text: altText,
        })
        .select()
        .single();

      if (error) return err(error.message);
      return ok(this.mapToAssignmentImage(data));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getAssignmentImages(assignmentId: ID): Promise<Result<AssignmentImage[]>> {
    try {
      const { data, error } = await supabase
        .from('assignment_images')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (error) return err(error.message);
      return ok((data || []).map(d => this.mapToAssignmentImage(d)));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async deleteAssignmentImage(imageId: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('assignment_images')
        .delete()
        .eq('id', imageId);

      if (error) return err(error.message);
      return ok(true);
    } catch (error: any) {
      return err(error.message);
    }
  }

  // ============================================
  // STUDENT SUBMISSIONS
  // ============================================

  async submitAssignment(
    assignmentId: ID,
    studentId: ID,
    answers: Record<string, any>
  ): Promise<Result<AssignmentSubmission>> {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: studentId,
          answers,
          submission_status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return err(error.message);
      return ok(this.mapToSubmission(data));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getStudentSubmission(
    assignmentId: ID,
    studentId: ID
  ): Promise<Result<AssignmentSubmission | null>> {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') return err(error.message);
      if (!data) return ok(null);

      return ok(this.mapToSubmission(data));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getAssignmentSubmissions(assignmentId: ID): Promise<Result<AssignmentSubmission[]>> {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (error) return err(error.message);
      return ok((data || []).map(d => this.mapToSubmission(d)));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getStudentSubmissions(studentId: ID): Promise<Result<AssignmentSubmission[]>> {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });

      if (error) return err(error.message);
      return ok((data || []).map(d => this.mapToSubmission(d)));
    } catch (error: any) {
      return err(error.message);
    }
  }

  async gradeSubmission(
    submissionId: ID,
    score: number,
    feedback?: string
  ): Promise<Result<AssignmentSubmission>> {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          score,
          feedback,
          submission_status: 'GRADED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) return err(error.message);
      return ok(this.mapToSubmission(data));
    } catch (error: any) {
      return err(error.message);
    }
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapToAssignment(data: any): Assignment {
    return {
      id: data.id,
      classId: data.class_id,
      title: data.title,
      description: data.description,
      contentBlocks: data.content_blocks || [],
      dueAt: data.due_at,
    };
  }

  private mapToReadingAssignment(data: any): ReadingAssignment {
    return {
      id: data.id,
      tutorId: data.tutor_id, // Not in DB, but kept for compatibility
      classId: data.class_id,
      title: data.title,
      description: data.description,
      content: data.content,
      tools: data.tools || [],
      durationMinutes: data.duration_minutes,
      parentEncouragement: data.parent_encouragement,
      zombieGifts: data.zombie_gifts,
      dueDate: data.due_at ? new Date(data.due_at) : undefined,
      submissionDate: data.submission_date ? new Date(data.submission_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToAssignmentImage(data: any): AssignmentImage {
    return {
      id: data.id,
      assignmentId: data.assignment_id,
      wordId: data.word_id,
      imageUrl: data.image_url,
      imageSource: data.image_source,
      altText: data.alt_text,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToSubmission(data: any): AssignmentSubmission {
    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      answers: data.answers,
      submissionStatus: data.submission_status,
      score: data.score,
      feedback: data.feedback,
      submittedAt: data.submitted_at ? new Date(data.submitted_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
