import { IAssignmentRepository } from '../repositories/IAssignmentRepository';
import { Assignment, AssignmentTool, ContentAsset } from '../../domain/entities/assignment';
import { Result } from '../../shared/result';
import { ID } from '../../shared/types';
import supabase from './supabaseClient';

export class SupabaseAssignmentRepository implements IAssignmentRepository {
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

  async createAssignment(assignment: Assignment): Promise<Result<Assignment>> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([
          {
            id: assignment.id,
            class_id: assignment.classId,
            title: assignment.title,
            description: assignment.description,
            content_blocks: assignment.contentBlocks,
            due_at: assignment.dueAt,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return Result.ok(this.mapToAssignment(data));
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      return Result.fail(error.message || 'Failed to create assignment');
    }
  }

  async updateAssignment(assignment: Assignment): Promise<Result<Assignment>> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          title: assignment.title,
          description: assignment.description,
          content_blocks: assignment.contentBlocks,
          due_at: assignment.dueAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignment.id)
        .select()
        .single();

      if (error) throw error;

      return Result.ok(this.mapToAssignment(data));
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      return Result.fail(error.message || 'Failed to update assignment');
    }
  }

  async deleteAssignment(id: ID): Promise<Result<void>> {
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);

      if (error) throw error;

      return Result.ok(undefined);
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      return Result.fail(error.message || 'Failed to delete assignment');
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

      return Result.ok({
        id: data.id,
        type: data.type,
        uri: data.uri,
        checksum: data.checksum,
        ownerUserId: data.owner_user_id,
      });
    } catch (error: any) {
      console.error('Error saving asset:', error);
      return Result.fail(error.message || 'Failed to save asset');
    }
  }

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
}
