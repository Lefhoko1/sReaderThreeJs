import { Result } from '../../shared/result';
import { MultiplayerRoom, PlayerState, EmojiReaction } from '../../domain/entities/multiplayer';

export interface IMultiplayerRepository {
  createRoom(r: Omit<MultiplayerRoom, 'id'|'createdAt'>): Promise<Result<MultiplayerRoom>>;
  getRoom(id: string): Promise<Result<MultiplayerRoom>>;
  updateRoomStatus(id: string, status: MultiplayerRoom['status']): Promise<Result<MultiplayerRoom>>;

  joinRoom(p: Omit<PlayerState, 'id'|'lastActiveAt'>): Promise<Result<PlayerState>>;
  listPlayers(roomId: string): Promise<Result<PlayerState[]>>;
  updatePlayerState(p: PlayerState): Promise<Result<PlayerState>>;
  removePlayer(id: string): Promise<Result<boolean>>;

  addReaction(r: Omit<EmojiReaction, 'id'|'at'>): Promise<Result<EmojiReaction>>;
  listReactions(roomId: string): Promise<Result<EmojiReaction[]>>;
}
