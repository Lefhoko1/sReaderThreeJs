/**
 * DashboardViewModel
 * Manages dashboard data including scheduled assignments, notifications, recent attempts, etc.
 */

import { makeAutoObservable } from 'mobx';
import { Assignment } from '../../domain/entities/assignment';
import { Notification } from '../../domain/entities/notification';
import { Attempt } from '../../domain/entities/attempt';
import { Schedule } from '../../domain/entities/schedule';
import { Visibility } from '../../shared/types';

export interface DashboardData {
  scheduledAssignments: (Schedule & { assignment: Assignment })[];
  upcomingAssignments: Assignment[];
  recentAttempts: (Attempt & { assignment: Assignment })[];
  notifications: Notification[];
  unreadNotificationCount: number;
}

export class DashboardViewModel {
  dashboardData: DashboardData | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Fetch all dashboard data for the home screen
   */
  async loadDashboard(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Simulated dashboard data - in production, fetch from backend
      this.dashboardData = {
        scheduledAssignments: [
          {
            id: 'schedule-1',
            studentUserId: 'user-1',
            assignmentId: 'assign-1',
            startsAt: new Date(Date.now() + 86400000).toISOString(),
            endsAt: new Date(Date.now() + 172800000).toISOString(),
            visibility: Visibility.CLASS,
            assignment: {
              id: 'assign-1',
              classId: 'class-1',
              title: 'Linear Equations Practice',
              description: 'Master solving linear equations step by step',
              contentBlocks: [],
              dueAt: new Date(Date.now() + 172800000).toISOString(),
            },
          },
          {
            id: 'schedule-2',
            studentUserId: 'user-1',
            assignmentId: 'assign-2',
            startsAt: new Date(Date.now() + 259200000).toISOString(),
            endsAt: new Date(Date.now() + 345600000).toISOString(),
            visibility: Visibility.CLASS,
            assignment: {
              id: 'assign-2',
              classId: 'class-1',
              title: 'Quadratic Functions',
              description: 'Explore parabolas and quadratic expressions',
              contentBlocks: [],
              dueAt: new Date(Date.now() + 345600000).toISOString(),
            },
          },
        ],
        upcomingAssignments: [
          {
            id: 'assign-3',
            classId: 'class-1',
            title: 'Geometry Fundamentals',
            description: 'Understanding shapes and their properties',
            contentBlocks: [],
            dueAt: new Date(Date.now() + 432000000).toISOString(),
          },
          {
            id: 'assign-4',
            classId: 'class-2',
            title: 'Essay Writing Workshop',
            description: 'Develop your academic writing skills',
            contentBlocks: [],
            dueAt: new Date(Date.now() + 518400000).toISOString(),
          },
        ],
        recentAttempts: [
          {
            id: 'attempt-1',
            assignmentId: 'assign-1',
            userId: 'user-1',
            mode: 'SOLO',
            score: 85,
            startedAt: new Date(Date.now() - 86400000).toISOString(),
            endedAt: new Date(Date.now() - 82800000).toISOString(),
            assignment: {
              id: 'assign-1',
              classId: 'class-1',
              title: 'Fractions and Decimals',
              description: 'Convert between fractions and decimals',
              contentBlocks: [],
              dueAt: new Date(Date.now() - 82800000).toISOString(),
            },
          },
          {
            id: 'attempt-2',
            assignmentId: 'assign-5',
            userId: 'user-1',
            mode: 'MULTI',
            score: 92,
            startedAt: new Date(Date.now() - 172800000).toISOString(),
            endedAt: new Date(Date.now() - 169200000).toISOString(),
            assignment: {
              id: 'assign-5',
              classId: 'class-2',
              title: 'Collaboration Challenge',
              description: 'Work with peers to solve complex problems',
              contentBlocks: [],
              dueAt: new Date(Date.now() - 169200000).toISOString(),
            },
          },
        ],
        notifications: [
          {
            id: 'notif-1',
            userId: 'user-1',
            type: 'FRIEND_MESSAGE',
            payload: {
              fromUserId: 'user-2',
              fromName: 'Sarah Chen',
              message: 'Hey! Want to study together for the math test?',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            readAt: undefined,
          },
          {
            id: 'notif-2',
            userId: 'user-1',
            type: 'ASSIGNMENT_DUE_SOON',
            payload: {
              assignmentId: 'assign-1',
              assignmentTitle: 'Linear Equations Practice',
              hoursUntilDue: 24,
              timestamp: new Date(Date.now() - 1800000).toISOString(),
            },
            readAt: undefined,
          },
          {
            id: 'notif-3',
            userId: 'user-1',
            type: 'FRIEND_COMPLETED',
            payload: {
              fromUserId: 'user-3',
              fromName: 'Alex Rodriguez',
              assignmentTitle: 'Quadratic Functions',
              score: 95,
              timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
            readAt: new Date(Date.now() - 5400000).toISOString(),
          },
          {
            id: 'notif-4',
            userId: 'user-1',
            type: 'GUARDIAN_MESSAGE',
            payload: {
              fromName: 'Mrs. Smith (Guardian)',
              message: 'Checking in on your progress. Looking good!',
              timestamp: new Date(Date.now() - 10800000).toISOString(),
            },
            readAt: undefined,
          },
          {
            id: 'notif-5',
            userId: 'user-1',
            type: 'SYSTEM_LINK',
            payload: {
              title: 'New Learning Path Available',
              description: 'Advanced Calculus series is now open',
              actionUrl: '/learning-paths',
              timestamp: new Date(Date.now() - 14400000).toISOString(),
            },
            readAt: undefined,
          },
        ],
        unreadNotificationCount: 4,
      };

      this.loading = false;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load dashboard';
      this.loading = false;
    }
  }

  /**
   * Mark a notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    if (this.dashboardData) {
      const notification = this.dashboardData.notifications.find(
        (n) => n.id === notificationId
      );
      if (notification) {
        notification.readAt = new Date().toISOString();
        this.dashboardData.unreadNotificationCount = Math.max(
          0,
          this.dashboardData.unreadNotificationCount - 1
        );
      }
    }
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    if (!this.dashboardData) return [];
    return this.dashboardData.notifications.filter((n) => !n.readAt);
  }
}
