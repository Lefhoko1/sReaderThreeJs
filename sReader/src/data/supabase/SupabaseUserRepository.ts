import { IUserRepository } from '../repositories/IUserRepository';
import { User, Profile, Location, Device } from '../../domain/entities/user';
import { Result, ok, err } from '../../shared/result';
import { ID, Page } from '../../shared/types';
import supabase from './supabaseClient';

export class SupabaseUserRepository implements IUserRepository {
  async getUser(id: ID): Promise<Result<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return err(error.message || 'User not found');
      }
      if (!data) {
        return err('User not found');
      }

      return ok(this.mapToUser(data));
    } catch (error: any) {
      console.error('Error getting user:', error);
      return err(error.message || 'Failed to get user');
    }
  }

  async getUserByEmail(email: string): Promise<Result<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return err(error.message || 'User not found');
      }
      if (!data) {
        return err('User not found');
      }

      return ok(this.mapToUser(data));
    } catch (error: any) {
      console.error('Error getting user by email:', error);
      return err(error.message || 'Failed to get user');
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

  async createUser(user: Omit<User, 'id'|'createdAt'|'updatedAt'>): Promise<Result<User>> {
    try {
      // Generate ID and timestamps
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      console.log('Creating user with data:', {
        id,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
      });
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id,
            email: user.email,
            phone: user.phone,
            display_name: user.displayName,
            avatar_url: user.avatarUrl,
            roles: user.roles,
            created_at: now,
            updated_at: now,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('User created successfully:', data);
      return ok(this.mapToUser(data));
    } catch (error: any) {
      console.error('Error creating user:', error);
      return err(error.message || 'Failed to create user');
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

      return ok(this.mapToUser(data));
    } catch (error: any) {
      console.error('Error updating user:', error);
      return err(error.message || 'Failed to update user');
    }
  }

  async deleteUser(id: ID): Promise<Result<boolean>> {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);

      if (error) throw error;

      return ok(true);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return err(error.message || 'Failed to delete user');
    }
  }

  async getProfile(userId: ID): Promise<Result<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return err(error.message || 'Profile not found');
      }

      // If no profile exists yet, return default profile
      if (!data) {
        return ok({
          userId,
          bio: undefined,
          locationConsent: false,
        });
      }

      return ok({
        userId: data.user_id,
        bio: data.bio,
        locationConsent: data.location_consent,
        notificationPrefs: data.notification_prefs,
      });
    } catch (error: any) {
      console.error('Error getting profile:', error);
      // Return default profile on error instead of failing
      return ok({
        userId,
        bio: undefined,
        locationConsent: false,
      });
    }
  }

  async updateProfile(profile: Profile): Promise<Result<Profile>> {
    try {
      const { error } = await supabase.from('profiles').upsert({
        user_id: profile.userId,
        bio: profile.bio,
        location_consent: profile.locationConsent,
        notification_prefs: profile.notificationPrefs,
      });

      if (error) throw error;

      return ok(profile);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return err(error.message || 'Failed to update profile');
    }
  }

  async getLocation(userId: ID): Promise<Result<Location | null>> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) return ok(null);

      return ok({
        userId: data.user_id,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        address: data.address,
        updatedAt: data.updated_at,
      });
    } catch (error: any) {
      console.error('Error getting location:', error);
      return err(error.message || 'Failed to get location');
    }
  }

  async saveLocation(location: Location): Promise<Result<Location>> {
    try {
      const { error } = await supabase.from('locations').upsert({
        user_id: location.userId,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        updated_at: location.updatedAt,
      });

      if (error) throw error;

      return ok(location);
    } catch (error: any) {
      console.error('Error saving location:', error);
      return err(error.message || 'Failed to save location');
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

      return ok(undefined);
    } catch (error: any) {
      console.error('Error saving device:', error);
      return err(error.message || 'Failed to save device');
    }
  }

  async listUsers(page: number = 1, pageSize: number = 10): Promise<Result<Page<User>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(from, to);

      if (error) throw error;

      return ok({
        items: (data || []).map(d => this.mapToUser(d)),
        total: count || 0,
        page,
        pageSize,
      });
    } catch (error: any) {
      console.error('Error listing users:', error);
      return err(error.message || 'Failed to list users');
    }
  }

  async listDevices(userId: ID): Promise<Result<Device[]>> {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return ok((data || []).map(d => ({
        id: d.id,
        userId: d.user_id,
        pushToken: d.push_token,
        platform: d.platform,
      })));
    } catch (error: any) {
      console.error('Error listing devices:', error);
      return err(error.message || 'Failed to list devices');
    }
  }

  async registerDevice(device: Device): Promise<Result<Device>> {
    try {
      const { data, error } = await supabase
        .from('devices')
        .insert([{
          id: device.id,
          user_id: device.userId,
          push_token: device.pushToken,
          platform: device.platform,
        }])
        .select()
        .single();

      if (error) throw error;

      return ok({
        id: data.id,
        userId: data.user_id,
        pushToken: data.push_token,
        platform: data.platform,
      });
    } catch (error: any) {
      console.error('Error registering device:', error);
      return err(error.message || 'Failed to register device');
    }
  }

  async revokeDevice(id: string): Promise<Result<boolean>> {
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return ok(true);
    } catch (error: any) {
      console.error('Error revoking device:', error);
      return err(error.message || 'Failed to revoke device');
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
