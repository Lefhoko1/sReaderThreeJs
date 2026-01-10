import { ID, Timestamp } from '../../shared/types';

export interface Notification {
  id: ID;
  userId: ID;
  type: string;
  payload?: Record<string, unknown>;
  readAt?: Timestamp;
}
