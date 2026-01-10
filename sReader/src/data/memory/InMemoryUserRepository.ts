/**
 * InMemoryUserRepository - Web-compatible in-memory implementation.
 * Data stored in memory only (not persisted between sessions).
 */

import { IUserRepository } from '../repositories/IUserRepository';
import { User, Profile, Device, Location } from '../../domain/entities/user';
import { Result, ok, err } from '../../shared/result';
import { Page } from '../../shared/types';
import * as Crypto from 'expo-crypto';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private devices: Map<string, Device> = new Map();
  private locations: Map<string, Location> = new Map();

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<User>> {
    try {
      const id = Crypto.randomUUID();
      const now = new Date().toISOString();
      const fullUser: User = {
        ...user,
        id,
        createdAt: now,
        updatedAt: now,
      };

      this.users.set(id, fullUser);
      return ok(fullUser);
    } catch (e) {
      return err(String(e));
    }
  }

  async getUser(id: string): Promise<Result<User>> {
    const user = this.users.get(id);
    if (!user) return err('User not found');
    return ok(user);
  }

  async getUserById(id: string): Promise<Result<User>> {
    return this.getUser(id);
  }

  async getAllStudents(): Promise<Result<User[]>> {
    const students = Array.from(this.users.values()).filter(u => u.roles?.includes('student'));
    return ok(students);
  }

  async listUsers(page = 1, pageSize = 10): Promise<Result<Page<User>>> {
    const users = Array.from(this.users.values());
    const start = (page - 1) * pageSize;
    const items = users.slice(start, start + pageSize);

    return ok({
      items,
      total: users.length,
      page,
      pageSize,
    });
  }

  async updateUser(user: User): Promise<Result<User>> {
    const now = new Date().toISOString();
    const updated = { ...user, updatedAt: now };
    this.users.set(user.id, updated);
    return ok(updated);
  }

  async deleteUser(id: string): Promise<Result<boolean>> {
    this.users.delete(id);
    return ok(true);
  }

  async getProfile(userId: string): Promise<Result<Profile>> {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return ok({
        userId,
        bio: undefined,
        locationConsent: false,
      });
    }
    return ok(profile);
  }

  async updateProfile(profile: Profile): Promise<Result<Profile>> {
    this.profiles.set(profile.userId, profile);
    return ok(profile);
  }

  async listDevices(userId: string): Promise<Result<Device[]>> {
    const devices = Array.from(this.devices.values()).filter(d => d.userId === userId);
    return ok(devices);
  }

  async registerDevice(device: Device): Promise<Result<Device>> {
    this.devices.set(device.id, device);
    return ok(device);
  }

  async revokeDevice(id: string): Promise<Result<boolean>> {
    this.devices.delete(id);
    return ok(true);
  }

  async getLocation(userId: string): Promise<Result<Location | null>> {
    const location = this.locations.get(userId);
    return ok(location || null);
  }

  async saveLocation(location: Location): Promise<Result<Location>> {
    this.locations.set(location.userId, location);
    return ok(location);
  }
}
