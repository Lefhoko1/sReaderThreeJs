/**
 * SQLiteScheduleRepository - Local SQLite implementation of IScheduleRepository.
 */

import { IScheduleRepository } from '../repositories/IScheduleRepository';
import { Schedule } from '../../domain/entities/schedule';
import { Result, ok, err } from '../../shared/result';
import { Page } from '../../shared/types';
import { sqliteDb } from './SQLiteDatabase';
import * as Crypto from 'expo-crypto';

export class SQLiteScheduleRepository implements IScheduleRepository {
  async createSchedule(s: Omit<Schedule, 'id'>): Promise<Result<Schedule>> {
    try {
      const id = Crypto.randomUUID();
      const fullSchedule: Schedule = { ...s, id };

      await sqliteDb.run(
        `INSERT INTO schedules (id, studentUserId, assignmentId, startsAt, endsAt, visibility)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          s.studentUserId,
          s.assignmentId,
          s.startsAt,
          s.endsAt,
          s.visibility,
        ]
      );

      return ok(fullSchedule);
    } catch (e) {
      return err(String(e));
    }
  }

  async getSchedule(id: string): Promise<Result<Schedule>> {
    try {
      const row = await sqliteDb.get<Schedule>(
        `SELECT * FROM schedules WHERE id = ?`,
        [id]
      );

      if (!row) return err('Schedule not found');
      return ok(row);
    } catch (e) {
      return err(String(e));
    }
  }

  async listSchedulesByStudent(studentUserId: string, page = 1, pageSize = 10): Promise<Result<Page<Schedule>>> {
    try {
      const offset = (page - 1) * pageSize;
      const rows = await sqliteDb.all<Schedule>(
        `SELECT * FROM schedules WHERE studentUserId = ? LIMIT ? OFFSET ?`,
        [studentUserId, pageSize, offset]
      );

      const countRow = await sqliteDb.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM schedules WHERE studentUserId = ?`,
        [studentUserId]
      );

      return ok({
        items: rows,
        total: countRow?.count || 0,
        page,
        pageSize,
      });
    } catch (e) {
      return err(String(e));
    }
  }

  async listSchedulesByAssignment(assignmentId: string, page = 1, pageSize = 10): Promise<Result<Page<Schedule>>> {
    try {
      const offset = (page - 1) * pageSize;
      const rows = await sqliteDb.all<Schedule>(
        `SELECT * FROM schedules WHERE assignmentId = ? LIMIT ? OFFSET ?`,
        [assignmentId, pageSize, offset]
      );

      const countRow = await sqliteDb.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM schedules WHERE assignmentId = ?`,
        [assignmentId]
      );

      return ok({
        items: rows,
        total: countRow?.count || 0,
        page,
        pageSize,
      });
    } catch (e) {
      return err(String(e));
    }
  }

  async updateSchedule(s: Schedule): Promise<Result<Schedule>> {
    try {
      await sqliteDb.run(
        `UPDATE schedules SET startsAt = ?, endsAt = ?, visibility = ? WHERE id = ?`,
        [s.startsAt, s.endsAt, s.visibility, s.id]
      );

      return ok(s);
    } catch (e) {
      return err(String(e));
    }
  }

  async deleteSchedule(id: string): Promise<Result<boolean>> {
    try {
      await sqliteDb.run(`DELETE FROM schedules WHERE id = ?`, [id]);
      return ok(true);
    } catch (e) {
      return err(String(e));
    }
  }
}
