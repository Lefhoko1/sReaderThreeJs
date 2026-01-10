/**
 * Notification utilities for friend-related events
 */

import { Notification } from '../domain/entities/notification';

export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REQUEST_DECLINED = 'FRIEND_REQUEST_DECLINED',
  FRIEND_REMOVED = 'FRIEND_REMOVED',
}

export function createFriendRequestNotification(
  userId: string,
  fromUserId: string,
  fromUserName: string,
  friendshipId: string
): Omit<Notification, 'id' | 'readAt'> {
  return {
    userId,
    type: NotificationType.FRIEND_REQUEST,
    payload: {
      fromUserId,
      fromUserName,
      friendshipId,
      action: 'FRIEND_REQUEST',
      message: `${fromUserName} sent you a friend request`,
    },
  };
}

export function createFriendRequestAcceptedNotification(
  userId: string,
  byUserId: string,
  byUserName: string
): Omit<Notification, 'id' | 'readAt'> {
  return {
    userId,
    type: NotificationType.FRIEND_REQUEST_ACCEPTED,
    payload: {
      byUserId,
      byUserName,
      action: 'FRIEND_REQUEST_ACCEPTED',
      message: `${byUserName} accepted your friend request`,
    },
  };
}

export function createFriendRequestDeclinedNotification(
  userId: string,
  byUserId: string,
  byUserName: string
): Omit<Notification, 'id' | 'readAt'> {
  return {
    userId,
    type: NotificationType.FRIEND_REQUEST_DECLINED,
    payload: {
      byUserId,
      byUserName,
      action: 'FRIEND_REQUEST_DECLINED',
      message: `${byUserName} declined your friend request`,
    },
  };
}

export function createFriendRemovedNotification(
  userId: string,
  byUserId: string,
  byUserName: string
): Omit<Notification, 'id' | 'readAt'> {
  return {
    userId,
    type: NotificationType.FRIEND_REMOVED,
    payload: {
      byUserId,
      byUserName,
      action: 'FRIEND_REMOVED',
      message: `${byUserName} removed you from their friends`,
    },
  };
}
