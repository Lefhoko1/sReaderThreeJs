import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Card, Text, Button, useTheme, Avatar, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';

export const GameDashboard = observer(({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const theme = useTheme();
  const { dashboardVM, authVM } = useAppContext();

  useEffect(() => {
    dashboardVM.loadDashboard();
  }, []);

  if (!dashboardVM.dashboardData) {
    return null;
  }

  const { dashboardData } = dashboardVM;
  const user = authVM.currentUser;
  const unreadCount = dashboardData.unreadNotificationCount;
  const nextAssignment = dashboardData.scheduledAssignments[0]?.assignment;
  const userScore = 2450; // Example gamification score
  const userLevel = 8;

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
      {/* Game Header - User Profile Card */}
      <Card style={[styles.profileCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content style={styles.profileContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Avatar.Text
              size={60}
              label={user?.displayName
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                {user?.displayName}
              </Text>
              <Chip
                icon="star"
                style={{
                  backgroundColor: theme.colors.tertiaryContainer,
                  marginTop: 4,
                  width: 'auto',
                }}
              >
                Level {userLevel}
              </Chip>
            </View>
          </View>

          {/* Game Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.7 }}>
                Score
              </Text>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}
              >
                {userScore.toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.7 }}>
                Streak
              </Text>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}
              >
                7 days 🔥
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.7 }}>
                Rank
              </Text>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}
              >
                #12
              </Text>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
                Level Progress
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
                250/500 XP
              </Text>
            </View>
            <ProgressBar progress={0.5} color={theme.colors.tertiary} />
          </View>
        </Card.Content>
      </Card>

      {/* Next Assignment Card */}
      {nextAssignment && (
        <Card style={[styles.featuredCard, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Card.Content>
            <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer, opacity: 0.7 }}>
              📌 UP NEXT
            </Text>
            <Text
              variant="titleSmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSecondaryContainer, marginTop: 4 }}
            >
              {nextAssignment.title}
            </Text>
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSecondaryContainer, opacity: 0.8, marginTop: 4 }}
            >
              {nextAssignment.description}
            </Text>
            <Button
              mode="contained"
              compact
              style={{ marginTop: 12 }}
              onPress={() => onNavigate('assignments')}
            >
              Start
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Menu Grid - Navigation Buttons */}
      <Text variant="titleMedium" style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 12 }}>
        Choose Your Challenge
      </Text>

      <View style={styles.menuGrid}>
        {/* Assignments Button */}
        <MenuButton
          icon="task-multiple"
          label="Assignments"
          sublabel={`${dashboardData.scheduledAssignments.length} scheduled`}
          color={theme.colors.primary}
          backgroundColor={theme.colors.primaryContainer}
          onPress={() => onNavigate('assignments')}
        />

        {/* Notifications Button */}
        <MenuButton
          icon="bell"
          label="Notifications"
          sublabel={`${unreadCount} unread`}
          badge={unreadCount}
          color={theme.colors.error}
          backgroundColor={theme.colors.errorContainer}
          onPress={() => onNavigate('notifications')}
        />

        {/* Leaderboard Button */}
        <MenuButton
          icon="trophy"
          label="Leaderboard"
          sublabel="See Rankings"
          color={theme.colors.tertiary}
          backgroundColor={theme.colors.tertiaryContainer}
          onPress={() => onNavigate('leaderboard')}
        />

        {/* Resources Button */}
        <MenuButton
          icon="book-open-outline"
          label="Resources"
          sublabel="Learning Paths"
          color={theme.colors.secondary}
          backgroundColor={theme.colors.secondaryContainer}
          onPress={() => onNavigate('resources')}
        />

        {/* Profile Button */}
        <MenuButton
          icon="account-circle"
          label="Profile"
          sublabel="My Account"
          color={theme.colors.primary}
          backgroundColor={theme.colors.primaryContainer}
          onPress={() => onNavigate('profile')}
        />

        {/* Friends Button */}
        <MenuButton
          icon="account-multiple"
          label="Friends"
          sublabel="Connect & Compete"
          color={theme.colors.tertiary}
          backgroundColor={theme.colors.tertiaryContainer}
          onPress={() => onNavigate('friends')}
        />
      </View>

      {/* Recent Achievements */}
      {dashboardData.recentAttempts.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text variant="labelMedium" style={{ marginBottom: 8, textTransform: 'uppercase' }}>
            🏅 Recent Performance
          </Text>
          {dashboardData.recentAttempts.slice(0, 2).map((attempt) => (
            <View
              key={attempt.id}
              style={[
                styles.achievementItem,
                { borderLeftColor: (attempt.score ?? 0) >= 80 ? theme.colors.primary : theme.colors.tertiary },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="labelSmall" numberOfLines={1}>
                  {attempt.assignment.title}
                </Text>
              </View>
              <Text
                variant="labelSmall"
                style={{
                  color: (attempt.score ?? 0) >= 80 ? theme.colors.primary : theme.colors.tertiary,
                  fontWeight: 'bold',
                }}
              >
                {attempt.score}%
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
    </ImageBackground>
  );
});

// Menu Button Component
const MenuButton = observer(
  ({
    icon,
    label,
    sublabel,
    badge,
    color,
    backgroundColor,
    onPress,
  }: {
    icon: any;
    label: string;
    sublabel: string;
    badge?: number;
    color: string;
    backgroundColor: string;
    onPress: () => void;
  }) => {
    const theme = useTheme();

    return (
      <Card style={styles.menuButton} onPress={onPress}>
        <Card.Content style={styles.menuButtonContent}>
          <View style={{ position: 'relative', marginBottom: 12 }}>
            <View style={[styles.iconContainer, { backgroundColor }]}>
              <MaterialCommunityIcons name={icon} size={32} color={color} />
            </View>
            {badge !== undefined && badge > 0 && (
              <View
                style={[
                  styles.badgeCircle,
                  {
                    backgroundColor: theme.colors.error,
                  },
                ]}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
          <Text variant="labelLarge" style={{ marginBottom: 2 }}>
            {label}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {sublabel}
          </Text>
        </Card.Content>
      </Card>
    );
  }
);

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 20,
  },
  profileContent: {
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 8,
  },
  featuredCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  menuButton: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 4,
  },
  menuButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    top: 0,
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
});
