import { ID, Timestamp } from '../../shared/types';

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export interface Friendship {
  id: ID;
  requesterUserId: ID;
  addresseeUserId: ID;
  status: FriendshipStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
