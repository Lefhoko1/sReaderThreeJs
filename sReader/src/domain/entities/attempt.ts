import { ID, Timestamp } from '../../shared/types';

export type AttemptMode = 'SOLO' | 'MULTI';

export interface Attempt {
  id: ID;
  assignmentId: ID;
  userId: ID;
  mode: AttemptMode;
  state?: string; // serialized progress
  score?: number;
  startedAt: Timestamp;
  endedAt?: Timestamp;
}

export interface Submission {
  id: ID;
  attemptId: ID;
  payload: Record<string, unknown>; // immutable after submission
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  submittedAt: Timestamp;
}
