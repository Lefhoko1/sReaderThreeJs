import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { Card, Text, Button, useTheme, Chip, Badge, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';
import { Assignment } from '../../domain/entities/assignment';
import { Notification } from '../../domain/entities/notification';
import { Attempt } from '../../domain/entities/attempt';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const HORIZONTAL_CARD_WIDTH = width * 0.75;

export const HomeScreen = observer(() => {
  const theme = useTheme();
  const { dashboardVM, authVM } = useAppContext();

  useEffect(() => {
    dashboardVM.loadDashboard();
  }, []);

  if (dashboardVM.loading || !dashboardVM.dashboardData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const { dashboardData } = dashboardVM;
  const unreadCount = dashboardData.unreadNotificationCount;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Welcome Message */}
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <View>
          <Text
            variant="headlineSmall"
            style={{ color: theme.colors.onPrimaryContainer, marginBottom: 4 }}
          >
            Welcome back, {authVM.currentUser?.displayName?.split(' ')[0]}! 👋
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onPrimaryContainer, opacity: 0.8 }}
          >
            Here's what you need to focus on today
          </Text>
        </View>
      </View>

      {/* Notifications Badge */}
      {unreadCount > 0 && (
        <View style={[styles.notificationBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <MaterialCommunityIcons
            name="bell-alert"
            size={20}
            color={theme.colors.error}
            style={{ marginRight: 8 }}
          />
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.onErrorContainer, flex: 1 }}
          >
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
          <Badge>{unreadCount}</Badge>
        </View>
      )}

      {/* Scheduled Assignments Section */}
      {dashboardData.scheduledAssignments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginLeft: 8, flex: 1 }}>
              Scheduled for You
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.outline }}
            >
              {dashboardData.scheduledAssignments.length}
            </Text>
          </View>

          <FlatList
            horizontal
            data={dashboardData.scheduledAssignments}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <ScheduledAssignmentCard
                schedule={item}
                width={HORIZONTAL_CARD_WIDTH}
                theme={theme}
              />
            )}
          />
        </View>
      )}

      {/* Notifications Section */}
      {dashboardData.notifications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="bell" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginLeft: 8, flex: 1 }}>
              Notifications
            </Text>
            <Button
              mode="text"
              compact
              labelStyle={{ fontSize: 11 }}
            >
              View All
            </Button>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            {dashboardData.notifications.slice(0, 5).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                theme={theme}
                onPress={() => dashboardVM.markNotificationAsRead(notification.id)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Last Attempted Assignments */}
      {dashboardData.recentAttempts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginLeft: 8, flex: 1 }}>
              Recent Activity
            </Text>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            {dashboardData.recentAttempts.slice(0, 3).map((attempt) => (
              <AttemptCard
                key={attempt.id}
                attempt={attempt}
                theme={theme}
              />
            ))}
          </View>
        </View>
      )}

      {/* New Assignments */}
      {dashboardData.upcomingAssignments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginLeft: 8, flex: 1 }}>
              New & Upcoming
            </Text>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            {dashboardData.upcomingAssignments.map((assignment) => (
              <UpcomingAssignmentCard
                key={assignment.id}
                assignment={assignment}
                theme={theme}
              />
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={[styles.section, { paddingHorizontal: 16 }]}>
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <QuickActionButton
            icon="play-circle-outline"
            label="Start Assignment"
            color={theme.colors.primary}
            theme={theme}
          />
          <QuickActionButton
            icon="trophy-outline"
            label="Leaderboard"
            color={theme.colors.tertiary}
            theme={theme}
          />
          <QuickActionButton
            icon="users-outline"
            label="Friends"
            color={theme.colors.secondary}
            theme={theme}
          />
          <QuickActionButton
            icon="book-open-outline"
            label="Resources"
            color={theme.colors.tertiaryContainer}
            theme={theme}
          />
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
});

// Scheduled Assignment Card Component
const ScheduledAssignmentCard = observer(({ schedule, width, theme }: any) => {
  const daysUntilDue = Math.ceil(
    (new Date(schedule.assignment.dueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysUntilDue <= 2;

  return (
    <Card
      style={[
        styles.horizontalCard,
        {
          width: width,
          marginRight: 12,
          backgroundColor: isUrgent ? theme.colors.errorContainer : theme.colors.surface,
        },
      ]}
    >
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.outline, marginBottom: 4, textTransform: 'uppercase' }}
            >
              {daysUntilDue} days left
            </Text>
            <Text
              variant="titleSmall"
              numberOfLines={2}
              style={{ marginBottom: 8, color: theme.colors.onSurface }}
            >
              {schedule.assignment.title}
            </Text>
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {schedule.assignment.description}
            </Text>
          </View>
          {isUrgent && (
            <Chip
              icon="alert-circle"
              style={{ marginLeft: 8 }}
            >
              Urgent
            </Chip>
          )}
        </View>
        <Button
          mode="contained"
          compact
          style={{ marginTop: 12, alignSelf: 'flex-start' }}
        >
          Start Now
        </Button>
      </Card.Content>
    </Card>
  );
});

// Notification Item Component
const NotificationItem = observer(({ notification, theme, onPress }: any) => {
  const isRead = !!notification.readAt;
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'FRIEND_MESSAGE':
        return 'message-text';
      case 'ASSIGNMENT_DUE_SOON':
        return 'clock-alert';
      case 'FRIEND_COMPLETED':
        return 'check-circle';
      case 'GUARDIAN_MESSAGE':
        return 'heart';
      case 'SYSTEM_LINK':
        return 'link';
      default:
        return 'bell';
    }
  };

  const getNotificationText = () => {
    const payload = notification.payload || {};
    switch (notification.type) {
      case 'FRIEND_MESSAGE':
        return `${payload.fromName}: "${payload.message}"`;
      case 'ASSIGNMENT_DUE_SOON':
        return `${payload.assignmentTitle} due in ${payload.hoursUntilDue} hours`;
      case 'FRIEND_COMPLETED':
        return `${payload.fromName} completed ${payload.assignmentTitle} (${payload.score}%)`;
      case 'GUARDIAN_MESSAGE':
        return `${payload.fromName}: "${payload.message}"`;
      case 'SYSTEM_LINK':
        return `${payload.title} - ${payload.description}`;
      default:
        return 'New notification';
    }
  };

  return (
    <Card
      style={[
        styles.notificationCard,
        {
          backgroundColor: isRead ? theme.colors.surface : theme.colors.surfaceVariant,
          marginBottom: 8,
        },
      ]}
      onPress={onPress}
    >
      <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MaterialCommunityIcons
          name={getNotificationIcon()}
          size={24}
          color={isRead ? theme.colors.outline : theme.colors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text
            variant="bodySmall"
            numberOfLines={2}
            style={{ color: theme.colors.onSurface }}
          >
            {getNotificationText()}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.outline, marginTop: 4 }}
          >
            {getTimeAgo(notification.payload?.timestamp)}
          </Text>
        </View>
        {!isRead && <Badge size={12} style={{ alignSelf: 'flex-start' }} />}
      </Card.Content>
    </Card>
  );
});

// Recent Attempt Card Component
const AttemptCard = observer(({ attempt, theme }: any) => {
  const scoreColor =
    attempt.score >= 80
      ? theme.colors.primary
      : attempt.score >= 60
        ? theme.colors.secondary
        : theme.colors.error;

  return (
    <Card
      style={[styles.attemptCard, { backgroundColor: theme.colors.surfaceVariant, marginBottom: 12 }]}
    >
      <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text variant="labelSmall" style={{ color: theme.colors.outline, marginBottom: 4 }}>
            {attempt.mode === 'MULTI' ? '👥 Group Mode' : '🎯 Solo Mode'}
          </Text>
          <Text variant="titleSmall" numberOfLines={1} style={{ marginBottom: 4 }}>
            {attempt.assignment.title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Completed {getTimeAgo(attempt.endedAt)}
          </Text>
        </View>
        <View style={{ alignItems: 'center', paddingLeft: 16 }}>
          <Text
            variant="headlineSmall"
            style={{ color: scoreColor, fontWeight: 'bold' }}
          >
            {attempt.score}%
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
});

// Upcoming Assignment Card Component
const UpcomingAssignmentCard = observer(({ assignment, theme }: any) => {
  return (
    <Card
      style={[styles.assignmentCard, { backgroundColor: theme.colors.surface, marginBottom: 12 }]}
    >
      <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.outline, marginBottom: 4, textTransform: 'uppercase' }}
          >
            🆕 New Assignment
          </Text>
          <Text variant="titleSmall" numberOfLines={1} style={{ marginBottom: 4 }}>
            {assignment.title}
          </Text>
          <Text variant="bodySmall" numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant }}>
            {assignment.description}
          </Text>
        </View>
        <Button
          mode="contained-tonal"
          compact
          style={{ marginLeft: 8, marginTop: 4 }}
        >
          View
        </Button>
      </Card.Content>
    </Card>
  );
});

// Quick Action Button Component
const QuickActionButton = observer(({ icon, label, color, theme }: any) => {
  return (
    <View style={styles.actionButton}>
      <Card
        style={{
          backgroundColor: theme.colors.primaryContainer,
          width: '100%',
          aspectRatio: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon} size={32} color={theme.colors.primary} />
      </Card>
      <Text variant="labelSmall" style={{ marginTop: 8, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
});

// Helper function to format time ago
function getTimeAgo(timestamp?: string): string {
  if (!timestamp) return 'Recently';
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  notificationBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalCard: {
    borderRadius: 16,
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 8,
  },
  attemptCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  assignmentCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
  },
});
