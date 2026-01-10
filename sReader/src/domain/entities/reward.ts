import { ID } from '../../shared/types';

export interface Reward {
  id: ID;
  guardianUserId: ID;
  studentUserId: ID;
  condition: string; // e.g., achievement key, points threshold
  message?: string;
  grantType?: string; // e.g., badge, gift, ticket
  payload?: Record<string, unknown>;
}
