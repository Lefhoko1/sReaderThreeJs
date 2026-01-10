/**
 * AssignmentViewModel
 * Manages assignment list, detail, create/edit, and search flows.
 * Single responsibility: assignment data and operations.
 */

import { makeAutoObservable } from 'mobx';
import { Result } from '../../shared/result';
import { Assignment } from '../../domain/entities/assignment';
import { IAssignmentRepository } from '../../data/repositories/IAssignmentRepository';

export class AssignmentViewModel {
  assignments: Assignment[] = [];
  loading = false;
  error: string | null = null;
  pageSize = 10;
  currentPage = 1;
  total = 0;

  constructor(private assignmentRepo: IAssignmentRepository) {
    makeAutoObservable(this);
  }

  async loadAssignments(classId: string, page = 1): Promise<void> {
    this.loading = true;
    this.error = null;
    const result = await this.assignmentRepo.listAssignments(classId, page, this.pageSize);
    if (result.ok) {
      this.assignments = result.value.items;
      this.total = result.value.total;
      this.currentPage = page;
    } else {
      this.error = result.error;
    }
    this.loading = false;
  }

  async getAssignment(id: string): Promise<Result<Assignment>> {
    return this.assignmentRepo.getAssignment(id);
  }

  async createAssignment(classId: string, data: Omit<Assignment, 'id'>): Promise<Result<Assignment>> {
    const result = await this.assignmentRepo.createAssignment(data);
    if (result.ok) {
      this.assignments.push(result.value);
    } else {
      this.error = result.error;
    }
    return result;
  }

  async updateAssignment(a: Assignment): Promise<Result<Assignment>> {
    return this.assignmentRepo.updateAssignment(a);
  }

  async deleteAssignment(id: string): Promise<Result<boolean>> {
    return this.assignmentRepo.deleteAssignment(id);
  }

  async searchAssignments(query: string, page = 1): Promise<void> {
    this.loading = true;
    this.error = null;
    const result = await this.assignmentRepo.searchAssignments(query, page, this.pageSize);
    if (result.ok) {
      this.assignments = result.value.items;
      this.total = result.value.total;
      this.currentPage = page;
    } else {
      this.error = result.error;
    }
    this.loading = false;
  }

  clearError(): void {
    this.error = null;
  }
}
