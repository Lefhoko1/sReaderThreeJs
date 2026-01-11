import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  useTheme,
  ActivityIndicator,
  Avatar,
  Chip,
  Divider,
  Surface,
  Card,
} from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';
import { FriendshipViewModel } from '../../application/viewmodels/FriendshipViewModel';

type ViewMode = 'profile' | 'request' | 'friend';

interface StudentProfileScreenProps {
  studentId: string;
  viewMode?: ViewMode; // 'profile' for discovery, 'request' for incoming request, 'friend' for viewing friends
  friendshipId?: string; // Required if viewMode is 'request'
  onBack: () => void;
  onAction?: () => void; // Called after accept/decline/request
}

export const StudentProfileScreen = observer(
  ({
    studentId,
    viewMode = 'profile',
    friendshipId,
    onBack,
    onAction,
  }: StudentProfileScreenProps) => {
    const theme = useTheme();
    const { authVM, userRepo, friendshipRepo } = useAppContext();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [friendshipVM] = useState(
      () => new FriendshipViewModel(friendshipRepo, userRepo)
    );

    const currentUser = authVM.currentUser;

    useEffect(() => {
      loadStudentProfile();
    }, [studentId]);

    const loadStudentProfile = async () => {
      try {
        setLoading(true);
        const result = await userRepo.getUserById(studentId);
        if (!result.ok) throw new Error(result.error);
        setStudent(result.value);
      } catch (err) {
        console.error('Error loading student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleSendRequest = async () => {
      if (!currentUser) return;
      try {
        setActionLoading(true);
        await friendshipVM.sendFriendRequest(studentId, currentUser.id);
        onAction?.();
      } finally {
        setActionLoading(false);
      }
    };

    const handleAcceptRequest = async () => {
      if (!friendshipId) return;
      try {
        setActionLoading(true);
        await friendshipVM.acceptRequest(friendshipId);
        onAction?.();
      } finally {
        setActionLoading(false);
      }
    };

    const handleDeclineRequest = async () => {
      if (!friendshipId) return;
      try {
        setActionLoading(true);
        await friendshipVM.declineRequest(friendshipId);
        onAction?.();
      } finally {
        setActionLoading(false);
      }
    };

    const handleUnfriend = async () => {
      if (!friendshipId) return;
      try {
        setActionLoading(true);
        await friendshipVM.removeFriend(friendshipId);
        onAction?.();
      } finally {
        setActionLoading(false);
      }
    };

    if (loading) {
      return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={onBack} />
            <Text variant="headlineSmall">Profile</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      );
    }

    if (!student) {
      return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={onBack} />
            <Text variant="headlineSmall">Profile</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <Text>Student not found</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={onBack} />
          <Text variant="headlineSmall">
            {viewMode === 'request' ? 'Friend Request' : viewMode === 'friend' ? 'Friend' : 'Profile'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Header Section */}
          <Surface style={[styles.profileSection, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Avatar.Image
              size={120}
              source={{ uri: student.avatarUrl || 'https://via.placeholder.com/120' }}
              style={styles.avatar}
            />
            <Text variant="headlineMedium" style={styles.name}>
              {student.displayName}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {student.email}
            </Text>

            {/* Roles/Badge */}
            <View style={styles.rolesContainer}>
              {student.roles?.map((role: string, idx: number) => (
                <Chip
                  key={idx}
                  mode="outlined"
                  style={{ marginHorizontal: 4, marginVertical: 4 }}
                >
                  {role}
                </Chip>
              ))}
            </View>
          </Surface>

          {/* User Info Section */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                About
              </Text>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Email:
                </Text>
                <Text variant="bodyMedium" selectable>
                  {student.email || 'Not provided'}
                </Text>
              </View>

              {student.phone && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Phone:
                  </Text>
                  <Text variant="bodyMedium">
                    {student.phone}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Member Since:
                </Text>
                <Text variant="bodyMedium">
                  {student.createdAt
                    ? new Date(student.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Profile Bio Section - only show if exists */}
          {student.profile?.bio && (
            <Card style={styles.bioCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Bio
                </Text>
                <Text variant="bodyMedium">{student.profile.bio}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {viewMode === 'profile' && (
              <Button
                mode="contained"
                onPress={handleSendRequest}
                loading={actionLoading}
                disabled={actionLoading}
                style={styles.button}
              >
                Send Friend Request
              </Button>
            )}

            {viewMode === 'request' && (
              <>
                <Button
                  mode="contained"
                  onPress={handleAcceptRequest}
                  loading={actionLoading}
                  disabled={actionLoading}
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                >
                  Accept Request
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleDeclineRequest}
                  loading={actionLoading}
                  disabled={actionLoading}
                  style={styles.button}
                >
                  Decline Request
                </Button>
              </>
            )}

            {viewMode === 'friend' && (
              <Button
                mode="outlined"
                onPress={handleUnfriend}
                loading={actionLoading}
                disabled={actionLoading}
                style={[styles.button, { borderColor: theme.colors.error }]}
                textColor={theme.colors.error}
              >
                Unfriend
              </Button>
            )}
          </View>

          {/* Success/Error Messages */}
          {friendshipVM.successMessage && (
            <Card style={[styles.messageCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                <View style={styles.messageContent}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                    ✓ {friendshipVM.successMessage}
                  </Text>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => friendshipVM.clearMessages()}
                  />
                </View>
              </Card.Content>
            </Card>
          )}

          {friendshipVM.error && (
            <Card style={[styles.messageCard, { backgroundColor: theme.colors.errorContainer }]}>
              <Card.Content>
                <View style={styles.messageContent}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                    ✗ {friendshipVM.error}
                  </Text>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => (friendshipVM.error = '')}
                  />
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  email: {
    marginBottom: 12,
    opacity: 0.7,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  infoCard: {
    marginBottom: 16,
  },
  bioCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  actionButtons: {
    gap: 12,
    marginVertical: 24,
  },
  button: {
    paddingVertical: 6,
  },
  messageCard: {
    marginTop: 16,
    marginBottom: 16,
  },
  messageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
