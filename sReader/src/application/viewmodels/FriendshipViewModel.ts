/**
 * FriendshipViewModel
 * Manages friend requests, friendships, and friend notifications.
 * Single responsibility: friend management operations.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { Result, ok, err } from '../../shared/result';
import { Friendship } from '../../domain/entities/social';
import { User } from '../../domain/entities/user';
import { IFriendshipRepository } from '../../data/repositories/IFriendshipRepository';
import { IUserRepository } from '../../data/repositories/IUserRepository';

export interface FriendshipWithUser extends Friendship {
  user?: User; // The other user in the friendship
}

export class FriendshipViewModel {
  // User lists
  students: User[] = [];
  friends: FriendshipWithUser[] = [];
  receivedRequests: FriendshipWithUser[] = [];
  sentRequests: FriendshipWithUser[] = [];

  // Loading and error states
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Current operation tracking
  operatingFriendshipId: string | null = null;

  constructor(
    private friendshipRepo: IFriendshipRepository,
    private userRepo: IUserRepository
  ) {
    makeAutoObservable(this);
  }

  /**
   * Load all students (for friend discovery)
   */
  async loadStudents(excludeUserId: string): Promise<Result<User[]>> {
    this.loading = true;
    this.error = null;

    try {
      // Load all students
      const studentsResult = await this.userRepo.getAllStudents();
      if (!studentsResult.ok) {
        runInAction(() => {
          this.error = studentsResult.error;
          this.loading = false;
        });
        return err(studentsResult.error);
      }

      // Load existing friends to exclude them
      const friendsResult = await this.friendshipRepo.listFriends(excludeUserId);
      const friendIds = friendsResult.ok 
        ? friendsResult.value
            .map(f => (f as FriendshipWithUser).user?.id)
            .filter((id): id is string => !!id)
        : [];

      // Load pending requests to exclude them
      const pendingResult = await this.friendshipRepo.listPending(excludeUserId);
      const pendingRequestIds = pendingResult.ok 
        ? pendingResult.value
            .map(f => (f as FriendshipWithUser).user?.id)
            .filter((id): id is string => !!id)
        : [];

      runInAction(() => {
        // Exclude current user, already-friended users, and users with pending requests
        this.students = studentsResult.value.filter(
          (student: User) => student.id !== excludeUserId 
            && !friendIds.includes(student.id)
            && !pendingRequestIds.includes(student.id)
        );
        this.loading = false;
      });
      return ok(this.students);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load students';
      runInAction(() => {
        this.error = message;
        this.loading = false;
      });
      return err(message);
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(toUserId: string, fromUserId: string): Promise<Result<Friendship>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.friendshipRepo.sendRequest(fromUserId, toUserId);
      if (result.ok) {
        runInAction(() => {
          this.successMessage = 'Friend request sent!';
          this.loading = false;
          // Add to sent requests
          const friendship = result.value;
          const toUser = this.students.find((s) => s.id === toUserId);
          if (toUser) {
            this.sentRequests.push({ ...friendship, user: toUser });
          }
        });
        return ok(result.value);
      } else {
        runInAction(() => {
          this.error = result.error;
          this.loading = false;
        });
        return err(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send friend request';
      runInAction(() => {
        this.error = message;
        this.loading = false;
      });
      return err(message);
    }
  }

  /**
   * Load all friends
   */
  async loadFriends(userId: string): Promise<Result<FriendshipWithUser[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.friendshipRepo.listFriends(userId);
      if (result.ok) {
        runInAction(() => {
          this.friends = result.value;
          this.loading = false;
        });
        return ok(this.friends);
      } else {
        runInAction(() => {
          this.error = result.error;
          this.loading = false;
        });
        return err(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load friends';
      runInAction(() => {
        this.error = message;
        this.loading = false;
      });
      return err(message);
    }
  }

  /**
   * Load all pending friend requests (received)
   */
  async loadPendingRequests(userId: string): Promise<Result<FriendshipWithUser[]>> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.friendshipRepo.listPending(userId);
      if (result.ok) {
        runInAction(() => {
          this.receivedRequests = result.value;
          this.loading = false;
        });
        return ok(this.receivedRequests);
      } else {
        runInAction(() => {
          this.error = result.error;
          this.loading = false;
        });
        return err(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load pending requests';
      runInAction(() => {
        this.error = message;
        this.loading = false;
      });
      return err(message);
    }
  }

  /**
   * Accept a friend request
   */
  async acceptRequest(friendshipId: string): Promise<Result<Friendship>> {
    this.operatingFriendshipId = friendshipId;
    this.error = null;

    try {
      // Find the request before accepting to preserve user data
      const requestToAccept = this.receivedRequests.find(r => r.id === friendshipId);
      
      const result = await this.friendshipRepo.acceptRequest(friendshipId);
      if (result.ok) {
        runInAction(() => {
          this.successMessage = 'Friend request accepted!';
          this.operatingFriendshipId = null;
          // Remove from received requests
          this.receivedRequests = this.receivedRequests.filter(
            (req) => req.id !== friendshipId
          );
          // Add to friends if we have user data
          if (requestToAccept?.user) {
            this.friends.push(requestToAccept);
          }
        });
        return ok(result.value);
      } else {
        runInAction(() => {
          this.error = result.error;
          this.operatingFriendshipId = null;
        });
        return err(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept request';
      runInAction(() => {
        this.error = message;
        this.operatingFriendshipId = null;
      });
      return err(message);
    }
  }

  /**
   * Decline a friend request
   */
  async declineRequest(friendshipId: string): Promise<Result<boolean>> {
    this.operatingFriendshipId = friendshipId;
    this.error = null;

    try {
      const result = await this.friendshipRepo.declineRequest(friendshipId);
      if (result.ok) {
        runInAction(() => {
          this.successMessage = 'Friend request declined.';
          this.operatingFriendshipId = null;
          this.receivedRequests = this.receivedRequests.filter(
            (req) => req.id !== friendshipId
          );
        });
        return ok(true);
      } else {
        runInAction(() => {
          this.error = result.error;
          this.operatingFriendshipId = null;
        });
        return err(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline request';
      runInAction(() => {
        this.error = message;
        this.operatingFriendshipId = null;
      });
      return err(message);
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(friendshipId: string): Promise<Result<boolean>> {
    this.operatingFriendshipId = friendshipId;
    this.error = null;

    try {
      const result = await this.friendshipRepo.unfriend(friendshipId);
      if (result.ok) {
        runInAction(() => {
          this.successMessage = 'Friend removed.';
          this.operatingFriendshipId = null;
          this.friends = this.friends.filter((friend) => friend.id !== friendshipId);
        });
        return ok(true);
      } else {
        runInAction(() => {
          this.error = result.error;
          this.operatingFriendshipId = null;
        });
        return err(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove friend';
      runInAction(() => {
        this.error = message;
        this.operatingFriendshipId = null;
      });
      return err(message);
    }
  }

  /**
   * Block a user
   */
  async blockUser(friendshipId: string): Promise<Result<Friendship>> {
    this.operatingFriendshipId = friendshipId;
    this.error = null;

    try {
      const result = await this.friendshipRepo.blockUser(friendshipId);
      if (result.ok) {
        runInAction(() => {
          this.successMessage = 'User blocked.';
          this.operatingFriendshipId = null;
          // Remove from friends/requests
          this.friends = this.friends.filter((friend) => friend.id !== friendshipId);
          this.receivedRequests = this.receivedRequests.filter(
            (req) => req.id !== friendshipId
          );
        });
        return ok(result.value);
      } else {
        runInAction(() => {
          this.error = result.error;
          this.operatingFriendshipId = null;
        });
        return err(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to block user';
      runInAction(() => {
        this.error = message;
        this.operatingFriendshipId = null;
      });
      return err(message);
    }
  }

  /**
   * Clear messages
   */
  clearMessages() {
    this.error = null;
    this.successMessage = null;
  }

  /**
   * Get unread request count
   */
  getUnreadRequestCount(): number {
    return this.receivedRequests.length;
  }

  /**
   * Get friend count
   */
  getFriendCount(): number {
    return this.friends.length;
  }
}
