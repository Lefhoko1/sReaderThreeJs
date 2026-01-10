import { ID, Timestamp } from '../../shared/types';

export interface GamificationProfile {
  id: ID;
  userId: ID;
  points: number;
  level?: number;
  theme?: string;
}

export interface PointsLedger {
  id: ID;
  userId: ID;
  delta: number;
  reason: string;
  meta?: Record<string, unknown>;
  at: Timestamp;
}

export interface Achievement {
  id: ID;
  userId: ID;
  key: string;
  name: string;
  earnedAt: Timestamp;
  meta?: Record<string, unknown>;
}
