import { z } from 'zod';
import { Role } from '../types';

export const UserSchema = z.object({
  id: z.string().optional(),
  roles: z.array(z.nativeEnum(Role)).min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ProfileSchema = z.object({
  userId: z.string(),
  bio: z.string().max(500).optional(),
  locationConsent: z.boolean(),
  notificationPrefs: z.record(z.boolean()).optional(),
});

export const DeviceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  pushToken: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']),
});

export type UserInput = z.infer<typeof UserSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type DeviceInput = z.infer<typeof DeviceSchema>;
