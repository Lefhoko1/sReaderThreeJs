/**
 * ScheduleViewModel
 * Manages student schedules: create, list, update, delete, visibility toggles.
 * Single responsibility: schedule data and operations.
 */

import { makeAutoObservable } from 'mobx';
import { Result } from '../../shared/result';
import { Schedule } from '../../domain/entities/schedule';
import { IScheduleRepository } from '../../data/repositories/IScheduleRepository';

export class ScheduleViewModel {
  schedules: Schedule[] = [];
  loading = false;
  error: string | null = null;

  constructor(private scheduleRepo: IScheduleRepository) {
    makeAutoObservable(this);
  }

  async loadSchedulesByStudent(studentUserId: string): Promise<void> {
    this.loading = true;
    this.error = null;
    const result = await this.scheduleRepo.listSchedulesByStudent(studentUserId);
    if (result.ok) {
      this.schedules = result.value.items;
    } else {
      this.error = result.error;
    }
    this.loading = false;
  }

  async createSchedule(data: Omit<Schedule, 'id'>): Promise<Result<Schedule>> {
    const result = await this.scheduleRepo.createSchedule(data);
    if (result.ok) {
      this.schedules.push(result.value);
    } else {
      this.error = result.error;
    }
    return result;
  }

  async updateSchedule(s: Schedule): Promise<Result<Schedule>> {
    return this.scheduleRepo.updateSchedule(s);
  }

  async deleteSchedule(id: string): Promise<Result<boolean>> {
    return this.scheduleRepo.deleteSchedule(id);
  }

  clearError(): void {
    this.error = null;
  }
}
