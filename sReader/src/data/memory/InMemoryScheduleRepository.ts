/**
 * InMemoryScheduleRepository - Web-compatible in-memory implementation.
 */

import { IScheduleRepository } from '../repositories/IScheduleRepository';
import { Schedule } from '../../domain/entities/schedule';
import { Result, ok, err } from '../../shared/result';
import { Page } from '../../shared/types';
import * as Crypto from 'expo-crypto';

export class InMemoryScheduleRepository implements IScheduleRepository {
  private schedules: Map<string, Schedule> = new Map();

  async createSchedule(s: Omit<Schedule, 'id'>): Promise<Result<Schedule>> {
    try {
      const id = Crypto.randomUUID();
      const fullSchedule: Schedule = { ...s, id };
      this.schedules.set(id, fullSchedule);
      return ok(fullSchedule);
    } catch (e) {
      return err(String(e));
    }
  }

  async getSchedule(id: string): Promise<Result<Schedule>> {
    const schedule = this.schedules.get(id);
    if (!schedule) return err('Schedule not found');
    return ok(schedule);
  }

  async listSchedulesByStudent(studentUserId: string, page = 1, pageSize = 10): Promise<Result<Page<Schedule>>> {
    const filtered = Array.from(this.schedules.values()).filter(s => s.studentUserId === studentUserId);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return ok({
      items,
      total: filtered.length,
      page,
      pageSize,
    });
  }

  async listSchedulesByAssignment(assignmentId: string, page = 1, pageSize = 10): Promise<Result<Page<Schedule>>> {
    const filtered = Array.from(this.schedules.values()).filter(s => s.assignmentId === assignmentId);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return ok({
      items,
      total: filtered.length,
      page,
      pageSize,
    });
  }

  async updateSchedule(s: Schedule): Promise<Result<Schedule>> {
    this.schedules.set(s.id, s);
    return ok(s);
  }

  async deleteSchedule(id: string): Promise<Result<boolean>> {
    this.schedules.delete(id);
    return ok(true);
  }
}
