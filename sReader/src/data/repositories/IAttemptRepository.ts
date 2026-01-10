import { Result } from '../../shared/result';
import { Attempt, Submission } from '../../domain/entities/attempt';

export interface IAttemptRepository {
  startAttempt(a: Omit<Attempt, 'id'|'startedAt'>): Promise<Result<Attempt>>;
  getAttempt(id: string): Promise<Result<Attempt>>;
  updateAttempt(a: Attempt): Promise<Result<Attempt>>;
  listAttemptsByAssignment(assignmentId: string): Promise<Result<Attempt[]>>;
  deleteAttempt(id: string): Promise<Result<boolean>>;

  submit(s: Omit<Submission, 'id'|'submittedAt'|'status'>): Promise<Result<Submission>>;
  getSubmission(id: string): Promise<Result<Submission>>;
  listSubmissionsByAssignment(assignmentId: string): Promise<Result<Submission[]>>;
}
