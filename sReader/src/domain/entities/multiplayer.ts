import { ID, Timestamp } from '../../shared/types';

export interface MultiplayerRoom {
  id: ID;
  assignmentId: ID;
  hostUserId: ID;
  status: 'LOBBY' | 'ACTIVE' | 'CLOSED';
  createdAt: Timestamp;
}

export interface PlayerState {
  id: ID;
  roomId: ID;
  userId: ID;
  turnOrder: number;
  isConnected: boolean;
  lastActiveAt: Timestamp;
}

export interface EmojiReaction {
  id: ID;
  roomId: ID;
  fromUserId: ID;
  toUserId?: ID;
  type: string;
  at: Timestamp;
}
