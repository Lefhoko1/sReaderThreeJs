import { IUserRepository } from '../repositories/IUserRepository';
import { User, Profile, Location, Device } from '../../domain/entities/user';
import { Result } from '../../shared/result';
import { ID } from '../../shared/types';
import supabase from './supabaseClient';

export class SupabaseUserRepository implements IUserRepository {
  async getUserById(id: ID): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToUser(data);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToUser(data);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToUser(data);
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
  }

  async createUser(user: User): Promise<Result<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            phone: user.phone,
            display_name: user.displayName,
            avatar_url: user.avatarUrl,
            roles: user.roles,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return Result.ok(this.mapToUser(data));
    } catch (error: any) {
      console.error('Error creating user:', error);
      return Result.fail(error.message || 'Failed to create user');
    }
  }

  async updateUser(user: User): Promise<Result<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          email: user.email,
          phone: user.phone,
          display_name: user.displayName,
          avatar_url: user.avatarUrl,
          roles: user.roles,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return Result.ok(this.mapToUser(data));
    } catch (error: any) {
      console.error('Error updating user:', error);
      return Result.fail(error.message || 'Failed to update user');
    }
  }

  async deleteUser(id: ID): Promise<Result<void>> {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);

      if (error) throw error;

      return Result.ok(undefined);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return Result.fail(error.message || 'Failed to delete user');
    }
  }

  async getProfile(userId: ID): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        userId: data.user_id,
        bio: data.bio,
        locationConsent: data.location_consent,
        notificationPrefs: data.notification_prefs,
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  async saveProfile(profile: Profile): Promise<Result<void>> {
    try {
      const { error } = await supabase.from('profiles').upsert({
        user_id: profile.userId,
        bio: profile.bio,
        location_consent: profile.locationConsent,
        notification_prefs: profile.notificationPrefs,
      });

      if (error) throw error;

      return Result.ok(undefined);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      return Result.fail(error.message || 'Failed to save profile');
    }
  }

  async getLocation(userId: ID): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        userId: data.user_id,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        address: data.address,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async saveLocation(location: Location): Promise<Result<void>> {
    try {
      const { error } = await supabase.from('locations').upsert({
        user_id: location.userId,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        updated_at: location.updatedAt,
      });

      if (error) throw error;

      return Result.ok(undefined);
    } catch (error: any) {
      console.error('Error saving location:', error);
      return Result.fail(error.message || 'Failed to save location');
    }
  }

  async saveDevice(device: Device): Promise<Result<void>> {
    try {
      const { error } = await supabase.from('devices').upsert({
        id: device.id,
        user_id: device.userId,
        push_token: device.pushToken,
        platform: device.platform,
      });

      if (error) throw error;

      return Result.ok(undefined);
    } catch (error: any) {
      console.error('Error saving device:', error);
      return Result.fail(error.message || 'Failed to save device');
    }
  }

  private mapToUser(data: any): User {
    return {
      id: data.id,
      roles: data.roles || ['LEARNER'],
      email: data.email,
      phone: data.phone,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
