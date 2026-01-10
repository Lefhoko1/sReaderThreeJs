import { Result } from '../../shared/result';
import { GamificationProfile, PointsLedger, Achievement } from '../../domain/entities/gamification';

export interface IGamificationRepository {
  getProfile(userId: string): Promise<Result<GamificationProfile>>;
  updateProfile(p: GamificationProfile): Promise<Result<GamificationProfile>>;

  addPoints(userId: string, delta: number, reason: string, meta?: Record<string, unknown>): Promise<Result<PointsLedger>>;
  listPointsLedger(userId: string): Promise<Result<PointsLedger[]>>;

  unlockAchievement(userId: string, key: string, name: string, meta?: Record<string, unknown>): Promise<Result<Achievement>>;
  listAchievements(userId: string): Promise<Result<Achievement[]>>;
}
