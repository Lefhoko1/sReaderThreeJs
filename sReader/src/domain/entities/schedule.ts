import { ID, Timestamp, Visibility } from '../../shared/types';

export interface Schedule {
  id: ID;
  studentUserId: ID;
  assignmentId: ID;
  startsAt: Timestamp;
  endsAt?: Timestamp;
  visibility: Visibility;
}
