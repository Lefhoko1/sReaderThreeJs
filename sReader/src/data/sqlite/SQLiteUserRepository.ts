/**
 * SQLiteUserRepository - Local SQLite implementation of IUserRepository.
 * Handles user CRUD operations offline.
 */

import { IUserRepository } from '../repositories/IUserRepository';
import { User, Profile, Device, Location } from '../../domain/entities/user';
import { Result, ok, err } from '../../shared/result';
import { Page } from '../../shared/types';
import { sqliteDb } from './SQLiteDatabase';
import * as Crypto from 'expo-crypto';

export class SQLiteUserRepository implements IUserRepository {
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

      await sqliteDb.run(
        `INSERT INTO users (id, roles, email, phone, displayName, avatarUrl, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullUser.id,
          JSON.stringify(fullUser.roles),
          fullUser.email,
          fullUser.phone,
          fullUser.displayName,
          fullUser.avatarUrl,
          fullUser.createdAt,
          fullUser.updatedAt,
        ]
      );

      return ok(fullUser);
    } catch (e) {
      return err(String(e));
    }
  }

  async getUser(id: string): Promise<Result<User>> {
    try {
      const row = await sqliteDb.get<any>(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      );

      if (!row) return err('User not found');

      return ok({
        ...row,
        roles: JSON.parse(row.roles),
      } as User);
    } catch (e) {
      return err(String(e));
    }
  }

  async getUserById(id: string): Promise<Result<User>> {
    return this.getUser(id);
  }

  async getAllStudents(): Promise<Result<User[]>> {
    try {
      const rows = await sqliteDb.all<any>(
        `SELECT * FROM users WHERE roles LIKE '%student%'`
      );

      return ok(rows.map(r => ({ ...r, roles: JSON.parse(r.roles) })) as User[]);
    } catch (e) {
      return err(String(e));
    }
  }

  async listUsers(page = 1, pageSize = 10): Promise<Result<Page<User>>> {
    try {
      const offset = (page - 1) * pageSize;
      const rows = await sqliteDb.all<any>(
        `SELECT * FROM users LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );

      const countRow = await sqliteDb.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM users`
      );

      return ok({
        items: rows.map(r => ({ ...r, roles: JSON.parse(r.roles) })) as User[],
        total: countRow?.count || 0,
        page,
        pageSize,
      });
    } catch (e) {
      return err(String(e));
    }
  }

  async updateUser(user: User): Promise<Result<User>> {
    try {
      const now = new Date().toISOString();
      await sqliteDb.run(
        `UPDATE users SET roles = ?, email = ?, phone = ?, displayName = ?, avatarUrl = ?, updatedAt = ?
         WHERE id = ?`,
        [
          JSON.stringify(user.roles),
          user.email,
          user.phone,
          user.displayName,
          user.avatarUrl,
          now,
          user.id,
        ]
      );

      return ok({ ...user, updatedAt: now });
    } catch (e) {
      return err(String(e));
    }
  }

  async deleteUser(id: string): Promise<Result<boolean>> {
    try {
      await sqliteDb.run(`DELETE FROM users WHERE id = ?`, [id]);
      return ok(true);
    } catch (e) {
      return err(String(e));
    }
  }

  async getProfile(userId: string): Promise<Result<Profile>> {
    try {
      const row = await sqliteDb.get<any>(
        `SELECT * FROM profiles WHERE userId = ?`,
        [userId]
      );

      if (!row) {
        return ok({
          userId,
          bio: undefined,
          locationConsent: false,
        });
      }

      return ok({
        ...row,
        notificationPrefs: row.notificationPrefs ? JSON.parse(row.notificationPrefs) : undefined,
      } as Profile);
    } catch (e) {
      return err(String(e));
    }
  }

  async updateProfile(profile: Profile): Promise<Result<Profile>> {
    try {
      await sqliteDb.run(
        `INSERT OR REPLACE INTO profiles (userId, bio, locationConsent, notificationPrefs)
         VALUES (?, ?, ?, ?)`,
        [
          profile.userId,
          profile.bio,
          profile.locationConsent ? 1 : 0,
          profile.notificationPrefs ? JSON.stringify(profile.notificationPrefs) : null,
        ]
      );

      return ok(profile);
    } catch (e) {
      return err(String(e));
    }
  }

  async listDevices(userId: string): Promise<Result<Device[]>> {
    // TODO: Implement device table in SQLite if needed for offline tracking
    return ok([]);
  }

  async registerDevice(device: Device): Promise<Result<Device>> {
    // TODO: Implement
    return ok(device);
  }

  async revokeDevice(id: string): Promise<Result<boolean>> {
    // TODO: Implement
    return ok(true);
  }

  async getLocation(userId: string): Promise<Result<Location | null>> {
    // TODO: Implement with locations table if needed
    return ok(null);
  }

  async saveLocation(location: Location): Promise<Result<Location>> {
    // TODO: Implement with locations table if needed
    return ok(location);
  }
}
