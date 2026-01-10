import { IScheduleRepository } from '../repositories/IScheduleRepository';
import { Schedule } from '../../domain/entities/schedule';
import { Result, ok, err } from '../../shared/result';
import { ID, Page } from '../../shared/types';
import supabase from './supabaseClient';

export class SupabaseScheduleRepository implements IScheduleRepository {
  async getSchedule(id: string): Promise<Result<Schedule>> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return err('Schedule not found');

      return ok(this.mapToSchedule(data));
    } catch (error: any) {
      console.error('Error getting schedule:', error);
      return err(error.message || 'Failed to get schedule');
    }
  }

  async listSchedulesByStudent(
    studentUserId: string,
    page = 1,
    pageSize = 10
  ): Promise<Result<Page<Schedule>>> {
    try {
      const offset = (page - 1) * pageSize;
      const { data, error, count } = await supabase
        .from('schedules')
        .select('*', { count: 'exact' })
        .eq('student_user_id', studentUserId)
        .order('starts_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const schedules = data?.map((d) => this.mapToSchedule(d)) || [];
      const totalCount = count || 0;

      return ok({
        items: schedules,
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      });
    } catch (error: any) {
      console.error('Error listing schedules by student:', error);
      return err(error.message || 'Failed to list schedules');
    }
  }

  async listSchedulesByAssignment(
    assignmentId: string,
    page = 1,
    pageSize = 10
  ): Promise<Result<Page<Schedule>>> {
    try {
      const offset = (page - 1) * pageSize;
      const { data, error, count } = await supabase
        .from('schedules')
        .select('*', { count: 'exact' })
        .eq('assignment_id', assignmentId)
        .order('starts_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const schedules = data?.map((d) => this.mapToSchedule(d)) || [];
      const totalCount = count || 0;

      return ok({
        items: schedules,
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      });
    } catch (error: any) {
      console.error('Error listing schedules by assignment:', error);
      return err(error.message || 'Failed to list schedules');
    }
  }

  async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Result<Schedule>> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([
          {
            student_user_id: schedule.studentUserId,
            assignment_id: schedule.assignmentId,
            starts_at: schedule.startsAt,
            ends_at: schedule.endsAt,
            visibility: schedule.visibility,
          },
        ])
        .select('*')
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
          student_user_id: schedule.studentUserId,
          assignment_id: schedule.assignmentId,
          starts_at: schedule.startsAt,
          ends_at: schedule.endsAt,
          visibility: schedule.visibility,
        })
        .eq('id', schedule.id)
        .select('*')
        .single();

      if (error) throw error;

      return ok(this.mapToSchedule(data));
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      return err(error.message || 'Failed to update schedule');
    }
  }

  async deleteSchedule(id: string): Promise<Result<boolean>> {
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
    return {
      id: data.id,
      studentUserId: data.student_user_id,
      assignmentId: data.assignment_id,
      startsAt: data.starts_at,
      endsAt: data.ends_at,
      visibility: data.visibility,
    };
  }
}
