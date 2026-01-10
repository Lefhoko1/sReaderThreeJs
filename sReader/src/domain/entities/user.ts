import { ID, Timestamp, Role } from '../../shared/types';

export interface User {
  id: ID;
  roles: Role[];
  email?: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Profile {
  userId: ID;
  bio?: string;
  locationConsent: boolean;
  notificationPrefs?: Record<string, boolean>;
}

export interface Location {
  userId: ID;
  lat: number;
  lng: number;
  address?: string;
  updatedAt: Timestamp;
}

export interface Device {
  id: ID;
  userId: ID;
  pushToken?: string;
  platform: 'ios' | 'android' | 'web';
}
