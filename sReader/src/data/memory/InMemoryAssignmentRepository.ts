/**
 * InMemoryAssignmentRepository - Web-compatible in-memory implementation.
 */

import { IAssignmentRepository } from '../repositories/IAssignmentRepository';
import { Assignment, AssignmentTool, ContentAsset } from '../../domain/entities/assignment';
import { Result, ok, err } from '../../shared/result';
import { Page } from '../../shared/types';
import * as Crypto from 'expo-crypto';

export class InMemoryAssignmentRepository implements IAssignmentRepository {
  private assignments: Map<string, Assignment> = new Map();
  private tools: Map<string, AssignmentTool> = new Map();
  private assets: Map<string, ContentAsset> = new Map();

  async createAssignment(a: Omit<Assignment, 'id'>): Promise<Result<Assignment>> {
    try {
      const id = Crypto.randomUUID();
      const fullAssignment: Assignment = { ...a, id };
      this.assignments.set(id, fullAssignment);
      return ok(fullAssignment);
    } catch (e) {
      return err(String(e));
    }
  }

  async getAssignment(id: string): Promise<Result<Assignment>> {
    const assignment = this.assignments.get(id);
    if (!assignment) return err('Assignment not found');
    return ok(assignment);
  }

  async listAssignments(classId: string, page = 1, pageSize = 10): Promise<Result<Page<Assignment>>> {
    const filtered = Array.from(this.assignments.values()).filter(a => a.classId === classId);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return ok({
      items,
      total: filtered.length,
      page,
      pageSize,
    });
  }

  async searchAssignments(query: string, page = 1, pageSize = 10): Promise<Result<Page<Assignment>>> {
    const filtered = Array.from(this.assignments.values()).filter(
      a => a.title.toLowerCase().includes(query.toLowerCase()) ||
           a.description?.toLowerCase().includes(query.toLowerCase())
    );
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return ok({
      items,
      total: filtered.length,
      page,
      pageSize,
    });
  }

  async updateAssignment(a: Assignment): Promise<Result<Assignment>> {
    this.assignments.set(a.id, a);
    return ok(a);
  }

  async deleteAssignment(id: string): Promise<Result<boolean>> {
    this.assignments.delete(id);
    return ok(true);
  }

  async addTool(t: Omit<AssignmentTool, 'id'>): Promise<Result<AssignmentTool>> {
    const id = Crypto.randomUUID();
    const tool = { ...t, id };
    this.tools.set(id, tool);
    return ok(tool);
  }

  async listTools(assignmentId: string): Promise<Result<AssignmentTool[]>> {
    const tools = Array.from(this.tools.values()).filter(t => t.assignmentId === assignmentId);
    return ok(tools);
  }

  async removeTool(id: string): Promise<Result<boolean>> {
    this.tools.delete(id);
    return ok(true);
  }

  async addAsset(asset: Omit<ContentAsset, 'id'>): Promise<Result<ContentAsset>> {
    const id = Crypto.randomUUID();
    const fullAsset = { ...asset, id };
    this.assets.set(id, fullAsset);
    return ok(fullAsset);
  }

  async listAssets(assignmentId: string): Promise<Result<ContentAsset[]>> {
    return ok([]);
  }
}
