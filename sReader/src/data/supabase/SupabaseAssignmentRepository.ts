import { IAssignmentRepository } from '../repositories/IAssignmentRepository';
import { Assignment, AssignmentTool, ContentAsset } from '../../domain/entities/assignment';
import { Result, ok, err } from '../../shared/result';
import { ID } from '../../shared/types';
import supabase from './supabaseClient';

export class SupabaseAssignmentRepository implements IAssignmentRepository {
  // Old working methods
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

  // Interface methods - TODO: Implement
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
