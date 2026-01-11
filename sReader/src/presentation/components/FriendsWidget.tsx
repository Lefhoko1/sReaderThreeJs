import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Badge, Avatar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { FriendshipViewModel } from '../../application/viewmodels/FriendshipViewModel';
import { SupabaseFriendshipRepository } from '../../data/supabase/SupabaseFriendshipRepository';
import { User } from '../../domain/entities/user';

interface FriendsWidgetProps {
  userId: string;
  userRepo: any;
  onViewFriends: () => void;
}

export const FriendsWidget = observer(({
  userId,
  userRepo,
  onViewFriends,
}: FriendsWidgetProps) => {
  const theme = useTheme();
  const [friendshipVM] = useState(
    () => new FriendshipViewModel(
      new SupabaseFriendshipRepository(),
      userRepo
    )
  );

  useEffect(() => {
    loadFriendData();
  }, []);

  // Reload data when component comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFriendData();
    }, [userId])
  );

  const loadFriendData = async () => {
    await friendshipVM.loadFriends(userId);
    await friendshipVM.loadPendingRequests(userId);
  };

  const requestCount = friendshipVM.receivedRequests.length;
  const friendCount = friendshipVM.friends.length;

  // Show top 3 friends
  const displayedFriends = friendshipVM.friends.slice(0, 3);

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <MaterialCommunityIcons name="account-multiple" size={24} color={theme.colors.tertiary} />
            <Text variant="titleMedium" style={styles.title}>
              Friends & Requests
            </Text>
          </View>
          {requestCount > 0 && (
            <Badge size={28} style={{ backgroundColor: theme.colors.error }}>
              {requestCount}
            </Badge>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {friendCount}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Friends
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
              {requestCount}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Requests
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
              {friendshipVM.students.length}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              To Discover
            </Text>
          </View>
        </View>

        {/* Friend Requests Alert */}
        {requestCount > 0 && (
          <View style={[styles.alertBox, { backgroundColor: theme.colors.errorContainer }]}>
            <MaterialCommunityIcons name="alert" size={18} color={theme.colors.error} />
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.error, marginLeft: 8, flex: 1 }}
              numberOfLines={1}
            >
              You have {requestCount} friend request{requestCount > 1 ? 's' : ''}!
            </Text>
          </View>
        )}

        {/* Display Recent Friends */}
        {friendCount > 0 ? (
          <View style={styles.friendsSection}>
            <Text variant="labelSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              Recent Friends
            </Text>
            <View style={styles.friendAvatars}>
              {displayedFriends.map((friendship) => {
                const friend = friendship.user;
                if (!friend) return null;
                return (
                  <View key={friendship.id} style={styles.avatarWrapper}>
                    {friend.avatarUrl ? (
                      <Image
                        source={{ uri: friend.avatarUrl }}
                        style={styles.friendAvatar}
                      />
                    ) : (
                      <Avatar.Text
                        size={44}
                        label={friend.displayName.charAt(0).toUpperCase()}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                      />
                    )}
                    <Text
                      variant="labelSmall"
                      numberOfLines={1}
                      style={{ marginTop: 4, color: theme.colors.onSurface, textAlign: 'center' }}
                    >
                      {friend.displayName.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
              {friendCount > 3 && (
                <View style={[styles.avatarWrapper, { justifyContent: 'center' }]}>
                  <View
                    style={[
                      styles.friendAvatar,
                      {
                        backgroundColor: theme.colors.secondaryContainer,
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSecondaryContainer, fontWeight: 'bold' }}
                    >
                      +{friendCount - 3}
                    </Text>
                  </View>
                  <Text
                    variant="labelSmall"
                    style={{ marginTop: 4, color: theme.colors.onSurface, textAlign: 'center' }}
                  >
                    More
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-plus"
              size={32}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}
            >
              No friends yet. Start discovering and adding friends!
            </Text>
          </View>
        )}

        {/* Action Button */}
        <Button
          mode="contained"
          icon="account-multiple"
          onPress={onViewFriends}
          style={styles.actionButton}
        >
          View All Friends
        </Button>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  friendsSection: {
    marginVertical: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  friendAvatars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  avatarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  actionButton: {
    marginTop: 8,
  },
});
