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

// ============================================
// ROLE-SPECIFIC ENTITIES
// ============================================

export interface Student {
  id: ID;
  userId: ID;
  gradeLevel?: string;
  schoolName?: string;
  dateOfBirth?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Guardian {
  id: ID;
  userId: ID;
  relationshipToStudent?: string; // 'PARENT', 'GRANDPARENT', 'AUNT_UNCLE', 'SIBLING', 'OTHER'
  occupation?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GuardianStudent {
  guardianId: ID;
  studentId: ID;
  relationship: string;
  createdAt: Timestamp;
}

export interface Tutor {
  id: ID;
  userId: ID;
  bio?: string;
  specializations: string[];
  educationLevel?: string; // 'HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD'
  yearsOfExperience?: number;
  hourlyRate?: number;
  isVerified: boolean;
  verificationDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TutorAcademy {
  tutorId: ID;
  academyId: ID;
  role: string; // 'ADMIN', 'INSTRUCTOR', 'ASSISTANT'
  joinedAt: Timestamp;
}
