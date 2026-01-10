import { Result } from '../../shared/result';
import { Friendship } from '../../domain/entities/social';

export interface IFriendshipRepository {
  sendRequest(requesterUserId: string, addresseeUserId: string): Promise<Result<Friendship>>;
  listFriends(userId: string): Promise<Result<Friendship[]>>;
  listPending(userId: string): Promise<Result<Friendship[]>>;
  acceptRequest(id: string): Promise<Result<Friendship>>;
  declineRequest(id: string): Promise<Result<boolean>>;
  blockUser(id: string): Promise<Result<Friendship>>;
  unfriend(id: string): Promise<Result<boolean>>;
}
