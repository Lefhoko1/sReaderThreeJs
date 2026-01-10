import { IFriendshipRepository } from '../repositories/IFriendshipRepository';
import { Friendship } from '../../domain/entities/social';
import { Result, ok, err } from '../../shared/result';
import { User } from '../../domain/entities/user';
import supabase from './supabaseClient';

export class SupabaseFriendshipRepository implements IFriendshipRepository {
  /**
   * Send a friend request
   */
  async sendRequest(requesterUserId: string, addresseeUserId: string): Promise<Result<Friendship>> {
    try {
      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(from_user_id.eq.${requesterUserId},to_user_id.eq.${addresseeUserId}),and(from_user_id.eq.${addresseeUserId},to_user_id.eq.${requesterUserId})`)
        .single();

      if (existing) {
        return err('Friendship request already exists');
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert([
          {
            from_user_id: requesterUserId,
            to_user_id: addresseeUserId,
            status: 'PENDING',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (!data) return err('Failed to create friendship');

      return ok(this.mapToFriendship(data));
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      return err(error.message || 'Failed to send friend request');
    }
  }

  /**
   * List all accepted friendships for a user
   */
  async listFriends(userId: string): Promise<Result<Friendship[]>> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          fromUser:from_user_id(
            id,
            email,
            display_name,
            avatar_url,
            roles,
            created_at,
            updated_at
          ),
          toUser:to_user_id(
            id,
            email,
            display_name,
            avatar_url,
            roles,
            created_at,
            updated_at
          )
        `)
        .eq('status', 'ACCEPTED')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

      if (error) throw error;

      console.log('👥 Friends fetched:', data);
      return ok((data || []).map(d => {
        // Determine which user is the friend (not the current user)
        const friendUser = d.from_user_id === userId ? d.toUser : d.fromUser;
        return {
          ...this.mapToFriendship(d),
          user: friendUser ? this.mapToUser(friendUser) : undefined
        };
      }));
    } catch (error: any) {
      console.error('❌ Error listing friends:', error);
      return err(error.message || 'Failed to list friends');
    }
  }

  /**
   * List all pending friend requests for a user (received requests)
   */
  async listPending(userId: string): Promise<Result<Friendship[]>> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user:from_user_id(
            id,
            email,
            display_name,
            avatar_url,
            roles,
            created_at,
            updated_at
          )
        `)
        .eq('status', 'PENDING')
        .eq('to_user_id', userId); // Only requests sent TO this user

      if (error) throw error;

      console.log('📨 Pending requests fetched:', data);
      return ok((data || []).map(d => ({
        ...this.mapToFriendship(d),
        user: d.user ? this.mapToUser(d.user) : undefined
      })));
    } catch (error: any) {
      console.error('❌ Error listing pending requests:', error);
      return err(error.message || 'Failed to list pending requests');
    }
  }

  /**
   * Accept a friend request
   */
  async acceptRequest(friendshipId: string): Promise<Result<Friendship>> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'ACCEPTED' })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return err('Friendship not found');

      return ok(this.mapToFriendship(data));
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      return err(error.message || 'Failed to accept friend request');
    }
  }

  /**
   * Decline/reject a friend request
   */
  async declineRequest(friendshipId: string): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      return ok(true);
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      return err(error.message || 'Failed to decline friend request');
    }
  }

  /**
   * Block a user
   */
  async blockUser(friendshipId: string): Promise<Result<Friendship>> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'BLOCKED' })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return err('Friendship not found');

      return ok(this.mapToFriendship(data));
    } catch (error: any) {
      console.error('Error blocking user:', error);
      return err(error.message || 'Failed to block user');
    }
  }

  /**
   * Remove a friend (delete friendship)
   */
  async unfriend(friendshipId: string): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      return ok(true);
    } catch (error: any) {
      console.error('Error removing friend:', error);
      return err(error.message || 'Failed to remove friend');
    }
  }

  private mapToFriendship(data: any): Friendship {
    return {
      id: data.id,
      requesterUserId: data.from_user_id,
      addresseeUserId: data.to_user_id,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      roles: data.roles || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
