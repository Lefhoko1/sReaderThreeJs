import { Result } from '../../shared/result';
import { Page } from '../../shared/types';
import { Assignment, AssignmentTool, ContentAsset } from '../../domain/entities/assignment';

export interface IAssignmentRepository {
  createAssignment(a: Omit<Assignment, 'id'>): Promise<Result<Assignment>>;
  getAssignment(id: string): Promise<Result<Assignment>>;
  listAssignments(classId: string, page?: number, pageSize?: number): Promise<Result<Page<Assignment>>>;
  searchAssignments(query: string, page?: number, pageSize?: number): Promise<Result<Page<Assignment>>>;
  updateAssignment(a: Assignment): Promise<Result<Assignment>>;
  deleteAssignment(id: string): Promise<Result<boolean>>;

  addTool(t: Omit<AssignmentTool, 'id'>): Promise<Result<AssignmentTool>>;
  listTools(assignmentId: string): Promise<Result<AssignmentTool[]>>;
  removeTool(id: string): Promise<Result<boolean>>;

  addAsset(asset: Omit<ContentAsset, 'id'>): Promise<Result<ContentAsset>>;
  listAssets(assignmentId: string): Promise<Result<ContentAsset[]>>;
}
