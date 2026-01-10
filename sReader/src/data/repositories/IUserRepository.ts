import { Result } from '../../shared/result';
import { Page } from '../../shared/types';
import { User, Profile, Device } from '../../domain/entities/user';

export interface IUserRepository {
  createUser(user: Omit<User, 'id'|'createdAt'|'updatedAt'>): Promise<Result<User>>;
  getUser(id: string): Promise<Result<User>>;
  listUsers(page?: number, pageSize?: number): Promise<Result<Page<User>>>;
  updateUser(user: User): Promise<Result<User>>;
  deleteUser(id: string): Promise<Result<boolean>>;

  getProfile(userId: string): Promise<Result<Profile>>;
  updateProfile(profile: Profile): Promise<Result<Profile>>;

  listDevices(userId: string): Promise<Result<Device[]>>;
  registerDevice(device: Device): Promise<Result<Device>>;
  revokeDevice(id: string): Promise<Result<boolean>>;
}
