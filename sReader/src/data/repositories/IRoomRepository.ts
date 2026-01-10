import { Result } from '../../shared/result';
import { MultiplayerRoom, PlayerState, EmojiReaction } from '../../domain/entities/multiplayer';

export interface IRoomRepository {
  createRoom(room: Omit<MultiplayerRoom, 'id'|'createdAt'|'status'>): Promise<Result<MultiplayerRoom>>;
  getRoom(id: string): Promise<Result<MultiplayerRoom>>;
  listRoomsByAssignment(assignmentId: string): Promise<Result<MultiplayerRoom[]>>;
  startRoom(id: string): Promise<Result<MultiplayerRoom>>;
  closeRoom(id: string): Promise<Result<boolean>>;

  join(roomId: string, userId: string): Promise<Result<PlayerState>>;
  leave(roomId: string, userId: string): Promise<Result<boolean>>;
  listPlayers(roomId: string): Promise<Result<PlayerState[]>>;
  setTurn(roomId: string, userId: string): Promise<Result<PlayerState>>;

  react(roomId: string, reaction: Omit<EmojiReaction, 'id'|'at'>): Promise<Result<EmojiReaction>>;
  listReactions(roomId: string): Promise<Result<EmojiReaction[]>>;
}
