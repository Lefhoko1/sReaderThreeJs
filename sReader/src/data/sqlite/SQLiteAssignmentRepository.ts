/**
 * SQLiteAssignmentRepository - Local SQLite implementation of IAssignmentRepository.
 */

import { IAssignmentRepository } from '../repositories/IAssignmentRepository';
import { Assignment, AssignmentTool, ContentAsset } from '../../domain/entities/assignment';
import { Result, ok, err } from '../../shared/result';
import { Page } from '../../shared/types';
import { sqliteDb } from './SQLiteDatabase';
import * as Crypto from 'expo-crypto';

export class SQLiteAssignmentRepository implements IAssignmentRepository {
  async createAssignment(a: Omit<Assignment, 'id'>): Promise<Result<Assignment>> {
    try {
      const id = Crypto.randomUUID();
      const fullAssignment: Assignment = { ...a, id };

      await sqliteDb.run(
        `INSERT INTO assignments (id, classId, title, description, contentBlocks, dueAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          a.classId,
          a.title,
          a.description,
          JSON.stringify(a.contentBlocks),
          a.dueAt,
        ]
      );

      return ok(fullAssignment);
    } catch (e) {
      return err(String(e));
    }
  }

  async getAssignment(id: string): Promise<Result<Assignment>> {
    try {
      const row = await sqliteDb.get<any>(
        `SELECT * FROM assignments WHERE id = ?`,
        [id]
      );

      if (!row) return err('Assignment not found');

      return ok({
        ...row,
        contentBlocks: JSON.parse(row.contentBlocks),
      } as Assignment);
    } catch (e) {
      return err(String(e));
    }
  }

  async listAssignments(classId: string, page = 1, pageSize = 10): Promise<Result<Page<Assignment>>> {
    try {
      const offset = (page - 1) * pageSize;
      const rows = await sqliteDb.all<any>(
        `SELECT * FROM assignments WHERE classId = ? LIMIT ? OFFSET ?`,
        [classId, pageSize, offset]
      );

      const countRow = await sqliteDb.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM assignments WHERE classId = ?`,
        [classId]
      );

      return ok({
        items: rows.map(r => ({
          ...r,
          contentBlocks: JSON.parse(r.contentBlocks),
        })) as Assignment[],
        total: countRow?.count || 0,
        page,
        pageSize,
      });
    } catch (e) {
      return err(String(e));
    }
  }

  async searchAssignments(query: string, page = 1, pageSize = 10): Promise<Result<Page<Assignment>>> {
    try {
      const offset = (page - 1) * pageSize;
      const rows = await sqliteDb.all<any>(
        `SELECT * FROM assignments WHERE title LIKE ? OR description LIKE ? LIMIT ? OFFSET ?`,
        [`%${query}%`, `%${query}%`, pageSize, offset]
      );

      const countRow = await sqliteDb.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM assignments WHERE title LIKE ? OR description LIKE ?`,
        [`%${query}%`, `%${query}%`]
      );

      return ok({
        items: rows.map(r => ({
          ...r,
          contentBlocks: JSON.parse(r.contentBlocks),
        })) as Assignment[],
        total: countRow?.count || 0,
        page,
        pageSize,
      });
    } catch (e) {
      return err(String(e));
    }
  }

  async updateAssignment(a: Assignment): Promise<Result<Assignment>> {
    try {
      await sqliteDb.run(
        `UPDATE assignments SET title = ?, description = ?, contentBlocks = ?, dueAt = ? WHERE id = ?`,
        [
          a.title,
          a.description,
          JSON.stringify(a.contentBlocks),
          a.dueAt,
          a.id,
        ]
      );

      return ok(a);
    } catch (e) {
      return err(String(e));
    }
  }

  async deleteAssignment(id: string): Promise<Result<boolean>> {
    try {
      await sqliteDb.run(`DELETE FROM assignments WHERE id = ?`, [id]);
      return ok(true);
    } catch (e) {
      return err(String(e));
    }
  }

  async addTool(t: Omit<AssignmentTool, 'id'>): Promise<Result<AssignmentTool>> {
    // TODO: Implement tools table
    return ok({ ...t, id: Crypto.randomUUID() });
  }

  async listTools(assignmentId: string): Promise<Result<AssignmentTool[]>> {
    // TODO: Implement
    return ok([]);
  }

  async removeTool(id: string): Promise<Result<boolean>> {
    // TODO: Implement
    return ok(true);
  }

  async addAsset(asset: Omit<ContentAsset, 'id'>): Promise<Result<ContentAsset>> {
    // TODO: Implement assets table
    return ok({ ...asset, id: Crypto.randomUUID() });
  }

  async listAssets(assignmentId: string): Promise<Result<ContentAsset[]>> {
    // TODO: Implement
    return ok([]);
  }
}
