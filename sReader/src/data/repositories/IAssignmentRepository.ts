import { Result } from '../../shared/result';
import { Page, ID } from '../../shared/types';
import {
  Assignment,
  AssignmentTool,
  ContentAsset,
  ReadingAssignment,
  AssignmentSubmission,
  AssignmentImage,
} from '../../domain/entities/assignment';

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

  // ============================================
  // READING ASSIGNMENT CRUD (New)
  // ============================================

  createReadingAssignment(
    tutorId: ID,
    classId: ID,
    data: {
      title: string;
      description?: string;
      content: any;
      tools?: string[];
      durationMinutes?: number;
      parentEncouragement?: string;
      zombieGifts?: any[];
      dueDate?: Date;
    }
  ): Promise<Result<ReadingAssignment>>;

  getReadingAssignmentById(assignmentId: ID): Promise<Result<ReadingAssignment>>;

  getReadingAssignmentsByClassId(classId: ID): Promise<Result<ReadingAssignment[]>>;

  getReadingAssignmentsByTutorId(tutorId: ID): Promise<Result<ReadingAssignment[]>>;

  updateReadingAssignment(
    assignmentId: ID,
    data: Partial<ReadingAssignment>
  ): Promise<Result<ReadingAssignment>>;

  deleteReadingAssignment(assignmentId: ID): Promise<Result<boolean>>;

  // ============================================
  // ASSIGNMENT IMAGES
  // ============================================

  addAssignmentImage(
    assignmentId: ID,
    wordId: string,
    imageUrl: string,
    imageSource: 'google' | 'phone_upload' | 'library',
    altText?: string
  ): Promise<Result<AssignmentImage>>;

  getAssignmentImages(assignmentId: ID): Promise<Result<AssignmentImage[]>>;

  deleteAssignmentImage(imageId: ID): Promise<Result<boolean>>;

  // ============================================
  // STUDENT SUBMISSIONS
  // ============================================

  submitAssignment(
    assignmentId: ID,
    studentId: ID,
    answers: Record<string, any>
  ): Promise<Result<AssignmentSubmission>>;

  getStudentSubmission(
    assignmentId: ID,
    studentId: ID
  ): Promise<Result<AssignmentSubmission | null>>;

  getAssignmentSubmissions(
    assignmentId: ID
  ): Promise<Result<AssignmentSubmission[]>>;

  getStudentSubmissions(studentId: ID): Promise<Result<AssignmentSubmission[]>>;

  gradeSubmission(
    submissionId: ID,
    score: number,
    feedback?: string
  ): Promise<Result<AssignmentSubmission>>;
}
