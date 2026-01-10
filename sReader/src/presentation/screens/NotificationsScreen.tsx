import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Card, Text, Button, useTheme, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';

export const NotificationsScreen = observer(({ onBack }: { onBack: () => void }) => {
  const theme = useTheme();
  const { dashboardVM } = useAppContext();

  if (!dashboardVM.dashboardData) return null;

  const notifications = dashboardVM.dashboardData.notifications;
  const unread = notifications.filter((n) => !n.readAt);
  const read = notifications.filter((n) => n.readAt);

  const getNotificationIcon = (type: string) => {
    switch (type) {
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

  const getNotificationText = (notification: any) => {
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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'FRIEND_MESSAGE':
        return theme.colors.primary;
      case 'ASSIGNMENT_DUE_SOON':
        return theme.colors.error;
      case 'FRIEND_COMPLETED':
        return theme.colors.tertiary;
      case 'GUARDIAN_MESSAGE':
        return theme.colors.secondary;
      case 'SYSTEM_LINK':
        return theme.colors.primary;
      default:
        return theme.colors.outline;
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
          <Button
            icon="arrow-left"
            mode="text"
            onPress={onBack}
            textColor={theme.colors.onPrimaryContainer}
          >
            Back
        </Button>
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
          Notifications
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Unread Section */}
        {unread.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                  {unread.length}
                </Text>
              </View>
              <Text variant="titleSmall" style={{ marginLeft: 8 }}>
                Unread
              </Text>
            </View>

            {unread.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                theme={theme}
                getIcon={getNotificationIcon}
                getText={getNotificationText}
                getColor={getNotificationColor}
                isRead={false}
                onPress={() => dashboardVM.markNotificationAsRead(notif.id)}
              />
            ))}
          </View>
        )}

        {/* Read Section */}
        {read.length > 0 && (
          <View style={styles.section}>
            <Text variant="labelSmall" style={{ marginBottom: 12, textTransform: 'uppercase' }}>
              Earlier
            </Text>

            {read.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                theme={theme}
                getIcon={getNotificationIcon}
                getText={getNotificationText}
                getColor={getNotificationColor}
                isRead={true}
              />
            ))}
          </View>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off" size={64} color={theme.colors.outline} />
            <Text variant="titleMedium" style={{ marginTop: 16 }}>
              No Notifications
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
              You're all caught up!
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    </ImageBackground>
  );
});

const NotificationCard = observer(
  ({
    notification,
    theme,
    getIcon,
    getText,
    getColor,
    isRead,
    onPress,
  }: any) => {
    return (
      <Card
        style={[
          styles.card,
          {
            backgroundColor: isRead ? theme.colors.surface : theme.colors.surfaceVariant,
            marginBottom: 8,
          },
        ]}
        onPress={onPress}
      >
        <Card.Content style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: getColor(notification.type) + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={getIcon(notification.type)}
              size={24}
              color={getColor(notification.type)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={{ color: theme.colors.onSurface }}
            >
              {getText(notification)}
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.outline, marginTop: 4 }}
            >
              {getTimeAgo(notification.payload?.timestamp)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }
);

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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 8,
    borderRadius: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});
