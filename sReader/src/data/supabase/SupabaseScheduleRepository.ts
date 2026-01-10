import { IScheduleRepository } from '../repositories/IScheduleRepository';
import { Schedule } from '../../domain/entities/schedule';
import { Result, ok, err } from '../../shared/result';
import { ID } from '../../shared/types';
import supabase from './supabaseClient';

export class SupabaseScheduleRepository implements IScheduleRepository {
  async getScheduleById(id: ID): Promise<Schedule | null> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          assignments (
            id,
            class_id,
            title,
            description,
            content_blocks,
            due_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToSchedule(data);
    } catch (error) {
      console.error('Error getting schedule:', error);
      return null;
    }
  }

  async getSchedulesByUser(userId: ID): Promise<Schedule[]> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          assignments (
            id,
            class_id,
            title,
            description,
            content_blocks,
            due_at
          )
        `)
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      return data?.map((d) => this.mapToSchedule(d)) || [];
    } catch (error) {
      console.error('Error getting schedules by user:', error);
      return [];
    }
  }

  async createSchedule(schedule: Schedule): Promise<Result<Schedule>> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([
          {
            id: schedule.id,
            assignment_id: schedule.assignment.id,
            user_id: schedule.userId,
            scheduled_at: schedule.scheduledAt,
            due_at: schedule.assignment.dueAt,
            status: schedule.status || 'PENDING',
          },
        ])
        .select(`
          *,
          assignments (
            id,
            class_id,
            title,
            description,
            content_blocks,
            due_at
          )
        `)
        .single();

      if (error) throw error;

      return ok(this.mapToSchedule(data));
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      return err(error.message || 'Failed to create schedule');
    }
  }

  async updateSchedule(schedule: Schedule): Promise<Result<Schedule>> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          status: schedule.status,
          due_at: schedule.assignment.dueAt,
        })
        .eq('id', schedule.id)
        .select(`
          *,
          assignments (
            id,
            class_id,
            title,
            description,
            content_blocks,
            due_at
          )
        `)
        .single();

      if (error) throw error;

      return ok(this.mapToSchedule(data));
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      return err(error.message || 'Failed to update schedule');
    }
  }

  async deleteSchedule(id: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);

      if (error) throw error;

      return ok(true);
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      return err(error.message || 'Failed to delete schedule');
    }
  }

  private mapToSchedule(data: any): Schedule {
    const assignment = data.assignments;
    return {
      id: data.id,
      assignment: {
        id: assignment.id,
        classId: assignment.class_id,
        title: assignment.title,
        description: assignment.description,
        contentBlocks: assignment.content_blocks || [],
        dueAt: assignment.due_at,
      },
      userId: data.user_id,
      scheduledAt: data.scheduled_at,
      status: data.status,
    };
  }
}
