import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, useTheme, Avatar, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';
import { FriendsWidget } from '../components/FriendsWidget';

export const GameDashboard = observer(({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const theme = useTheme();
  const { dashboardVM, authVM } = useAppContext();

  useEffect(() => {
    dashboardVM.loadDashboard();
    if (authVM.currentUser) {
      authVM.getLocation();
    }
  }, []);

  if (!dashboardVM.dashboardData) {
    return null;
  }

  const { dashboardData } = dashboardVM;
  const user = authVM.currentUser;
  const currentLocation = authVM.currentLocation;
  const unreadCount = dashboardData.unreadNotificationCount;
  const nextAssignment = dashboardData.scheduledAssignments[0]?.assignment;
  const userScore = dashboardData.totalScore || 0;
  const userLevel = Math.floor((dashboardData.totalScore || 0) / 500) + 1;
  const userRole = authVM.currentUser?.roles?.[0] || 'STUDENT';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      {/* User Profile Card */}
      <Card style={styles.profileCard} mode="elevated" elevation={1}>
        <Card.Content style={styles.profileContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Avatar.Text
              size={56}
              label={user?.displayName
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="titleMedium">
                {user?.displayName}
              </Text>
              <Chip
                icon="star"
                compact
                style={{
                  backgroundColor: theme.colors.secondaryContainer,
                  marginTop: 4,
                }}
              >
                Level {userLevel}
              </Chip>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                Score
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                {userScore.toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                Streak
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                7 days 🔥
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                Rank
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                #{dashboardData.leaderboardPosition || '--'}
              </Text>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                Level Progress
              </Text>
              <Text variant="labelSmall" style={{ fontWeight: '600' }}>
                {userScore % 500}/500 XP
              </Text>
            </View>
            <ProgressBar progress={(userScore % 500) / 500} color={theme.colors.primary} style={{ height: 8, borderRadius: 4 }} />
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions - Role Based */}
      {userRole === 'TUTOR' ? (
        <Card style={styles.card} mode="elevated" elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Tutor Actions</Text>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained-tonal"
                icon="school"
                onPress={() => onNavigate('academyManagement')}
                style={styles.actionButton}
              >
                My Academies
              </Button>
              <Button
                mode="contained-tonal"
                icon="account-group"
                onPress={() => onNavigate('tutoring')}
                style={styles.actionButton}
              >
                Students
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card} mode="elevated" elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained-tonal"
                icon="store"
                onPress={() => onNavigate('academyMarketplace')}
                style={styles.actionButton}
              >
                Browse Courses
              </Button>
              <Button
                mode="contained-tonal"
                icon="book-education"
                onPress={() => onNavigate('studentEnrollments')}
                style={styles.actionButton}
              >
                My Enrollments
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Notifications */}
      {unreadCount > 0 && (
        <Card style={styles.card} mode="elevated" elevation={1}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="bell" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>Notifications</Text>
            </View>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="text" onPress={() => onNavigate('notifications')}>
              View All
            </Button>
          </Card.Actions>
        </Card>
      )}

      {/* Next Assignment */}
      {nextAssignment && (
        <Card style={styles.card} mode="elevated" elevation={1}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clipboard-text" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>Next Assignment</Text>
            </View>
            <Text variant="titleSmall" style={{ marginTop: 8, fontWeight: '600' }}>
              {nextAssignment.title}
            </Text>
            {nextAssignment.dueAt && (
              <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.7 }}>
                Due: {new Date(nextAssignment.dueAt).toLocaleDateString()}
              </Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button mode="text" onPress={() => onNavigate('assignments')}>
              View Details
            </Button>
          </Card.Actions>
        </Card>
      )}

      {/* More Options */}
      <Card style={styles.card} mode="elevated" elevation={1}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>More</Text>
          <View style={styles.menuList}>
            <Button
              mode="text"
              icon="trophy"
              contentStyle={styles.menuItem}
              onPress={() => onNavigate('leaderboard')}
            >
              Leaderboard
            </Button>
            <Button
              mode="text"
              icon="folder-multiple"
              contentStyle={styles.menuItem}
              onPress={() => onNavigate('resources')}
            >
              Resources
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Location Card */}
      <Card style={[styles.locationCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
        <Card.Content style={styles.locationContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onTertiaryContainer, opacity: 0.7 }}>
                📍 Your Location
              </Text>
              {currentLocation ? (
                <>
                  <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer, marginTop: 4 }}>
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </Text>
                  {currentLocation.address && (
                    <Text variant="labelSmall" style={{ color: theme.colors.onTertiaryContainer, opacity: 0.8, marginTop: 2 }}>
                      {currentLocation.address}
                    </Text>
                  )}
                </>
              ) : (
                <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer, marginTop: 4 }}>
                  No location saved yet
                </Text>
              )}
            </View>
            <Button
              mode="contained-tonal"
              compact
              size="small"
              icon={currentLocation ? 'pencil' : 'plus'}
              onPress={() => onNavigate('location')}
            >
              {currentLocation ? 'Update' : 'Add'}
            </Button>
          </View>
        </Card.Content>
      </Card>

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
    </View>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  profileContent: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontWeight: '600',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsGrid: {
    gap: 8,
  },
  actionButton: {
    marginBottom: 4,
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    justifyContent: 'flex-start',
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
