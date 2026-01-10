import { Result } from '../../shared/result';
import { Page } from '../../shared/types';
import { Schedule } from '../../domain/entities/schedule';

export interface IScheduleRepository {
  createSchedule(s: Omit<Schedule, 'id'>): Promise<Result<Schedule>>;
  getSchedule(id: string): Promise<Result<Schedule>>;
  listSchedulesByStudent(studentUserId: string, page?: number, pageSize?: number): Promise<Result<Page<Schedule>>>;
  listSchedulesByAssignment(assignmentId: string, page?: number, pageSize?: number): Promise<Result<Page<Schedule>>>;
  updateSchedule(s: Schedule): Promise<Result<Schedule>>;
  deleteSchedule(id: string): Promise<Result<boolean>>;
}
